import{invoiceWideDiscount}from'./final-invoices.js';
import {watermarkPdf} from './pdf-watermarks.js';
import {randomUUID} from 'node:crypto';
import {prisma} from './db.js';
import type {Booking,Prisma} from './generated/prisma/client.js';
import {createBookingEstimate,renderEstimatePdf,type EstimateSnapshot} from './estimates.js';
import {COMPANY_EMAIL,customerEmailsEnabled,sendEmail} from './email.js';
export const receiptNumber=(id:number)=>`R-${String(id).padStart(6,'0')}`;
export async function queuePaidReceipt(tx:Prisma.TransactionClient,b:Booking){
 if(b.status!=='PAID'||b.amountPaidCents===null||!b.paidAt)return null;
 let estimate=await tx.estimate.findUnique({where:{bookingId:b.id}});
 if(!estimate){await createBookingEstimate(tx,b);estimate=await tx.estimate.findUniqueOrThrow({where:{bookingId:b.id}});}
 const snapshot=invoiceWideDiscount(estimate.snapshot as unknown as EstimateSnapshot);
 await syncIssuedInvoicePayment(tx,b);
 const existing=await tx.paymentReceipt.findFirst({where:{bookingId:b.id,supersededAt:null},orderBy:{id:'desc'}});
 if(existing&&existing.amountPaidCents===b.amountPaidCents&&existing.paidAt.getTime()===b.paidAt.getTime()&&(existing.snapshot as unknown as EstimateSnapshot).number===estimate.number&&(existing.snapshot as unknown as EstimateSnapshot).totalCents===snapshot.totalCents)return existing;
 const key=`${b.id}:${randomUUID()}`;
 await tx.paymentReceipt.updateMany({where:{bookingId:b.id,supersededAt:null},data:{supersededAt:new Date()}});
 const saved=await tx.paymentReceipt.create({data:{bookingId:b.id,key,amountPaidCents:b.amountPaidCents,paidAt:b.paidAt,snapshot:snapshot as unknown as Prisma.InputJsonValue,pdf:new Uint8Array(),emailRecipient:b.customerEmail}});
 const pdf=await renderEstimatePdf(snapshot,false,{number:receiptNumber(saved.id),amountPaidCents:b.amountPaidCents,paidDate:saved.createdAt.toLocaleDateString('en-GB',{timeZone:'America/Cayman',day:'numeric',month:'short',year:'numeric'})});
 return tx.paymentReceipt.update({where:{id:saved.id},data:{pdf:new Uint8Array(pdf)}});
}
let delivering=false;
export async function deliverReceiptEmails(){
 if(delivering||!customerEmailsEnabled())return;delivering=true;
 try{
  const jobs=await prisma.paymentReceipt.findMany({where:{emailSuppressed:false,emailSentAt:null,supersededAt:null,nextEmailAttemptAt:{lte:new Date()}},include:{booking:true},orderBy:{id:'asc'},take:10});
  for(const job of jobs){
   if(job.booking.status!=='PAID'||job.booking.amountPaidCents!==job.amountPaidCents||job.booking.paidAt?.getTime()!==job.paidAt.getTime()){await prisma.paymentReceipt.updateMany({where:{id:job.id},data:{supersededAt:new Date()}});continue;}
   const now=new Date();const claim=await prisma.paymentReceipt.updateMany({where:{id:job.id,emailSuppressed:false,emailSentAt:null,supersededAt:null,nextEmailAttemptAt:{lte:now}},data:{nextEmailAttemptAt:new Date(now.getTime()+120000)}});if(!claim.count)continue;
   const pdf=await watermarkPdf(job.pdf,'paid');if(pdf!==job.pdf)await prisma.paymentReceipt.update({where:{id:job.id},data:{pdf:new Uint8Array(pdf)}});
   const s=job.snapshot as unknown as EstimateSnapshot,n=receiptNumber(job.id),money=(c:number)=>(c/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),balance=s.totalCents===null?null:s.totalCents-job.amountPaidCents;
   const ok=await sendEmail({to:job.emailRecipient,replyTo:COMPANY_EMAIL,idempotencyKey:`ccc-paid-receipt-${job.id}`,subject:`Paid receipt ${n} — ${s.bookingRef}`,text:`Hello ${s.customerName},\n\nCayman Crane Company has confirmed your payment. Your PDF receipt ${n} for booking ${s.bookingRef} is attached.\n\nPayment confirmed: KYD $${money(job.amountPaidCents)} / USD $${money(Math.round(job.amountPaidCents/0.80))}\nPayment confirmed on: ${job.createdAt.toLocaleDateString('en-GB',{timeZone:'America/Cayman'})}\n${balance===null?'Your final booking total is awaiting confirmation.':balance===0?'Paid in full.':balance>0?`Remaining balance: KYD $${money(balance)}.`:`Credit: KYD $${money(-balance)}. Our team will advise on any refund or credit arrangement.`}\n\nYour loyalty points now reflect the confirmed payment on your account/company.\n\nThank you for choosing Cayman Crane Company.`,attachments:[{filename:`Cayman-Crane-Paid-Receipt-${n}.pdf`,content:Buffer.from(pdf).toString('base64')}]});
   await prisma.paymentReceipt.update({where:{id:job.id},data:{emailAttempts:{increment:1},...(ok?{emailSentAt:new Date()}:{nextEmailAttemptAt:new Date(Date.now()+Math.min(3600000,60000*2**Math.min(job.emailAttempts,6)))})}});
  }
 }catch{console.error('Paid receipt emails paused; saved receipts will retry.');}finally{delivering=false;}
}
export function startReceiptEmailDelivery(){void deliverReceiptEmails();return setInterval(()=>void deliverReceiptEmails(),30000).unref();}

