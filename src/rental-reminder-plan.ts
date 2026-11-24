import{createHash}from'node:crypto';
import type{Booking,Product,User}from'./generated/prisma/client.js';
import{sessionWindow}from'./booking-sessions.js';
import{bundledAccessory,LIFTING_CATEGORIES}from'./delivery-policy.js';
import{rentalReminderSendAt,type RentalReminderInput,type ReminderItem,type ReminderKind}from'./rental-reminder-email.js';
import type{PricedLine}from'./catalog.js';
export type ReminderBooking=Pick<Booking,'id'|'status'|'rentalReturnedAt'|'customerName'|'customerEmail'|'userId'|'items'|'scheduleStart'|'scheduleEnd'|'rentalCollection'|'siteAddress'|'area'>;
type Recipient=Pick<User,'id'|'role'|'email'|'emailVerifiedAt'>;
export type ReminderProduct=Pick<Product,'id'|'name'|'category'|'rates'|'delivery'|'operatorService'|'setPart'|'addOns'|'extra'|'hidden'>;
export type ReminderPlan={key:string;bookingId:number;kind:ReminderKind;endDate:string;recipient:string;dueAt:Date;expiresAt:Date;input:RentalReminderInput};
export const reminderRecipientVerified=(b:ReminderBooking,user:Recipient|null)=>Boolean(user&&user.id===b.userId&&user.role==='CUSTOMER'&&user.emailVerifiedAt&&user.email.toLowerCase()===b.customerEmail.trim().toLowerCase());
export function weeklyMonthlyLines(items:unknown):PricedLine[]{return Array.isArray(items)?items.filter((i):i is PricedLine=>Boolean(i&&typeof i==='object'&&!i.operator&&['weekly','monthly'].includes(i.term)&&typeof i.id==='string'&&Number.isInteger(i.qty)&&i.qty>0)):[];}
export function confirmedReminderEnd(b:ReminderBooking,line:PricedLine){
 if(line.sessionStart||line.sessionEnd){const w=sessionWindow(line);return w?new Date(w.end-1-18000000).toISOString().slice(0,10):null;}
 return b.scheduleStart&&b.scheduleEnd&&b.scheduleEnd>=b.scheduleStart?b.scheduleEnd.toISOString().slice(0,10):null;
}
export function planRentalReminders(b:ReminderBooking,products:ReminderProduct[],options:{id:string;productId:string;price:number|null}[],snapshot:unknown,baseUrl:string):ReminderPlan[]{
 if(!['APPROVED','PAID'].includes(b.status)||b.rentalReturnedAt)return [];
 const rows=(snapshot as {rows?:{item?:string}[]}|null)?.rows;if(!Array.isArray(rows))return [];
 const collectionInContract=rows.some(r=>typeof r?.item==='string'&&r.item.trim().toLowerCase()==='collection');
 const byId=new Map(products.map(p=>[p.id,p]));for(const o of options){const parent=byId.get(o.productId);if(parent)byId.set(o.id,parent);}
 const all=Array.isArray(b.items)?b.items as unknown as PricedLine[]:[],machines=all.flatMap(i=>{const p=byId.get(i.id);return p&&LIFTING_CATEGORIES.includes(p.category)?[p]:[];});
 const groups=new Map<string,{end:string;mode:string;items:Map<string,ReminderItem>}>();
 for(const line of weeklyMonthlyLines(b.items)){
  const end=confirmedReminderEnd(b,line);if(!end)continue;const p=byId.get(line.id);
  const eligible=Boolean(p&&p.delivery&&!p.operatorService&&!p.setPart&&!LIFTING_CATEGORIES.includes(p.category)&&!bundledAccessory(p,machines));
  const mode=collectionInContract&&eligible&&b.rentalCollection!=='pickup'&&b.siteAddress?.trim()?'collection':b.rentalCollection==='pickup'?'return':'confirm';
  const key=`${end}:${mode}`,group=groups.get(key)??{end,mode,items:new Map<string,ReminderItem>()};
  const rates:ReminderItem['rates']={};if(p&&!p.hidden)for(const term of['daily','weekly','monthly']as const){const rate=(p.rates as Record<string,unknown>)[term];if(typeof rate==='number'&&Number.isFinite(rate)&&rate>=0)rates[term]=rate;}
  const option=options.find(o=>o.id===line.id);if(option?.price!==null&&option?.price!==undefined&&!p?.hidden)rates.daily=option.price;
  const identity=`${line.id}:${line.term}`,old=group.items.get(identity);if(old)old.quantity+=line.qty;else group.items.set(identity,{id:line.id,name:line.name,quantity:line.qty,term:line.term as 'weekly'|'monthly',rates});groups.set(key,group);
 }
 return [...groups.values()].flatMap(group=>{
  const fingerprint=createHash('sha256').update([...group.items.keys()].sort().join('|')).digest('hex').slice(0,24);
  return (['day-before','final-day']as const).map(kind=>({key:`${b.id}:${group.end}:${kind}:${fingerprint}`,bookingId:b.id,kind,endDate:group.end,recipient:b.customerEmail.trim().toLowerCase(),dueAt:rentalReminderSendAt(group.end,kind),expiresAt:new Date(`${group.end}T${kind==='day-before'?'00':'12'}:00:00-05:00`),input:{bookingId:b.id,customerName:b.customerName,confirmedEndDate:group.end,kind,collectionIncluded:group.mode==='collection',returnNeedsConfirmation:group.mode==='confirm',location:[b.siteAddress,b.area].filter(Boolean).join(', '),items:[...group.items.values()],baseUrl}}));
 });
}
