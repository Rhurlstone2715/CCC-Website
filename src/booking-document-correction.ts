import {lockInventory} from "./availability.js";
// Explicitly gated maintenance for the customer-authorized J&R document correction.
import {prisma} from './db.js';
import {companyNameKey} from './companies.js';
import type {EstimateSnapshot} from './estimates.js';
export async function inspectJRDocuments(){
 const bookings=await prisma.booking.findMany({where:{estimate:{isNot:null}},include:{companyAccount:{select:{name:true}},user:{select:{company:true}},estimate:true,paymentReceipts:{where:{supersededAt:null},select:{id:true,amountPaidCents:true,emailSentAt:true,snapshot:true}}},orderBy:{createdAt:'desc'},take:300});
 return bookings.filter(b=>[b.company,b.companyAccount?.name,b.user?.company].some(n=>n&&companyNameKey(n).includes('jrconstruction'))).map(b=>{const s=b.estimate!.snapshot as unknown as EstimateSnapshot;return {bookingId:b.id,estimateNumber:b.estimate!.number,status:b.status,discountPercent:b.discountPercent,discountCents:s.discountCents,totalCents:s.totalCents,grossCents:s.totalCents===null?null:s.totalCents+s.discountCents,deliveryCents:s.deliveryCents,amountPaidCents:b.amountPaidCents,receipts:b.paymentReceipts.map(({snapshot,...r})=>({...r,discountCents:(snapshot as unknown as EstimateSnapshot).discountCents,totalCents:(snapshot as unknown as EstimateSnapshot).totalCents}))};});
}
export async function runConfiguredDocumentCorrection(){
 const raw=process.env.BOOKING_DOCUMENT_CORRECTION;if(!raw)return;
 try{
  const result=raw==='inspect-jr'?await inspectJRDocuments():await(async()=>{const config=JSON.parse(raw);if(config.mode!=='apply-jr')throw Error('Unsupported correction');return correctJRDocuments(config)})();
  const verification=raw==='inspect-jr'?undefined:await inspectJRDocuments();
  console.log('BOOKING_DOCUMENT_CORRECTION_RESULT '+JSON.stringify({result,verification}));
 }catch(error){console.error('BOOKING_DOCUMENT_CORRECTION_ERROR '+(error instanceof Error?error.message:'Correction failed'));}
}

import {renderEstimatePdf} from './estimates.js';
import {receiptNumber} from './receipts.js';
import type {Prisma} from './generated/prisma/client.js';

type CorrectionTarget={bookingId:number;estimateNumber:number;receiptId:number;expectedDiscountCents:number;expectedTotalCents:number};
export async function correctJRDocuments(target:CorrectionTarget){
 return prisma.$transaction(async tx=>{
  await lockInventory(tx);
  const b=await tx.booking.findUniqueOrThrow({where:{id:target.bookingId},include:{companyAccount:{select:{name:true}},user:{select:{company:true}}}});
  if(![b.company,b.companyAccount?.name,b.user?.company].some(n=>n&&companyNameKey(n).includes('jrconstruction')))throw Error('Company mismatch.');
  const estimate=await tx.estimate.findUniqueOrThrow({where:{bookingId:b.id}});
  const receipt=await tx.paymentReceipt.findUniqueOrThrow({where:{id:target.receiptId}});
  if(estimate.number!==target.estimateNumber||receipt.bookingId!==b.id||receipt.supersededAt||b.status!=='PAID'||b.amountPaidCents!==221500||receipt.amountPaidCents!==221500)throw Error('Document or confirmed payment mismatch.');
  const before=estimate.snapshot as unknown as EstimateSnapshot;
  if(before.discountCents===11500&&before.totalCents===221500&&(receipt.snapshot as unknown as EstimateSnapshot).totalCents===221500)return{status:'already-correct',bookingId:b.id,estimateNumber:estimate.number,receiptId:receipt.id,discountCents:11500,totalCents:221500,amountPaidCents:b.amountPaidCents};
  if(before.discountCents!==target.expectedDiscountCents||before.totalCents!==target.expectedTotalCents||before.totalCents+before.discountCents!==233000||before.deliveryCents!==25000||b.discountPercent!==5)throw Error('Booking changed or totals do not match the authorized correction.');
  const snapshot:EstimateSnapshot={...before,discountCents:11500,pricedSubtotalCents:before.pricedSubtotalCents+before.discountCents-11500,totalCents:221500,rows:before.rows.filter(r=>r.item!=='Loyalty').concat({item:'Loyalty',description:'Silver discount — admin-approved amount',qty:'',rate:'',total:'-115.00'})};
  const estimatePdf=await renderEstimatePdf(snapshot);
  const receiptPdf=await renderEstimatePdf(snapshot,false,{number:receiptNumber(receipt.id),amountPaidCents:receipt.amountPaidCents,paidDate:receipt.createdAt.toLocaleDateString('en-GB',{timeZone:'America/Cayman',day:'numeric',month:'short',year:'numeric'})});
  await tx.estimateArchive.upsert({where:{number:estimate.number},update:{},create:{number:estimate.number,bookingId:b.id,snapshot:estimate.snapshot as Prisma.InputJsonValue,totalCents:estimate.totalCents,pdf:estimate.pdf,emailRecipient:estimate.emailRecipient,originalCreatedAt:estimate.createdAt}});
  const note='Admin-authorized J&R document correction: Silver discount KYD $115.00, booking total KYD $2,215.00. Existing confirmed payment KYD $2,215.00 and document numbers preserved. No email resend requested.';
  const changed=await tx.booking.update({where:{id:b.id},data:{loyaltyDiscountOverrideCents:11500,estimateCents:snapshot.pricedSubtotalCents,adminNote:[b.adminNote,note].filter(Boolean).join('\n')}});
  await tx.estimate.update({where:{number:estimate.number},data:{snapshot:snapshot as unknown as Prisma.InputJsonValue,totalCents:221500,pdf:new Uint8Array(estimatePdf)}});
  await tx.paymentReceipt.update({where:{id:receipt.id},data:{snapshot:snapshot as unknown as Prisma.InputJsonValue,pdf:new Uint8Array(receiptPdf)}});
  await tx.bookingRevision.create({data:{bookingId:b.id,actorId:0,actorName:'CCC document correction — admin-authorized maintenance',reason:note,before:JSON.parse(JSON.stringify({booking:b,estimateSnapshot:before,receipt:{id:receipt.id,snapshot:receipt.snapshot,pdfBase64:Buffer.from(receipt.pdf).toString('base64')}})),after:JSON.parse(JSON.stringify({booking:changed,estimateSnapshot:snapshot,receiptId:receipt.id}))}});
  return{status:'corrected',bookingId:b.id,estimateNumber:estimate.number,receiptId:receipt.id,discountCents:11500,totalCents:221500,amountPaidCents:b.amountPaidCents,estimatePdfBytes:estimatePdf.length,receiptPdfBytes:receiptPdf.length};
 },{timeout:30000,maxWait:15000});
}