export async function syncIssuedInvoicePayment(tx:Prisma.TransactionClient,b:Booking){
 const invoice=await tx.finalInvoice.findFirst({where:{bookingId:b.id,supersededAt:null},orderBy:{number:'desc'}});if(!invoice)return;
 const paid=b.status==='PAID'?(b.amountPaidCents??0):0;if(invoice.amountPaidCents===paid)return;
 const snapshot=invoiceWideDiscount(invoice.snapshot as unknown as EstimateSnapshot);
 const pdf=await renderEstimatePdf(snapshot,false,undefined,{number:String(invoice.number),amountPaidCents:paid});
 await tx.finalInvoice.update({where:{id:invoice.id},data:{amountPaidCents:paid,totalCents:snapshot.totalCents??invoice.totalCents,snapshot:snapshot as unknown as Prisma.InputJsonValue,pdf:new Uint8Array(pdf)}});
}
export async function refreshPaidDocumentBalances(){
 let cursor=0,updated=0;
 for(;;){const bookings=await prisma.booking.findMany({where:{id:{gt:cursor},status:'PAID',amountPaidCents:{not:null}},orderBy:{id:'asc'},take:50,select:{id:true}});if(!bookings.length)break;
  for(const target of bookings){await prisma.$transaction(async tx=>{
   await tx.$queryRaw`SELECT "id" FROM "Booking" WHERE "id"=${target.id} FOR UPDATE`;
   const b=await tx.booking.findUniqueOrThrow({where:{id:target.id}});if(b.status!=='PAID'||b.amountPaidCents===null)return;
   const receipt=await tx.paymentReceipt.findFirst({where:{bookingId:b.id,supersededAt:null},orderBy:{id:'desc'}});
   if(receipt){const before=receipt.snapshot as unknown as EstimateSnapshot,snapshot=invoiceWideDiscount(before);
    if(JSON.stringify(before)!==JSON.stringify(snapshot)){const pdf=await renderEstimatePdf(snapshot,false,{number:receiptNumber(receipt.id),amountPaidCents:receipt.amountPaidCents,paidDate:receipt.createdAt.toLocaleDateString('en-GB',{timeZone:'America/Cayman',day:'numeric',month:'short',year:'numeric'})});await tx.paymentReceipt.update({where:{id:receipt.id},data:{snapshot:snapshot as unknown as Prisma.InputJsonValue,pdf:new Uint8Array(pdf)}});updated++;}
   }
   await syncIssuedInvoicePayment(tx,b);
  },{timeout:30000,maxWait:15000});cursor=target.id;}
 }
 console.info(`Paid document balances refreshed: ${updated} receipt snapshots updated.`);return updated;
}
