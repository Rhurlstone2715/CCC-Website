import{PDFDocument}from'pdf-lib';
import{loyaltyDiscountCents}from'./loyalty-tiers.js';
import{watermarkPdf}from'./pdf-watermarks.js';
import{prisma}from'./db.js';
import{estimateSnapshot,renderEstimatePdf,type EstimateSnapshot}from'./estimates.js';
import{sendEmail,customerEmailsEnabled,COMPANY_EMAIL}from'./email.js';
import type{Prisma}from'./generated/prisma/client.js';
import{Hono}from'hono';
import{currentUser,requireCustomer,mustConfirmEmail,type AppEnv}from'./auth.js';
export const invoiceNumber=(number:number)=>`#${number}`;
export function invoiceWideDiscount(s:EstimateSnapshot):EstimateSnapshot{
 const row=s.rows.find(r=>r.item==='Loyalty'),match=row?.description.match(/\((\d+)%\)/);
 if(!row||!match||s.totalCents===null)return s;
 const percent=Number(match[1]);if(![5,10,15].includes(percent))return s;
 const discount=loyaltyDiscountCents(s.totalCents+s.discountCents,percent);
 return {...s,discountCents:discount,totalCents:s.totalCents+s.discountCents-discount,pricedSubtotalCents:s.pricedSubtotalCents+s.discountCents-discount,rows:s.rows.map(r=>r!==row?r:{...r,description:r.description.replace(/; rounded to the nearest KYD \$5/g,'').replace('equipment only','all items'),total:'-'+(discount/100).toFixed(2)})};
}
export async function queueFinalInvoice(id:number,version:string){
 return prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT "id" FROM "Booking" WHERE "id"=${id} FOR UPDATE`;
  const b=await tx.booking.findUniqueOrThrow({where:{id}});
  if(!['APPROVED','PAID'].includes(b.status))return 'bad-transition';
  if(b.updatedAt.toISOString()!==version)return 'invoice-stale';
  const existing=await tx.finalInvoice.findUnique({where:{bookingId_bookingVersion:{bookingId:id,bookingVersion:b.updatedAt}}});
  if(existing&&!existing.supersededAt)return 'invoice-queued';
  const snapshot=await estimateSnapshot(tx,b,0);snapshot.date=new Date().toLocaleDateString('en-GB',{timeZone:'America/Cayman',day:'numeric',month:'short',year:'numeric'});
  if(snapshot.totalCents===null||snapshot.rows.some(r=>r.rate==='TBC'||r.total==='TBC'))return 'invoice-unpriced';
  const paid=b.status==='PAID'?(b.amountPaidCents??0):0;
  await tx.finalInvoice.updateMany({where:{bookingId:id,supersededAt:null},data:{supersededAt:new Date()}});
  const counter=await tx.invoiceCounter.upsert({where:{id:1},create:{id:1,lastNumber:6907},update:{lastNumber:{increment:1}}});
  const saved=await tx.finalInvoice.create({data:{number:counter.lastNumber,bookingId:id,bookingVersion:b.updatedAt,snapshot:snapshot as unknown as Prisma.InputJsonValue,pdf:new Uint8Array(),totalCents:snapshot.totalCents,amountPaidCents:paid,emailRecipient:b.customerEmail}});
  const pdf=await renderEstimatePdf(snapshot,false,undefined,{number:String(saved.number),amountPaidCents:paid});
  await tx.finalInvoice.update({where:{id:saved.id},data:{pdf:new Uint8Array(pdf)}});
  return 'invoice-queued';
 },{timeout:30000,maxWait:15000});
}
let running=false;
export async function deliverFinalInvoiceEmails(sender:typeof sendEmail=sendEmail){
 if(running||!customerEmailsEnabled())return;running=true;
 try{
  const now=new Date();const jobs=await prisma.finalInvoice.findMany({where:{emailSentAt:null,supersededAt:null,nextEmailAttemptAt:{lte:now}},orderBy:{id:'asc'},take:10});
  for(const job of jobs){
   const claimed=await prisma.finalInvoice.updateMany({where:{id:job.id,emailSentAt:null,supersededAt:null,nextEmailAttemptAt:{lte:now}},data:{nextEmailAttemptAt:new Date(now.getTime()+120000)}});if(!claimed.count)continue;
   await prisma.$transaction(async tx=>{
    await tx.$queryRaw`SELECT "id" FROM "Booking" WHERE "id"=${job.bookingId} FOR UPDATE`;
    const current=await tx.finalInvoice.findUniqueOrThrow({where:{id:job.id}});if(current.emailSentAt||current.supersededAt)return;
    const b=await tx.booking.findUniqueOrThrow({where:{id:job.bookingId}});
    if(!['APPROVED','PAID'].includes(b.status)||b.updatedAt.getTime()!==job.bookingVersion.getTime()){await tx.finalInvoice.update({where:{id:job.id},data:{supersededAt:new Date()}});return;}
    const s=job.snapshot as unknown as EstimateSnapshot,n=invoiceNumber(job.number),money=(c:number)=>(c/100).toFixed(2),balance=job.totalCents-job.amountPaidCents;
    const pdf=await watermarkPdf(job.pdf,'invoice');
    const ok=await sender({to:job.emailRecipient,replyTo:COMPANY_EMAIL,idempotencyKey:`ccc-final-invoice-${job.id}`,subject:`Invoice ${n} — ${s.bookingRef}`,text:`Hello ${s.customerName},\n\nYour invoice ${n} for completed rental/service booking ${s.bookingRef} is attached. It reflects the equipment, duration and charges confirmed by our team.\n\nTotal: KYD $${money(job.totalCents)} / USD $${money(Math.round(job.totalCents/0.80))}\nConfirmed payments: KYD $${money(job.amountPaidCents)}\n${balance<0?'Credit':'Balance due'}: KYD $${money(Math.abs(balance))}\n\n${balance>0?`Please use the banking details in the PDF and quote ${s.bookingRef}. You can upload proof of payment in your account. Loyalty points are credited only after admin payment confirmation.`:balance===0?'Paid in full. Thank you for your payment.':'Please contact our team about the credit or refund arrangement.'}\n\nThank you for choosing Cayman Crane Company.`,attachments:[{filename:`Cayman-Crane-Invoice-${job.number}.pdf`,content:Buffer.from(pdf).toString('base64')}]});
    await tx.finalInvoice.update({where:{id:job.id},data:{emailAttempts:{increment:1},...(ok?{emailSentAt:new Date()}:{nextEmailAttemptAt:new Date(Date.now()+Math.min(3600000,60000*2**Math.min(job.emailAttempts,6)))})}});
   },{timeout:25000,maxWait:15000});
  }
 }catch{console.error('Invoice email delivery paused; saved invoices will retry.');}finally{running=false;}
}
export function startFinalInvoiceDelivery(){void deliverFinalInvoiceEmails();return setInterval(()=>void deliverFinalInvoiceEmails(),30000).unref();}
export const finalInvoiceDocuments=new Hono<AppEnv>();finalInvoiceDocuments.use('*',requireCustomer);
finalInvoiceDocuments.get('/:id{[0-9]+}/invoices/:invoice',async c=>{
 const number=/^(\d+)\.pdf$/.exec(c.req.param('invoice'));if(!number)return c.notFound();
 const user=(await currentUser(c))!;if(mustConfirmEmail(user))return c.text('Confirm your email first.',403);
 const invoice=await prisma.finalInvoice.findFirst({where:{id:Number(number[1]),bookingId:Number(c.req.param('id')),...(user.role==='ADMIN'?{}:{booking:{userId:user.id},emailSentAt:{not:null}})}});if(!invoice)return c.notFound();
 c.header('Content-Type','application/pdf');c.header('Cache-Control','private, no-store');c.header('X-Content-Type-Options','nosniff');c.header('Content-Disposition',`attachment; filename="Cayman-Crane-Invoice-${invoice.number}.pdf"`);return c.body(new Uint8Array(await watermarkPdf(invoice.pdf,'invoice')));
});

// Refresh historical PDFs and percentage-discount totals from their own saved charges.
// Confirmed payments, invoice identity and email-send status remain unchanged.
export async function backfillInvoiceWatermarks(){
 let cursor=0,updated=0;
 for(;;){const invoices=await prisma.finalInvoice.findMany({where:{id:{gt:cursor}},orderBy:{id:'asc'},take:50,select:{id:true,number:true,pdf:true,snapshot:true,amountPaidCents:true,totalCents:true}});if(!invoices.length)break;
  for(const invoice of invoices){const snapshot=invoice.snapshot as unknown as EstimateSnapshot;const wordingChanged=snapshot.rows.some(row=>row.description.includes('; rounded to the nearest KYD $5'));const cleanSnapshot=invoiceWideDiscount({...snapshot,rows:snapshot.rows.map(row=>({...row,description:row.description.replace(/; rounded to the nearest KYD \$5/g,'')}))});const policyChanged=JSON.stringify(snapshot)!==JSON.stringify(cleanSnapshot);const numberingChanged=(await PDFDocument.load(invoice.pdf)).getTitle()!==`Cayman Crane Invoice #${invoice.number}`;const pdf=wordingChanged||policyChanged||numberingChanged?await renderEstimatePdf(cleanSnapshot,false,undefined,{number:String(invoice.number),amountPaidCents:invoice.amountPaidCents}):await watermarkPdf(invoice.pdf,'invoice');if(pdf!==invoice.pdf){await prisma.finalInvoice.update({where:{id:invoice.id},data:{pdf:new Uint8Array(pdf),...(wordingChanged||policyChanged?{snapshot:cleanSnapshot as unknown as Prisma.InputJsonValue,totalCents:cleanSnapshot.totalCents??invoice.totalCents}:{})}});updated++;}cursor=invoice.id;}
 }
 console.info(`Invoice watermarks ready: ${updated} historical PDFs updated.`);return updated;
}
