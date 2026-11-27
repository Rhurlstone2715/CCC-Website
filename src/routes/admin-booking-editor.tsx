import {CREW_SERVICE_IDS} from "../staff-services.js";
import {loyaltyDiscountCents} from "../loyalty-tiers.js";
import {watermarkPdf} from '../pdf-watermarks.js';
import {TIERS} from '../loyalty-tiers.js';
import {sessionWindow,sessionLabel} from '../booking-sessions.js';
import {queuePaidReceipt,deliverReceiptEmails} from '../receipts.js';
import {Hono,type Context} from 'hono';
import {raw} from 'hono/html';
import {bodyLimit} from 'hono/body-limit';
import {type AppEnv,currentUser,requireAdmin,EMAIL_PATTERN} from '../auth.js';
import {prisma} from '../db.js';
import type {Booking,Prisma} from '../generated/prisma/client.js';
import {type CartItem,type PricedLine,priceItems,checkSets,TERM_LABELS} from '../catalog.js';
import {assertAvailability,AvailabilityError,lockInventory,rentalHours} from '../availability.js';
import {createBookingEstimate,deliverEstimateEmails,DELIVERY_FEES} from '../estimates.js';
import {queueAdminBookingNotices,deliverAdminPushNotifications} from '../admin-push.js';
import {verifiedCompanyMembership} from '../companies.js';
import {rewardsForUser} from '../rewards.js';
import {parseDate,bookingRef} from '../bookings.js';
import {AdminPage,pendingCount,parseAmount} from '../views/admin-page.js';
import {LIFTING_CATEGORIES} from '../delivery-policy.js';

