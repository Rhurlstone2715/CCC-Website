// Explicit, environment-gated maintenance for a customer-authorized correction.
// No HTTP endpoint; defaults to doing nothing. Inspection never writes records.
import {prisma} from './db.js';
import {companyNameKey} from './companies.js';
import {lockInventory} from './availability.js';
import {bookingRef} from './bookings.js';
import {estimateSnapshot,createBookingEstimate,deliverEstimateEmails,type EstimateSnapshot} from './estimates.js';
import {queuePaidReceipt,deliverReceiptEmails,receiptNumber} from './receipts.js';
import type {Prisma} from './generated/prisma/client.js';
type Target={mode:'inspect'|'apply';name:string;company:string;createdBefore:string;bookingId?:number;estimateNumber?:number};
const normalize=(s:string)=>s.toLowerCase().replace(/\s+/g,'').trim();
export async function runBookingTransportRepair(config:Target){
 if(!config||!['inspect','apply'].includes(config.mode)||!config.name||!config.company||!Number.isFinite(Date.parse(config.createdBefore)))throw Error('Invalid transport correction target.');
 const candidates=await prisma.booking.findMany({where:{createdAt:{lte:new Date(config.createdBefore)},OR:[{customerName:{contains:config.name.trim().split(/\s+/).at(-1)!,mode:'insensitive'}},{user:{name:{contains:config.name.trim().split(/\s+/).at(-1)!,mode:'insensitive'}}}]},include:{user:{select:{name:true,company:true}},companyAccount:{select:{name:true}},estimate:true},orderBy:[{createdAt:'desc'},{id:'desc'}],take:30});
 const candidate=candidates.find(b=>[b.customerName,b.user?.name].some(n=>n&&normalize(n)===normalize(config.name))&&[b.company,b.companyAccount?.name,...(!b.company&&!b.companyAccount?[b.user?.company]:[])].some(n=>n&&companyNameKey(n)===companyNameKey(config.company)));
 if(!candidate?.estimate)return {status:'not-found'};
 const preview=await prisma.$transaction(tx=>estimateSnapshot(tx,candidate,candidate.estimate!.number));
 const old=candidate.estimate.snapshot as unknown as EstimateSnapshot;
 const summary={bookingId:candidate.id,bookingRef:bookingRef(candidate.id),estimateNumber:candidate.estimate.number,bookingStatus:candidate.status,items:Array.isArray(candidate.items)?candidate.items.map(x=>{const i=x as {id?:string;name?:string};return {id:i.id,name:i.name};}):[],oldTransportCents:old.deliveryCents,newTransportCents:preview.deliveryCents,oldTotalCents:old.totalCents,newTotalCents:preview.totalCents,newTransportRows:preview.rows.filter(r=>['Delivery','Collection'].includes(r.item)).map(r=>({item:r.item,description:r.description,total:r.total}))};
 if(config.mode==='inspect')return {status:'inspected',...summary};
 if(candidate.id!==config.bookingId||candidate.estimate.number!==config.estimateNumber)return {status:'stale-target',...summary};
 const result=await prisma.$transaction(async tx=>{
  await lockInventory(tx);
  const b=await tx.booking.findUniqueOrThrow({where:{id:candidate.id}}),estimate=await tx.estimate.findUniqueOrThrow({where:{bookingId:b.id}});
  if(estimate.number!==config.estimateNumber||b.updatedAt.getTime()!==candidate.updatedAt.getTime())throw Error('Booking changed after inspection; correction was not applied.');
  const before=estimate.snapshot as unknown as EstimateSnapshot,current=await estimateSnapshot(tx,b,estimate.number);
  if(before.deliveryCents===current.deliveryCents)return {status:'already-correct',bookingRef:bookingRef(b.id)};
  if(before.deliveryCents===null||current.deliveryCents===null||current.deliveryCents>=before.deliveryCents||before.pricedSubtotalCents!==current.pricedSubtotalCents||before.discountCents!==current.discountCents)throw Error('Correction requires review: only a reduction in transport charges is allowed.');
  const currency=(c:number)=>(c/100).toFixed(2),collection=current.rows.find(r=>r.item==='Collection');
  const note=`Admin-authorized transport correction: attachments travel with lifting equipment with no additional delivery or pickup fee. Transport KYD $${currency(before.deliveryCents)} corrected to KYD $${currency(current.deliveryCents)}. Original payment and points unchanged.`;
  const request=b.requestText.replace(/^Pickup \/ collection.*$/gm,`Pickup / collection: ${collection?collection.total:'0.00'}`).replace(/^Estimated delivery(?: & pickup)?:.*$/gm,`Estimated delivery & pickup: KYD $${currency(current.deliveryCents)}`).replace(/^Estimated total:.*$/gm,`Estimated total: ${current.totalCents===null?'To be confirmed':`KYD $${currency(current.totalCents)}`}`);
  const changed=await tx.booking.update({where:{id:b.id},data:{requestText:request+'\n\n'+note,adminNote:[b.adminNote,note].filter(Boolean).join('\n')}});
  await tx.estimateArchive.create({data:{number:estimate.number,bookingId:b.id,snapshot:estimate.snapshot as Prisma.InputJsonValue,totalCents:estimate.totalCents,pdf:estimate.pdf,emailRecipient:estimate.emailRecipient,originalCreatedAt:estimate.createdAt}});
  await tx.estimate.delete({where:{number:estimate.number}});
  const revised=await createBookingEstimate(tx,changed,estimate.number);
  if(changed.status==='PAID')await queuePaidReceipt(tx,changed);
  await tx.bookingRevision.create({data:{bookingId:b.id,actorId:0,actorName:'CCC transport correction — admin-authorized maintenance',reason:note,before:JSON.parse(JSON.stringify(b)),after:JSON.parse(JSON.stringify(changed))}});
  return {status:'corrected',bookingRef:bookingRef(b.id),oldEstimateNumber:estimate.number,revisedEstimateNumber:revised.number,oldTransportCents:before.deliveryCents,newTransportCents:current.deliveryCents,oldTotalCents:before.totalCents,newTotalCents:current.totalCents};
 },{timeout:30000,maxWait:15000});
 if(result.status==='corrected'){await deliverEstimateEmails(result.revisedEstimateNumber);await deliverReceiptEmails();const emailed=await prisma.estimate.findUnique({where:{number:result.revisedEstimateNumber},select:{emailSentAt:true}});const receipt=await prisma.paymentReceipt.findFirst({where:{bookingId:candidate.id,supersededAt:null},orderBy:{id:'desc'},select:{id:true,emailSentAt:true}});return {...result,amountPaidCents:candidate.amountPaidCents,estimateEmailSent:Boolean(emailed?.emailSentAt),...(receipt?{receiptNumber:receiptNumber(receipt.id),receiptEmailSent:Boolean(receipt.emailSentAt)}:{})};}
 return result;
}
export async function runConfiguredTransportRepair(){
 const raw=process.env.BOOKING_TRANSPORT_REPAIR;if(!raw)return;
 try{console.log('BOOKING_TRANSPORT_REPAIR_RESULT '+JSON.stringify(await runBookingTransportRepair(JSON.parse(raw))));}
 catch(error){console.error('BOOKING_TRANSPORT_REPAIR_ERROR '+(error instanceof Error?error.message:'Correction did not complete.'));}
}
