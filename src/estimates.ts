import { readFile } from 'node:fs/promises';
import { Hono } from 'hono';
import { PDFDocument, rgb, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { type AppEnv, currentUser, mustConfirmEmail, requireCustomer } from './auth.js';
import { bookingRef } from './bookings.js';
import { TERM_LABELS, type PricedLine } from './catalog.js';
import { prisma } from './db.js';
import type { Booking, Prisma } from './generated/prisma/client.js';
import { COMPANY_EMAIL, customerEmailsEnabled, sendEmail } from './email.js';

export const estimateMetadata = { number: true, totalCents: true, emailSentAt: true } as const;
export const DELIVERY_FEES: Record<string,number> = {'George Town':150,'7 Mile Beach':200,'West Bay':250,'Red Bay':200,'Prospect':200,'Spotts':200,'Savannah':250,'Bodden Town':300,'East End':350,'North Side':400};
type Row = { item:string; description:string; qty:string; rate:string; total:string };
export type EstimateSnapshot = { number:number; bookingRef:string; date:string; customerName:string; company:string|null; billingAddress:string|null; email:string; phone:string|null; location:string; requestedStart:string; jobDetails:string|null; rows:Row[]; discountCents:number; deliveryCents:number|null; pricedSubtotalCents:number; totalCents:number|null };
const currency=(cents:number)=> (cents/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const asDate=(d:Date)=>d.toLocaleDateString('en-GB',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'});
const term=(t:string)=>TERM_LABELS[t]||t;

export async function estimateSnapshot(tx:Prisma.TransactionClient,b:Booking,number:number):Promise<EstimateSnapshot>{
 const lines=Array.isArray(b.items)?b.items as unknown as PricedLine[]:[];
 const products=await tx.product.findMany({where:{id:{in:lines.map(l=>l.id)}},select:{id:true,category:true,delivery:true,operatorService:true,setPart:true,addOns:true}});
 const byId=new Map(products.map(p=>[p.id,p]));
 let deliveryCents:number|null=0;const deliveryRows:Row[]=[];
 for(const line of lines){
  const p=byId.get(line.id);if(!p?.delivery||p.operatorService||p.setPart)continue;
  const portable=['Tools','Power Generation','Attachments','Construction Plant / Equipment','Ground Protection'].includes(p.category);
  if(portable&&b.rentalCollection==='pickup')continue;
  if(['weekly','monthly'].includes(line.term)){deliveryRows.push({item:'Delivery',description:`${line.name} — delivery fee waived (${term(line.term)})`,qty:'',rate:'',total:'0'});continue;}
  const qty=line.term==='hourly'?1:line.qty;const rate=b.area?DELIVERY_FEES[b.area]:undefined;
  if(rate===undefined){deliveryCents=null;deliveryRows.push({item:'Delivery',description:`${line.name} — location / charge to be confirmed`,qty:String(qty),rate:'TBC',total:'TBC'});}
  else{if(deliveryCents!==null)deliveryCents+=rate*qty*100;deliveryRows.push({item:'Delivery',description:`${line.name} — ${b.area}`,qty:String(qty),rate:currency(rate*100),total:currency(rate*qty*100)});}
 }
 const equipment=lines.filter(l=>!l.operator).reduce((sum,l)=>sum+Math.round((l.amount||0)*100),0);
 const operator=lines.filter(l=>l.operator).reduce((sum,l)=>sum+Math.round((l.amount||0)*100),0);
 const discountCents=Math.round(equipment*b.discountPercent/10000)*100;
 const pricedSubtotalCents=equipment+operator-discountCents;
 const complete=lines.length>0&&lines.every(l=>l.amount!==null)&&deliveryCents!==null;
 const totalCents=complete?pricedSubtotalCents+(deliveryCents||0):null;
 const requestedStart=b.startDate?`${asDate(b.startDate)}${b.startTime?` at ${b.startTime} (Cayman time)`:''}`:'To be confirmed';
 const jobDetails=b.jobDetails||b.requestText.match(/(?:^|\n)Job details:\s*([\s\S]*?)(?=\n\s*BOOKING ITEMS:|$)/)?.[1]?.trim()||null;
 const rows:Row[]=[];const consumed=new Set<number>();
 // Keep complete vibrator sets together, including their selected shaft and head.
 for(let i=0;i<lines.length;i++){
  if(consumed.has(i))continue;const line=lines[i],p=byId.get(line.id);
  const groups=[...new Set((p?.addOns||[]).map(id=>byId.get(id)?.setPart).filter(Boolean))];
  const parts=groups.map(group=>lines.findIndex((l,j)=>j>i&&!consumed.has(j)&&p!.addOns.includes(l.id)&&byId.get(l.id)?.setPart===group&&l.qty===line.qty&&l.term===line.term));
  const grouped=groups.length&&parts.every(j=>j>=0)?parts:[];
  grouped.forEach(j=>consumed.add(j));
  const all=[line,...grouped.map(j=>lines[j])];const amount=all.every(l=>l.amount!==null)?all.reduce((sum,l)=>sum+Math.round(l.amount!*100),0):null;
  const name=grouped.length?`${line.name} complete set — ${grouped.map(j=>lines[j].name).join('; ')}`:line.name;
  rows.push({item:line.id,description:`${name}\n${term(line.term)}${line.fuelType?`\nReturn with a full tank of ${line.fuelType==='diesel'?'diesel fuel':'gasoline'}.`:''}`,qty:String(line.qty),rate:amount===null?'TBC':currency(Math.round(amount/line.qty)),total:amount===null?'TBC':currency(amount)});
 }
 if(!rows.length)rows.push({item:'Rental',description:'Equipment and rental pricing to be confirmed. Refer to the booking request.',qty:'',rate:'TBC',total:'TBC'});
 rows.push(...deliveryRows);
 if(!complete)rows.push({item:'Pricing',description:`Priced subtotal: CI$${currency(pricedSubtotalCents+(deliveryCents||0))}. Items marked TBC require manual pricing; this is not the final total.`,qty:'',rate:'',total:''});
 if(discountCents)rows.push({item:'Loyalty',description:`${b.rewardTier||'Loyalty'} discount (${b.discountPercent}%) — equipment only; rounded to whole CI dollars`,qty:'',rate:'',total:'-'+currency(discountCents)});
 return {number,bookingRef:bookingRef(b.id),date:b.createdAt.toLocaleDateString('en-GB',{timeZone:'America/Cayman',day:'numeric',month:'short',year:'numeric'}),customerName:b.customerName,company:b.company,billingAddress:b.billingAddress,email:b.customerEmail,phone:b.phone,location:[b.siteAddress,b.area].filter(Boolean).join(', ')|| (b.rentalCollection==='pickup'?'Customer pickup':'To be confirmed'),requestedStart,jobDetails,rows,discountCents,deliveryCents,pricedSubtotalCents,totalCents};
}
let templateFiles:Promise<Buffer[]>|undefined;
function files(){return templateFiles??=Promise.all([readFile(new URL('../assets/estimates/template-clean.pdf',import.meta.url)),Promise.all([readFile(new URL('../assets/estimates/Arial.ttf',import.meta.url)),readFile(new URL('../assets/estimates/Arial-Bold.ttf',import.meta.url))])]).then(([template,fonts])=>[template,fonts[0],fonts[1]]);}
function clean(s:string){return s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/\t/g,' ');}
function wrap(text:string,font:PDFFont,size:number,width:number):string[]{
 const result:string[]=[];
 for(const para of clean(text).split('\n')){
  let line='';for(const word of para.split(/\s+/).filter(Boolean)){
   if(font.widthOfTextAtSize(line?line+' '+word:word,size)<=width){line=line?line+' '+word:word;continue;}
   if(line){result.push(line);line='';}
   for(const char of word){if(line&&font.widthOfTextAtSize(line+char,size)>width){result.push(line);line='';}line+=char;}
  }result.push(line);
 }return result;
}
function columnMoney(value:string):string{
 const numeric=Number(value.replace(/,/g,''));
 return value.trim()!==''&&Number.isFinite(numeric)?`${numeric<0?'-':''}$${currency(Math.round(Math.abs(numeric)*100))}`:value;
}
export async function renderEstimatePdf(s:EstimateSnapshot,preview=false):Promise<Uint8Array>{
 const [template,regularBytes,boldBytes]=await files();const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
 const font=await doc.embedFont(regularBytes,{subset:true}),bold=await doc.embedFont(boldBytes,{subset:true});
 const columns=[{x:45,w:70},{x:125,w:207},{x:342,w:68},{x:420,w:55},{x:485,w:84}];
 const client=[s.customerName,s.company,s.billingAddress,s.email,s.phone].filter(Boolean).join('\n');const clientLines=wrap(client,font,9,234);
 const intro=[`Booking ${s.bookingRef}`,`Requested rental: ${s.requestedStart}`,`Location: ${s.location}`,s.jobDetails?`Job details: ${s.jobDetails}`:''].filter(Boolean).join('\n');
 const rawRows:Row[]=[{item:'Booking',description:intro,qty:'',rate:'',total:''},...(clientLines.length>7?[{item:'Customer',description:client,qty:'',rate:'',total:''}]:[]),...s.rows];
 const pages:{lines:string[][];first:boolean}[][]=[[]];let used=0;const tableHeight=232;
 for(const row of rawRows){
  const cells=[row.item,row.description,row.qty,columnMoney(row.rate),columnMoney(row.total)].map((t,i)=>wrap(t,font,9,columns[i].w));let offset=0;const length=Math.max(...cells.map(c=>c.length));
  while(offset<length){
   if(tableHeight-used<22){pages.push([]);used=0;}
   const room=Math.floor((tableHeight-used-9)/11);const remaining=length-offset;
   if(offset===0&&remaining*11+9<=tableHeight&&remaining>room){pages.push([]);used=0;continue;}
   const take=Math.min(remaining,Math.max(1,room));pages.at(-1)!.push({lines:cells.map(c=>c.slice(offset,offset+take)),first:offset===0});used+=take*11+9;offset+=take;
  }
 }
 const base=await PDFDocument.load(template);
 for(let index=0;index<pages.length;index++){
  const [page]=await doc.copyPages(base,[0]);doc.addPage(page);
  const write=(text:string,x:number,top:number,size=9,strong=false)=>page.drawText(clean(text),{x,y:792-top-size,font:strong?bold:font,size,color:rgb(0,0,0)});
  const centered=(text:string,left:number,right:number,top:number,size=9)=>write(text,(left+right-font.widthOfTextAtSize(text,size))/2,top,size);
  centered(s.date,441,504,96);write(String(s.number),539.5-font.widthOfTextAtSize(String(s.number),9)/2,96,9);
  for(const [i,line]of clientLines.slice(0,7).entries())write(line,61,213+i*10,9);
  if(clientLines.length>7)write('Full details continue in the item table.',61,284,7);
  centered(s.bookingRef,337.55,481.55,299);
  const requestedBy=wrap(s.customerName,font,8,88);requestedBy.slice(0,2).forEach((line,i)=>centered(line,481.55,576,299-(requestedBy.slice(0,2).length-1)*4.5+i*9,8));
  write(`Page ${index+1} of ${pages.length}`,485,122,8);
  let top=342;
  for(const row of pages[index]){
   for(let col=0;col<5;col++)for(const [n,line]of row.lines[col].entries()){
    const numeric=col>=2;const x=numeric?columns[col].x+columns[col].w-font.widthOfTextAtSize(line,9):columns[col].x;write(line,x,top+n*11,9);
   }
   const height=Math.max(...row.lines.map(c=>c.length))*11+9;top+=height;
   page.drawLine({start:{x:41,y:792-top+4},end:{x:575,y:792-top+4},thickness:.3,color:rgb(.8,.8,.8)});
  }
  wrap('PROVISIONAL ESTIMATE\nSubject to availability and acceptance.',font,8,207).forEach((line,i)=>centered(line,120.6,337.55,591+i*11,8));
  write('TOTAL KYD $',399,638,11,true);write('TOTAL USD $',399,666,11,true);
  if(index===pages.length-1){
   for(const [cents,top]of [[s.totalCents,638],[s.totalCents===null?null:Math.round(s.totalCents/0.80),666]] as const){
    const text=cents===null?'TBC':currency(cents);const size=Math.min(12,75/bold.widthOfTextAtSize(text,1));
    write(text,569-bold.widthOfTextAtSize(text,size),top,size,true);
   }
  }else {write('Continued',516,638,9);write('Continued',516,666,9);}
  if(preview)write('SAMPLE ONLY — NOT A CUSTOMER ESTIMATE',317,150,8,true);
 }
 doc.setTitle(`Cayman Crane Estimate ${s.number}`);doc.setSubject(`Booking ${s.bookingRef}`);doc.setAuthor('Cayman Crane Company');return doc.save();
}
export async function createBookingEstimate(tx:Prisma.TransactionClient,b:Booking){
 const counter=await tx.estimateCounter.upsert({where:{id:1},create:{id:1,lastNumber:524},update:{lastNumber:{increment:1}}});
 const snapshot=await estimateSnapshot(tx,b,counter.lastNumber);const pdf=await renderEstimatePdf(snapshot);
 return tx.estimate.create({data:{number:counter.lastNumber,bookingId:b.id,snapshot:snapshot as unknown as Prisma.InputJsonValue,totalCents:snapshot.totalCents,pdf:new Uint8Array(pdf),emailRecipient:b.customerEmail},select:estimateMetadata});
}
let delivering=false;
export async function deliverEstimateEmails(number?:number){
 if(delivering||!customerEmailsEnabled())return;delivering=true;
 try{
  const jobs=await prisma.estimate.findMany({where:{emailSentAt:null,nextEmailAttemptAt:{lte:new Date()},...(number?{number}:{})},orderBy:{number:'asc'},take:5});
  for(const job of jobs){const now=new Date();const claim=await prisma.estimate.updateMany({where:{number:job.number,emailSentAt:null,nextEmailAttemptAt:{lte:now}},data:{nextEmailAttemptAt:new Date(now.getTime()+120000)}});if(!claim.count)continue;
   const s=job.snapshot as unknown as EstimateSnapshot;
   const ok=await sendEmail({to:job.emailRecipient,replyTo:COMPANY_EMAIL,idempotencyKey:`ccc-estimate-${job.number}`,subject:`Your Cayman Crane estimate #${job.number} — ${s.bookingRef}`,text:`Hello ${s.customerName},\n\nYour estimate #${job.number} for booking ${s.bookingRef} is attached.\nRequested rental: ${s.requestedStart}\nLocation: ${s.location}\n${s.totalCents===null?'Pricing includes items awaiting confirmation.':`Estimated total: CI$${currency(s.totalCents)}`}\n\nThis estimate is subject to availability and manual booking approval. Your booking is not yet confirmed. Please keep the PDF, which includes our banking details.\n\nCayman Crane Company\n(345) 916-0816`,attachments:[{filename:`Cayman-Crane-Estimate-${job.number}.pdf`,content:Buffer.from(job.pdf).toString('base64')}]});
   await prisma.estimate.update({where:{number:job.number},data:{emailAttempts:{increment:1},...(ok?{emailSentAt:new Date()}:{nextEmailAttemptAt:new Date(Date.now()+Math.min(3600000,60000*2**Math.min(job.emailAttempts,6)))})}});
  }
 }catch{console.error('Estimate email delivery paused; saved PDFs remain available and email will retry.');}finally{delivering=false;}
}
export function startEstimateEmailDelivery(){void deliverEstimateEmails();return setInterval(()=>{void deliverEstimateEmails()},30000).unref();}
export const estimates=new Hono<AppEnv>();estimates.use('*',requireCustomer);
estimates.get('/:id{[0-9]+}/estimate.pdf',async c=>{
 const user=(await currentUser(c))!;if(mustConfirmEmail(user))return c.text('Confirm your email before downloading your estimate.',403);
 const estimate=await prisma.estimate.findFirst({where:{bookingId:Number(c.req.param('id')),...(user.role==='ADMIN'?{}:{booking:{userId:user.id}})}});if(!estimate)return c.notFound();
 c.header('Content-Type','application/pdf');c.header('Content-Disposition',`attachment; filename="Cayman-Crane-Estimate-${estimate.number}.pdf"`);c.header('Cache-Control','private, no-store');c.header('X-Content-Type-Options','nosniff');return c.body(new Uint8Array(estimate.pdf));
});