export const adminBookingEditor=new Hono<AppEnv>();adminBookingEditor.use('*',requireAdmin);
adminBookingEditor.use('*',bodyLimit({maxSize:100000,onError:c=>c.text('Booking edit is too large.',413)}));
const text=(v:unknown,max=3000)=>typeof v==='string'?v.trim().slice(0,max):'';
const audit=(b:Booking)=>JSON.parse(JSON.stringify(b)) as Prisma.InputJsonValue;
async function editor(c:Context<AppEnv>,booking:Booking|null,values:Record<string,unknown>={},error='',status:200|400|409|500=200){
 const [users,products,options,archives,revisions]=await Promise.all([
  prisma.user.findMany({orderBy:{name:'asc'},select:{id:true,name:true,email:true,phone:true,billingAddress:true,company:true}}),
  prisma.product.findMany({orderBy:{sortOrder:'asc'}}),prisma.riggingOption.findMany(),
  booking?prisma.estimateArchive.findMany({where:{bookingId:booking.id},orderBy:{number:'desc'},select:{number:true,archivedAt:true}}):[],
  booking?prisma.bookingRevision.findMany({where:{bookingId:booking.id},orderBy:{createdAt:'desc'},take:15,select:{actorName:true,reason:true,createdAt:true}}):[]
 ]);
 const initial={userId:booking?.userId??'',customerName:booking?.customerName??'',customerEmail:booking?.customerEmail??'',phone:booking?.phone??'',company:booking?.company??'',billingAddress:booking?.billingAddress??'',siteAddress:booking?.siteAddress??'',area:booking?.area??'',startDate:(booking?.scheduleStart??booking?.startDate)?.toISOString().slice(0,10)??'',startTime:booking?.startTime??'08:00',rentalCollection:booking?.rentalCollection??'delivery',jobDetails:booking?.jobDetails??'',adminNote:booking?.adminNote??'',paidAmount:booking?.amountPaidCents===null||booking?.amountPaidCents===undefined?'':String(booking.amountPaidCents/100),reason:'',discountChoice:booking?'keep':'earned',tierDiscountReason:'',items:JSON.stringify(Array.isArray(booking?.items)?booking.items.map(x=>{const l=x as unknown as PricedLine;return CREW_SERVICE_IDS.includes(l.id)&&l.periods===undefined?{...l,qty:1,periods:l.qty}:{...l,periods:l.periods??1};}):[]),...values};
 const catalog=products.filter(p=>!p.hidden||p.operatorService||p.setPart||Boolean((p.extra as {compatibleWith?:unknown}|null)?.compatibleWith)).map(p=>({id:p.id,name:p.name,category:p.category,rates:p.rates,operator:p.operatorService}));
 for(const o of options){const p=products.find(p=>p.id===o.productId);if(p)catalog.push({id:o.id,name:`${p.name} — ${o.size}`,category:p.category,rates:{daily:o.price},operator:false});}
 let editorItems:unknown=[];try{const parsed=JSON.parse(String(initial.items||'[]'));if(Array.isArray(parsed))editorItems=parsed;}catch{}
 const data=JSON.stringify({users,catalog,items:editorItems}).replaceAll('<',String.fromCharCode(92)+'u003c');
 const field=(name:keyof typeof initial,label:string,type='text',required=false)=><label>{label}<input name={name} type={type} value={String(initial[name]??'')} required={required} /></label>;
 return c.html(<AdminPage title={booking?`Edit ${bookingRef(booking.id)}`:'Add customer booking'} user={(await currentUser(c))!} pending={await pendingCount()} active="bookings">
  <p><a href={booking?`/admin/bookings/${booking.id}`:'/admin/bookings'}>← Back to bookings</a></p><h1>{booking?`Edit ${bookingRef(booking.id)}`:'Add customer booking'}</h1>
  <p class="lede">Admin-only booking entry. Stock and totals are checked when you save. Choose whether to email the revised PDFs when saving.</p>{error?<p class="notice notice-error" role="alert">{error}</p>:null}
  <form id="adminBookingEditor" method="post" action={booking?`/admin/bookings/${booking.id}/edit`:'/admin/bookings/new'} class="form">
   {booking?<input type="hidden" name="version" value={String(values.version??booking.updatedAt.toISOString())} />:null}
   <section class="card"><h2>Customer & location</h2><div class="form-grid">
    <label>Customer account<select name="userId" id="editorCustomer"><option value="">Guest / unregistered customer</option>{users.map(u=><option value={u.id} selected={String(initial.userId)===String(u.id)}>{u.name} — {u.email}</option>)}</select></label>
    {field('customerName','Customer name','text',true)}{field('customerEmail','Estimate email','email',true)}{field('phone','Phone')}{field('company','Company')}{field('billingAddress','Billing address')}
    {field('startDate','Scheduled start date','date',true)}{field('startTime','Scheduled start time (Cayman)','time',true)}
    <label>Delivery area<select name="area"><option value="">Choose area</option>{Object.keys(DELIVERY_FEES).map(a=><option selected={initial.area===a}>{a}</option>)}</select></label>{field('siteAddress','Site address')}
    <label>Collection<select name="rentalCollection" id="editorCollection"><option value="delivery" selected={initial.rentalCollection==='delivery'}>Delivery</option><option value="pickup" selected={initial.rentalCollection==='pickup'}>Customer pickup (tools only)</option></select></label>
   </div><p id="editorDeliveryNote" class="hint" hidden>Cranes, boom trucks and telehandlers are delivery only. Their attachments share that delivery at no extra charge.</p><label>Job details<textarea name="jobDetails" rows={3}>{String(initial.jobDetails)}</textarea></label>
   {booking?.scheduleStart?<p class="hint">Changing the dates or equipment duration replaces the previous all-day schedule with the session details below. Price or discount changes alone keep the existing schedule.</p>:null}</section>
   <section class="card"><h2>Equipment, hours & rental periods</h2><p class="hint">Add a separate line for each work session. For a rain-shortened day, choose Hourly and enter actual billable hours (including half-hours); add a Daily line for the following day. Enter each session’s start and end in Cayman time. Quantity is physical units on non-hourly lines; Periods is days, weeks or months. Rate is editable; Line price overrides the calculated rental charge before rewards and transport. Blank rate means to be confirmed. Keep lunch breaks out of billable hours where appropriate.</p><div id="adminEquipmentRows" class="stack"></div><button type="button" id="addAdminEquipment" class="button secondary">Add equipment / work session</button><input name="items" id="adminBookingItems" type="hidden" value={String(initial.items)} /><p id="adminEditorTotal" class="hint" role="status"></p></section>
   <section class="card"><h2>Booking-only rewards discount</h2><label>Discount tier for this booking<select name="discountChoice" id="editorDiscountChoice">{booking?<option value="keep" selected={initial.discountChoice==='keep'}>Keep current booking discount {booking.loyaltyDiscountOverrideCents!==null?`KYD $${(booking.loyaltyDiscountOverrideCents/100).toFixed(2)} `:""}({booking.rewardTier??'Member'} — {booking.discountPercent}%)</option>:null}<option value="earned" selected={initial.discountChoice==='earned'}>Use the customer/company’s earned tier</option>{TIERS.map(t=><option value={t.name} selected={initial.discountChoice===t.name}>{t.name} — {t.discountPercent}% {t.discountPercent?'invoice discount':'(no discount)'}</option>)}</select></label><label id="editorTierReasonLabel" hidden={!TIERS.some(t=>t.name===initial.discountChoice)}>Reason for booking-only discount<input type="text" name="tierDiscountReason" id="editorTierReason" maxlength={1000} value={String(initial.tierDiscountReason)} /></label><p class="hint">Admins may apply any tier to this booking, even if the customer has not earned it. This does not change earned points, company rewards or future-booking eligibility. Discounts apply to all invoice items, including operator services, delivery and pickup. Discounts are rounded to the nearest KYD $5. The reason is kept in admin history.</p></section>
   <section class="card"><h2>Admin record</h2><label>Admin note<textarea name="adminNote" rows={3}>{String(initial.adminNote)}</textarea></label>{booking?field('reason','Reason for change','text',true):<p class="hint">This is an admin-entered booking, not a customer-signed online agreement. Arrange acceptance with the customer.</p>}
   {booking?.status==='PAID'?<><label>Confirmed amount paid (KYD)<input name="paidAmount" type="number" min="0" step="0.01" value={String(initial.paidAmount)} required /></label><p class="hint">Enter the actual payment retained after any extra charge or refund. Rewards use this confirmed payment, not the estimate.</p></>:null}
   {booking?<><button type="submit" name="emailAction" value="silent" class="button primary">Save without emailing customer</button> <button type="submit" name="emailAction" value="send" class="button secondary">Save & email revision</button><p class="hint">Saving without email updates the booking, estimate and paid receipt, with no customer revision email queued.</p></>:<button type="submit" class="button primary">Create booking & email estimate</button>}</section>
  </form><script id="adminBookingData" type="application/json">{raw(data)}</script><script src="/admin-booking-editor.js" defer></script>
  {archives.length?<section class="card"><h2>Previous estimates</h2>{archives.map(e=><p><a href={`/admin/bookings/${booking!.id}/documents/estimate-${e.number}`}>View estimate #{e.number} (replaced)</a></p>)}</section>:null}
  {revisions.length?<section class="card"><h2>Change history</h2>{revisions.map(r=><p><b>{r.actorName}</b> · {r.createdAt.toLocaleString('en-US',{timeZone:'America/Cayman'})}<br/>{r.reason}</p>)}</section>:null}
 </AdminPage>,status);
}
adminBookingEditor.get('/new',c=>editor(c,null));
adminBookingEditor.get('/:id{[0-9]+}/edit',async c=>{const b=await prisma.booking.findUnique({where:{id:Number(c.req.param('id'))}});return b?editor(c,b):c.notFound();});
async function save(c:Context<AppEnv>,existing:Booking|null){
 const body=await c.req.parseBody();const emailCustomer=!(existing&&body.emailAction==='silent');const fail=(message:string,status:400|409|500=400)=>editor(c,existing,body,message,status);
 const name=text(body.customerName,200),email=text(body.customerEmail,254).toLowerCase(),startDate=parseDate(body.startDate),startTime=text(body.startTime,5),reason=text(body.reason,1000);
 if(String(body.customerName??'').length>200||String(body.customerEmail??'').length>254||!name||!EMAIL_PATTERN.test(email)||!startDate||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(startTime))return fail('Enter the customer name, valid email and scheduled date/time.');
 if(existing&&!reason)return fail('Enter a reason for this change.');
 if(existing&&body.version!==existing.updatedAt.toISOString())return fail('Another admin changed this booking. Reload it before editing.',409);
 let input:{id:string;term:string;qty:number;periods:number;rate?:number|null;amount?:number;sessionStart?:string;sessionEnd?:string}[];
 try{input=JSON.parse(String(body.items));if(!Array.isArray(input)||!input.length||input.length>100)throw Error();for(const l of input){if((l.sessionStart!==undefined||l.sessionEnd!==undefined)&&!sessionWindow(l))throw Error();if(l.amount!==undefined&&(!Number.isFinite(l.amount)||l.amount<0||l.amount>20000000))throw Error();if(CREW_SERVICE_IDS.includes(l.id)&&!Number.isInteger(l.qty))throw Error();if(typeof l.id!=='string'||l.id.length>80||!/^(hourly|fourhour|daily|weekly|monthly|quote)$/.test(l.term)||(l.term==='hourly'?(!Number.isFinite(l.qty)||l.qty<=0||!Number.isInteger(l.qty*4)):(!Number.isInteger(l.qty)||l.qty<1))||l.qty>10000||!Number.isInteger(l.periods)||l.periods<1||l.periods>(CREW_SERVICE_IDS.includes(l.id)&&l.term==='hourly'?8784:366)||(l.term==='hourly'&&!CREW_SERVICE_IDS.includes(l.id)&&l.periods!==1)||(CREW_SERVICE_IDS.includes(l.id)&&l.term==='hourly'?1:rentalHours(l.term,l.qty))*l.periods>8784||(l.rate!==null&&l.rate!==undefined&&(!Number.isFinite(l.rate)||l.rate<0||l.rate>10000000)))throw Error();}}catch{return fail('Enter valid quantities, billable hours (quarter-hour increments), rates and prices. Each dated session needs a valid start and later end, up to one year apart.');}
 if(input.some(l=>sessionWindow(l))){const base=Date.parse(`${startDate.toISOString().slice(0,10)}T${startTime}:00-05:00`);for(const l of input)if(!l.sessionStart){l.sessionStart=new Date(base-18000000).toISOString().slice(0,16);l.sessionEnd=new Date(base+(CREW_SERVICE_IDS.includes(l.id)&&l.term==='hourly'?1:rentalHours(l.term,l.qty))*l.periods*3600000-18000000).toISOString().slice(0,16);}}
 const userId=text(body.userId)?Number(body.userId):null;if(userId!==null&&(!Number.isInteger(userId)||userId<1||userId>2147483647))return fail('Choose a valid customer account.');const customer=userId?await prisma.user.findUnique({where:{id:userId}}):null;if(userId&&!customer)return fail('Choose an existing customer account or Guest.');
 const membership=customer?await verifiedCompanyMembership(customer.id):null;
 const rewards=customer?await rewardsForUser(customer.id):null;
 const choice=body.discountChoice===undefined?'legacy':text(body.discountChoice,30),selected=TIERS.find(t=>t.name===choice),tierReason=text(body.tierDiscountReason,1000);
 if(!['legacy','earned',...(existing?['keep']:[])].includes(choice)&&!selected)return fail('Choose a valid booking discount tier.');
 if(selected&&!tierReason)return fail('Enter a reason for the booking-only tier discount.');
 const retain=choice==='keep'||choice==='legacy'&&existing?.userId===userId;
 const discountPercent=selected?selected.discountPercent:retain&&existing?existing.discountPercent:rewards?.discountPercent??0;
 const rewardTier=selected?selected.name:retain&&existing?existing.rewardTier:rewards?.tier??'Member';
 const discountAudit=selected?`Booking-only ${selected.name} tier (${selected.discountPercent}%): ${tierReason}`:choice==='earned'?'Use the customer/company earned tier.':'';
 const setIssue=await checkSets(input);if(setIssue)return fail(setIssue);
 const priced=await priceItems(input,discountPercent);
 const lines=priced.lines.map((l,i)=>{const source=input[i],rate=source.rate===undefined?l.rate:source.rate,calculated=rate===null?null:Math.round(rate*l.qty*(l.periods??1)*100)/100;return {...l,rate,amount:source.amount===undefined?calculated:Math.round(source.amount*100)/100,...(source.amount===undefined?{}:{amountOverride:true}),...(source.sessionStart?{sessionStart:source.sessionStart,sessionEnd:source.sessionEnd}:{})};});
 const windows=lines.map(sessionWindow);if(windows.every(w=>w!==null)){const first=new Date(Math.min(...windows.map(w=>w!.start))-18000000).toISOString();startDate.setTime(Date.parse(first.slice(0,10)+'T00:00:00Z'));}
 const effectiveTime=windows.every(w=>w!==null)?new Date(Math.min(...windows.map(w=>w!.start))-18000000).toISOString().slice(11,16):startTime;
 const equipment=lines.filter(l=>!l.operator).reduce((sum,l)=>sum+Math.round((l.amount??0)*100),0),operators=lines.filter(l=>l.operator).reduce((sum,l)=>sum+Math.round((l.amount??0)*100),0);
 const loyaltyDiscountOverrideCents=existing&&body.discountChoice==='keep'?existing.loyaltyDiscountOverrideCents:null;
 const estimateCents=lines.some(l=>l.amount!==null)?equipment+operators-(loyaltyDiscountOverrideCents??loyaltyDiscountCents(equipment+operators,discountPercent)):null;if(estimateCents!==null&&estimateCents>2000000000)return fail('The booking total exceeds the supported limit.');
 const machine=await prisma.product.count({where:{id:{in:input.map(l=>l.id)},category:{in:LIFTING_CATEGORIES}}})>0;
 const rentalCollection=machine?'delivery':body.rentalCollection==='pickup'?'pickup':'delivery',area=text(body.area,60)||null,siteAddress=text(body.siteAddress,300)||null;
 if(area&&!Object.hasOwn(DELIVERY_FEES,area))return fail('Choose a Grand Cayman delivery area.');if(rentalCollection==='delivery'&&(!area||!siteAddress))return fail('Enter the delivery area and site address.');
 const paid=existing?.status==='PAID'?parseAmount(body.paidAmount):null;if(existing?.status==='PAID'&&(paid===null||paid>2000000000))return fail('Enter the actual confirmed amount paid.');
 const previousLines=Array.isArray(existing?.items)?existing.items as unknown as PricedLine[]:[];
 const sameReservation=Boolean(existing?.scheduleStart)&&input.length===previousLines.length&&input.every((l,i)=>{const old=previousLines[i];return l.id===old.id&&l.term===old.term&&l.qty===old.qty&&(l.periods??1)===(old.periods??1)&&l.sessionStart===old.sessionStart&&l.sessionEnd===old.sessionEnd;})&&startDate.toISOString().slice(0,10)===existing!.scheduleStart!.toISOString().slice(0,10)&&effectiveTime===(existing!.startTime??'08:00');
 const reservationStart=sameReservation?existing!.scheduleStart:null,reservationEnd=sameReservation?existing!.scheduleEnd:null;
 const actor=(await currentUser(c))!;
 const fields={customerName:name,customerEmail:email,userId,companyAccountId:membership?.companyAccountId??null,subCompanyId:membership?.subCompanyId??null,company:membership?.companyDisplayName??(text(body.company,120)||null),phone:text(body.phone,40)||null,billingAddress:text(body.billingAddress,500)||null,siteAddress,area,startDate,startTime:effectiveTime,scheduleStart:reservationStart,scheduleEnd:reservationEnd,rentalCollection,jobDetails:text(body.jobDetails)||null,adminNote:text(body.adminNote,5000)||null,rewardTier,discountPercent,loyaltyDiscountOverrideCents,estimateCents,items:lines as unknown as Prisma.InputJsonValue,requestText:[`ADMIN ${existing?'UPDATED':'ENTERED'} BOOKING`, `Customer: ${name} <${email}>`,`Start: ${startDate.toISOString().slice(0,10)} ${effectiveTime} (Cayman time)`,`Location: ${siteAddress??'Customer pickup'}${area?`, ${area}`:''}`,`Booking discount: ${rewardTier??"Member"} (${discountPercent}%) — this booking only`,text(body.jobDetails),...lines.map(l=>`${l.name}${sessionLabel(l)?` — ${sessionLabel(l)}`:""} — ${TERM_LABELS[l.term]??l.term}; quantity/hours ${l.qty}; periods ${l.periods??1}; rate ${l.rate===null?'TBC':`KYD $${l.rate.toFixed(2)}`} ; line price ${l.amount===null?'TBC':`KYD $${l.amount.toFixed(2)}`}`)].filter(Boolean).join('\n')};
 try{
  const result=await prisma.$transaction(async tx=>{
   await lockInventory(tx);
   if(existing){const fresh=await tx.booking.findUniqueOrThrow({where:{id:existing.id}});if(fresh.updatedAt.getTime()!==existing.updatedAt.getTime())throw Error('changed');}
   if(!existing||['PENDING','APPROVED','PAID'].includes(existing.status))await assertAvailability(tx,input,{startDate,startTime:effectiveTime,scheduleStart:reservationStart,scheduleEnd:reservationEnd},existing?.id);
   const b=existing?await tx.booking.update({where:{id:existing.id},data:{...fields,adminEditedAt:new Date(),...(existing.status==='PAID'?{amountPaidCents:paid}:{})}}):await tx.booking.create({data:{...fields,adminEditedAt:new Date(),termsText:'Booking entered by an administrator. Customer has not signed an online rental agreement for this booking.',signature:'Not signed online — admin entry',initials:'—',agreedToTerms:false,paymentAck:false}});
   const old=await tx.estimate.findUnique({where:{bookingId:b.id}});
   if(old){await tx.estimateArchive.create({data:{number:old.number,bookingId:b.id,snapshot:old.snapshot as Prisma.InputJsonValue,totalCents:old.totalCents,pdf:old.pdf,emailRecipient:old.emailRecipient,originalCreatedAt:old.createdAt}});await tx.estimate.delete({where:{number:old.number}});}
   const estimate=await createBookingEstimate(tx,b,old?.number);
   const receipt=b.status==='PAID'?await queuePaidReceipt(tx,b):null;
   if(!emailCustomer){await tx.estimate.update({where:{number:estimate.number},data:{emailSuppressed:true}});if(receipt)await tx.paymentReceipt.update({where:{id:receipt.id},data:{emailSuppressed:true}});}
   await tx.bookingRevision.create({data:{bookingId:b.id,actorId:actor.id,actorName:actor.name,reason:[existing?reason:'Created by administrator',discountAudit,...(!emailCustomer?['Saved without customer email']:[])].filter(Boolean).join(' — '),before:existing?audit(existing):{},after:audit(b)}});
   if(!existing)await queueAdminBookingNotices(tx,b.id);
   return {b,estimate};
  },{timeout:30000,maxWait:15000});
  void deliverAdminPushNotifications();if(emailCustomer){await deliverEstimateEmails(result.estimate.number);await deliverReceiptEmails();}
  return c.redirect(`/admin/bookings/${result.b.id}?notice=${existing?(emailCustomer?'booking-edited':'booking-edited-silent'):'booking-created'}`);
 }catch(error){if(error instanceof AvailabilityError)return fail(error.message,error.status===409?409:400);if(error instanceof Error&&error.message==='changed')return fail('Another admin changed this booking. Reload it before editing.',409);console.error('Admin booking change failed; the original booking was retained.');return fail('The booking could not be saved. Please try again.',500);}
}
adminBookingEditor.post('/new',c=>save(c,null));
adminBookingEditor.post('/:id{[0-9]+}/edit',async c=>{const b=await prisma.booking.findUnique({where:{id:Number(c.req.param('id'))}});return b?save(c,b):c.notFound();});
adminBookingEditor.get('/:id{[0-9]+}/estimates/:file',async c=>{const match=c.req.param('file').match(/^(\d+)\.pdf$/);if(!match)return c.notFound();const e=await prisma.estimateArchive.findFirst({where:{bookingId:Number(c.req.param('id')),number:Number(match[1])}});if(!e)return c.notFound();c.header('Content-Type','application/pdf');c.header('Content-Disposition',`attachment; filename="Cayman-Crane-Estimate-${e.number}-REPLACED.pdf"`);return c.body(new Uint8Array(await watermarkPdf(e.pdf,'estimate')));});
