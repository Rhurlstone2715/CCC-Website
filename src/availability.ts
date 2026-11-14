import type { Booking, Prisma } from './generated/prisma/client.js';
import type { CartItem } from './catalog.js';

const HOUR=3_600_000, DAY=24*HOUR;
export const ACTIVE_BOOKINGS=['PENDING','APPROVED','PAID'] as const;
type Schedule=Pick<Booking,'startDate'|'startTime'|'scheduleStart'|'scheduleEnd'>;
export type Alternative={replaceId:string;id:string;name:string;spec:string;rate:number|null;term:string;qty:number};
type Allocation={id:string;start:number;end:number;qty:number};
export class AvailabilityError extends Error {
 constructor(public result:{error:string;conflicts?:{name:string;capacity:number}[];nextAvailable?:{date:string;time:string;label:string}|null;alternatives?:Alternative[]},public status:400|409=409){super(result.error);}
}
// Every booking creation, reopening and schedule edit uses this same transaction
// lock, so simultaneous checkouts cannot both claim the final available unit.
export async function lockInventory(tx:Prisma.TransactionClient){await tx.$queryRaw`SELECT pg_advisory_xact_lock(731945206)::text`;}
function startTime(s:Schedule){
 const date=s.scheduleStart??s.startDate;if(!date)return null;
 return Date.parse(`${date.toISOString().slice(0,10)}T${s.scheduleStart?'00:00':s.startTime??'00:00'}:00-05:00`);
}
export function rentalHours(term:string,qty:number){return term==='hourly'?Math.max(4,qty):term==='fourhour'?4:term==='weekly'?168:term==='monthly'?720:24;}
export function allocations(items:CartItem[],s:Schedule,map:Map<string,{id:string;operatorService:boolean}>,overrideStart?:number):Allocation[]{
 const start=overrideStart??startTime(s);if(start===null)return [];
 const scheduledEnd=s.scheduleStart?Date.parse(`${(s.scheduleEnd??s.scheduleStart).toISOString().slice(0,10)}T00:00:00-05:00`)+DAY:null;
 return items.flatMap(i=>{const p=map.get(i.id);return !p||p.operatorService?[]:[{id:p.id,start,end:overrideStart===undefined&&scheduledEnd!==null?Math.max(start+DAY,scheduledEnd):start+rentalHours(i.term,i.qty)*HOUR,qty:i.term==='hourly'?1:i.qty}];});
}
export function peak(rows:Allocation[]){
 const events=rows.flatMap(r=>[{time:r.start,qty:r.qty},{time:r.end,qty:-r.qty}]).sort((a,b)=>a.time-b.time||a.qty-b.qty);
 let used=0,max=0;for(const e of events){used+=e.qty;max=Math.max(max,used);}return max;
}
export async function assertAvailability(tx:Prisma.TransactionClient,items:CartItem[],schedule:Schedule,excludeId?:number){
 if(!items.length)return;
 if(!schedule.startDate&&!schedule.scheduleStart)throw new AvailabilityError({error:'Choose a rental start date and time so we can check equipment availability.'},400);
 if(!schedule.scheduleStart&&(!schedule.startTime||!/^(?:[01]\d|2[0-3]):00$/.test(schedule.startTime)))throw new AvailabilityError({error:'Choose a rental start time on the hour.'},400);
 const [products,options]=await Promise.all([tx.product.findMany(),tx.riggingOption.findMany()]);
 const map=new Map(products.map(p=>[p.id,p]));for(const o of options){const parent=map.get(o.productId);if(parent)map.set(o.id,parent);}
 for(const i of items){const p=map.get(i.id),compatible=(p?.extra as {compatibleWith?:string[]}|null)?.compatibleWith;const offeredAddon=compatible?.some(id=>items.some(item=>item.id===id));if(!p||(p.hidden&&!p.operatorService&&!offeredAddon))throw new AvailabilityError({error:'An item in your cart is no longer available. Remove it and choose equipment from the catalog.'},400);}
 const requested=allocations(items,schedule,map);
 const ids=new Set(requested.map(r=>r.id));
 const bookings=await tx.booking.findMany({where:{status:{in:[...ACTIVE_BOOKINGS]},...(excludeId?{id:{not:excludeId}}:{})},select:{items:true,startDate:true,startTime:true,scheduleStart:true,scheduleEnd:true}});
 const existing=bookings.flatMap(b=>allocations(Array.isArray(b.items)?b.items as unknown as CartItem[]:[],b,map));
 const conflicts=(rows:Allocation[])=>[...new Set(rows.map(r=>r.id))].filter(id=>{
  const own=rows.filter(r=>r.id===id);return own.some(r=>peak([...own,...existing.filter(e=>e.id===id)].filter(e=>e.start<r.end&&e.end>r.start).map(e=>({...e,start:Math.max(e.start,r.start),end:Math.min(e.end,r.end)})))>(map.get(id)?.availableQuantity??1));
 });
 const bad=conflicts(requested);if(!bad.length)return;
 const details=bad.map(id=>({name:map.get(id)!.name,capacity:map.get(id)!.availableQuantity??1}));
 const intrinsic=[...ids].some(id=>peak(requested.filter(r=>r.id===id))>(map.get(id)?.availableQuantity??1));
 let nextAvailable=null;
 if(!intrinsic){
  const start=startTime(schedule)!;
  const candidates=[...new Set(existing.filter(e=>ids.has(e.id)&&e.end>start).map(e=>Math.ceil(e.end/HOUR)*HOUR))].sort((a,b)=>a-b);
  for(const candidate of candidates){const shifted=requested.map(r=>({...r,start:r.start+candidate-start,end:r.end+candidate-start}));if(conflicts(shifted).length)continue;
   const date=new Date(candidate-5*HOUR).toISOString();nextAvailable={date:date.slice(0,10),time:date.slice(11,16),label:new Date(candidate).toLocaleString('en-US',{timeZone:'America/Cayman',dateStyle:'medium',timeStyle:'short'})+' (Cayman time)'};break;
  }
 }
 const alternatives:Alternative[]=[];
 for(const id of bad){
  const source=map.get(id)!;const sourceLines=items.filter(i=>i.id===id);if(!sourceLines.length||source.setPart||source.addOns.some(a=>map.get(a)?.setPart))continue;
  const capacity=(spec:string)=>Number(spec.match(/([\d,]+)\s*(?:ton|lb capacity)/i)?.[1]?.replace(/,/g,''))||0;
  const rank=(spec:string)=>{const base=capacity(source.spec),value=capacity(spec);return base&&value?Math.abs(value-base)+(value<base?100000:0):0;};
  const related=products.filter(p=>p.id!==id&&!p.hidden&&!p.operatorService&&!p.setPart&&(
   (['Boom Trucks','Rough Terrain Cranes','Telehandlers'].includes(source.category)&&p.category===source.category)||
   [['g100','g25'],['cord100','cord300'],['fs600','fr800c']].some(group=>group.includes(source.id)&&group.includes(p.id))
  )).sort((a,b)=>rank(a.spec)-rank(b.spec)||a.sortOrder-b.sortOrder);
  for(const candidate of related){
   if(!sourceLines.every(l=>typeof (candidate.rates as Record<string,unknown>)[l.term]==='number'))continue;
   if(items.some(i=>{const p=map.get(i.id),compat=(p?.extra as {compatibleWith?:string[]}|null)?.compatibleWith;return compat?.includes(id)&&!compat.includes(candidate.id);}))continue;
   const swapped=items.map(i=>i.id===id?{...i,id:candidate.id}:i);
   if(conflicts(allocations(swapped,schedule,map)).length)continue;
   const line=sourceLines[0];alternatives.push({replaceId:id,id:candidate.id,name:candidate.name,spec:candidate.spec,rate:(candidate.rates as Record<string,number>)[line.term]??null,term:line.term,qty:line.qty});
   if(alternatives.filter(a=>a.replaceId===id).length>=3)break;
  }
 }
 throw new AvailabilityError({error:intrinsic?`Requested quantity exceeds our inventory: ${details.map(d=>`${d.name} (${d.capacity} total)`).join(', ')}. Reduce the quantity to continue.`:`Already booked for the requested rental period; not enough units are available: ${details.map(d=>d.name).join(', ')}.${nextAvailable?` The next available start for your cart is ${nextAvailable.label}.`:''}`,conflicts:details,nextAvailable,alternatives});
}

