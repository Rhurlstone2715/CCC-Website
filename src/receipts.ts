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
 const existing=await tx.paymentReceipt.findFirst({where:{bookingId:b.id,supersededAt:null},orderBy:{id:'desc'}});
 if(existing&&existing.amountPaidCents===b.amountPaidCents&&existing.paidAt.getTime()===b.paidAt.getTime()&&(existing.snapshot as unknown as EstimateSnapshot).number===estimate.number)return existing;
 const key=`${b.id}:${randomUUID()}`;
 const snapshot=estimate.snapshot as unknown as EstimateSnapshot;
 await tx.paymentReceipt.updateMany({where:{bookingId:b.id,supersededAt:null},data:{supersededAt:new Date()}});
 const saved=await tx.paymentReceipt.create({data:{bookingId:b.id,key,amountPaidCents:b.amountPaidCents,paidAt:b.paidAt,snapshot:snapshot as unknown as Prisma.InputJsonValue,pdf:new Uint8Array(),emailRecipient:b.customerEmail}});
 const pdf=await renderEstimatePdf(snapshot,false,{number:receiptNumber(saved.id),amountPaidCents:b.amountPaidCents,paidDate:saved.createdAt.toLocaleDateString('en-GB',{timeZone:'America/Cayman',day:'numeric',month:'short',year:'numeric'})});
 return tx.paymentReceipt.update({where:{id:saved.id},data:{pdf:new Uint8Array(pdf)}});
}
let delivering=false;
export async function deliverReceiptEmails(){
 if(delivering||!customerEmailsEnabled())return;delivering=true;
 try{
  const jobs=await prisma.paymentReceipt.findMany({where:{emailSentAt:null,supersededAt:null,nextEmailAttemptAt:{lte:new Date()}},include:{booking:true},orderBy:{id:'asc'},take:10});
  for(const job of jobs){
   if(job.booking.status!=='PAID'||job.booking.amountPaidCents!==job.amountPaidCents||job.booking.paidAt?.getTime()!==job.paidAt.getTime()){await prisma.paymentReceipt.updateMany({where:{id:job.id},data:{supersededAt:new Date()}});continue;}
   const now=new Date();const claim=await prisma.paymentReceipt.updateMany({where:{id:job.id,emailSentAt:null,supersededAt:null,nextEmailAttemptAt:{lte:now}},data:{nextEmailAttemptAt:new Date(now.getTime()+120000)}});if(!claim.count)continue;
   const pdf=await watermarkPdf(job.pdf,'paid');if(pdf!==job.pdf)await prisma.paymentReceipt.update({where:{id:job.id},data:{pdf:new Uint8Array(pdf)}});
   const s=job.snapshot as unknown as EstimateSnapshot,n=receiptNumber(job.id),money=(c:number)=>(c/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),balance=s.totalCents===null?null:s.totalCents-job.amountPaidCents;
   const ok=await sendEmail({to:job.emailRecipient,replyTo:COMPANY_EMAIL,idempotencyKey:`ccc-paid-receipt-${job.id}`,subject:`Paid receipt ${n} — ${s.bookingRef}`,text:`Hello ${s.customerName},\n\nCayman Crane Company has confirmed your payment. Your PDF receipt ${n} for booking ${s.bookingRef} is attached.\n\nPayment confirmed: KYD $${money(job.amountPaidCents)} / USD $${money(Math.round(job.amountPaidCents/0.80))}\nPayment confirmed on: ${job.createdAt.toLocaleDateString('en-GB',{timeZone:'America/Cayman'})}\n${balance===null?'Your final booking total is awaiting confirmation.':balance===0?'Paid in full.':balance>0?`Remaining balance: KYD $${money(balance)}.`:`Credit: KYD $${money(-balance)}. Our team will advise on any refund or credit arrangement.`}\n\nYour loyalty points now reflect the confirmed payment on your account/company.\n\nThank you for choosing Cayman Crane Company.`,attachments:[{filename:`Cayman-Crane-Paid-Receipt-${n}.pdf`,content:Buffer.from(pdf).toString('base64')}]});
   await prisma.paymentReceipt.update({where:{id:job.id},data:{emailAttempts:{increment:1},...(ok?{emailSentAt:new Date()}:{nextEmailAttemptAt:new Date(Date.now()+Math.min(3600000,60000*2**Math.min(job.emailAttempts,6)))})}});
  }
 }catch{console.error('Paid receipt emails paused; saved receipts will retry.');}finally{delivering=false;}
}
export function startReceiptEmailDelivery(){void deliverReceiptEmails();return setInterval(()=>void deliverReceiptEmails(),30000).unref();}
