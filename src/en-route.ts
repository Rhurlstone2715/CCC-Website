import {prisma} from './db.js';
import {customerEmailsEnabled,sendEmail,COMPANY_EMAIL} from './email.js';
export const CREW_NAMES=['Leon','Gregg','Conrad','Franklin','Joseph','Marlon','Jeorge','Silvio','Molo'] as const;
export function areaEta(area:string|null):[number,number]|null{
 const a=(area??'').toLowerCase().replace(/[^a-z]/g,'');
 if(['westbay','georgetown','redbay','prospect','savannah'].includes(a))return [15,30];
 if(a==='boddentown')return [20,30];
 if(['northside','eastend'].includes(a))return [30,40];
 return null;
}
export const etaTime=(d:Date)=>d.toLocaleTimeString('en-US',{timeZone:'America/Cayman',hour:'numeric',minute:'2-digit'});
export function enRouteText(b:{id:number;customerName:string;siteAddress:string|null;area:string|null},n:{operator:string|null;rigger:string|null;etaStart:Date;etaEnd:Date}){
 const ref=`CCC-${String(b.id).padStart(5,'0')}`;
 const crew=n.operator?`Operator: ${n.operator}${n.rigger?` and Banksman/Rigger: ${n.rigger}`:''} ${n.rigger?'are':'is'}`:n.rigger?`Banksman/Rigger: ${n.rigger} is`:'The Cayman Crane delivery team is';
 return {subject:`Equipment en route — ${ref}`,text:`Hi ${b.customerName},\n\n${crew} en route to your site with equipment for booking ${ref}.\n\nEstimated arrival: ${etaTime(n.etaStart)}–${etaTime(n.etaEnd)} (Cayman time).\nSite: ${b.siteAddress||b.area||'Your booked site'}\n\nPlease ensure site access is clear and someone is available to receive the equipment. Arrival times are estimates and may vary with traffic and site conditions.\n\nFor assistance, call (345) 916-0816.\n\nCayman Crane Company`};
}
export async function notifyEnRoute(bookingId:number,input:{key:string;operator:string;rigger:string;min:string;max:string},sender:typeof sendEmail=sendEmail,now=new Date()){
 if(!customerEmailsEnabled())return 'enroute-unconfigured';
 if(!/^[0-9a-f-]{36}$/i.test(input.key)||[input.operator,input.rigger].some(n=>n&&!CREW_NAMES.includes(n as typeof CREW_NAMES[number]))||input.operator&&input.operator===input.rigger)return 'enroute-invalid';
 return prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT "id" FROM "Booking" WHERE "id"=${bookingId} FOR UPDATE`;
  const b=await tx.booking.findUnique({where:{id:bookingId}});
  if(!b||!['APPROVED','PAID'].includes(b.status)||b.rentalReturnedAt||b.rentalCollection==='pickup')return 'bad-transition';
  let notice=await tx.enRouteNotification.findUnique({where:{id:input.key}});
  if(notice&&notice.bookingId!==bookingId)return 'enroute-invalid';
  if(notice?.sentAt)return 'enroute-sent';
  if(notice&&notice.etaStart<=now)return 'enroute-stale';
  if(!notice){
   const window=areaEta(b.area)??[Number(input.min),Number(input.max)];
   if(!window.every(n=>Number.isInteger(n)&&n>=1&&n<=240)||window[1]<window[0])return 'enroute-invalid';
   notice=await tx.enRouteNotification.create({data:{id:input.key,bookingId,operator:input.operator||null,rigger:input.rigger||null,recipient:b.customerEmail,etaStart:new Date(now.getTime()+window[0]*60000),etaEnd:new Date(now.getTime()+window[1]*60000)}});
  }
  const ok=await sender({to:notice.recipient,replyTo:COMPANY_EMAIL,...enRouteText(b,notice),idempotencyKey:`enroute-${notice.id}`});
  if(!ok)return 'enroute-failed';
  await tx.enRouteNotification.update({where:{id:notice.id},data:{sentAt:new Date()}});
  return 'enroute-sent';
 },{timeout:25000,maxWait:15000});
}