// Compute current availability from reservation windows rather than decrementing
// physical stock. The scheduled end restores availability even if a booking stays
// PAID/PENDING; payment history and loyalty records are never changed by expiry.
export async function inventoryNow(tx:Pick<Prisma.TransactionClient,'product'|'booking'|'riggingOption'>,now=Date.now()){
 const [products,options,bookings]=await Promise.all([
  tx.product.findMany(),tx.riggingOption.findMany(),
  tx.booking.findMany({where:{status:{in:[...ACTIVE_BOOKINGS]}},select:{items:true,startDate:true,startTime:true,scheduleStart:true,scheduleEnd:true}})
 ]);
 const map=new Map(products.map(p=>[p.id,p]));for(const o of options){const parent=map.get(o.productId);if(parent)map.set(o.id,parent);}
 const used=new Map<string,number>();
 for(const b of bookings)for(const r of allocations(Array.isArray(b.items)?b.items as unknown as CartItem[]:[],b,map))if(r.start<=now&&r.end>now)used.set(r.id,(used.get(r.id)??0)+r.qty);
 return Object.fromEntries(products.filter(p=>!p.operatorService).map(p=>[p.id,{total:p.availableQuantity??1,available:Math.max(0,(p.availableQuantity??1)-(used.get(p.id)??0))}]));
}
