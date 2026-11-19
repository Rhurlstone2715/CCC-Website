// Explicitly gated, read-only inspection for the customer-authorized J&R document correction.
import {prisma} from './db.js';
import {companyNameKey} from './companies.js';
import type {EstimateSnapshot} from './estimates.js';
export async function inspectJRDocuments(){
 const bookings=await prisma.booking.findMany({where:{estimate:{isNot:null}},include:{companyAccount:{select:{name:true}},user:{select:{company:true}},estimate:true,paymentReceipts:{where:{supersededAt:null},select:{id:true,amountPaidCents:true,emailSentAt:true}}},orderBy:{createdAt:'desc'},take:300});
 return bookings.filter(b=>[b.company,b.companyAccount?.name,b.user?.company].some(n=>n&&companyNameKey(n).includes('jrconstruction'))).map(b=>{const s=b.estimate!.snapshot as unknown as EstimateSnapshot;return {bookingId:b.id,estimateNumber:b.estimate!.number,status:b.status,discountPercent:b.discountPercent,discountCents:s.discountCents,totalCents:s.totalCents,grossCents:s.totalCents===null?null:s.totalCents+s.discountCents,deliveryCents:s.deliveryCents,amountPaidCents:b.amountPaidCents,receipts:b.paymentReceipts};});
}
export async function runConfiguredDocumentCorrection(){
 if(process.env.BOOKING_DOCUMENT_CORRECTION!=='inspect-jr')return;
 try{console.log('BOOKING_DOCUMENT_CORRECTION_RESULT '+JSON.stringify(await inspectJRDocuments()));}
 catch(error){console.error('BOOKING_DOCUMENT_CORRECTION_ERROR '+(error instanceof Error?error.message:'Inspection failed'));}
}
