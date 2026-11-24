import{prisma}from'./db.js';
import{customerEmailsEnabled,sendEmail,COMPANY_EMAIL}from'./email.js';
import{planRentalReminders,reminderRecipientVerified}from'./rental-reminder-plan.js';
import{rentalReminderEmail}from'./rental-reminder-email.js';
export const rentalRemindersEnabled=()=>process.env.RENTAL_REMINDERS_ENABLED==='true';
const ACTIVE=['APPROVED','PAID'] as const;
let running=false;
function publicBase(){try{const u=new URL(process.env.PUBLIC_URL??'');return u.protocol==='https:'&&!u.username&&!u.password?u.origin:null;}catch{return null;}}
export async function runRentalReminders(at?:Date,sender:typeof sendEmail=sendEmail,clock:()=>Date=()=>new Date()){
 const now=at??clock();
 const stats={queued:0,sent:0,cancelled:0};const base=publicBase();
 if(running||!rentalRemindersEnabled()||!customerEmailsEnabled()||!base)return stats;
 running=true;
 try{
  // Historic dates and inactive bookings can never be backfilled into customer inboxes.
  await prisma.rentalReminder.updateMany({where:{sentAt:null,cancelledAt:null,OR:[{expiresAt:{lte:now}},{booking:{status:{notIn:[...ACTIVE]}}},{booking:{rentalReturnedAt:{not:null}}}]},data:{cancelledAt:now}});
  const [products,options]=await Promise.all([prisma.product.findMany(),prisma.riggingOption.findMany({select:{id:true,productId:true,price:true}})]);
  let cursor:number|undefined;
  for(;;){
   const bookings=await prisma.booking.findMany({where:{status:{in:[...ACTIVE]},rentalReturnedAt:null,OR:[{items:{array_contains:[{term:'weekly'}]}},{items:{array_contains:[{term:'monthly'}]}}]},include:{user:true,estimate:{select:{snapshot:true}}},orderBy:{id:'asc'},take:200,...(cursor?{cursor:{id:cursor},skip:1}:{})});
   for(const b of bookings){
    const plans=reminderRecipientVerified(b,b.user)?planRentalReminders(b,products,options,b.estimate?.snapshot,base).filter(p=>p.expiresAt>now):[];
    await prisma.rentalReminder.updateMany({where:{bookingId:b.id,sentAt:null,cancelledAt:null,...(plans.length?{key:{notIn:plans.map(p=>p.key)}}:{})},data:{cancelledAt:now}});
    for(const plan of plans){
     const old=await prisma.rentalReminder.findUnique({where:{key:plan.key},select:{sentAt:true}});if(old?.sentAt)continue;
     await prisma.rentalReminder.upsert({where:{key:plan.key},create:{key:plan.key,bookingId:b.id,kind:plan.kind,endDate:new Date(plan.endDate+'T00:00:00Z'),recipient:plan.recipient,dueAt:plan.dueAt,expiresAt:plan.expiresAt,nextAttemptAt:plan.dueAt},update:{recipient:plan.recipient,dueAt:plan.dueAt,expiresAt:plan.expiresAt,cancelledAt:null}});stats.queued++;
    }
   }
   if(bookings.length<200)break;cursor=bookings.at(-1)!.id;
  }
  const jobs=await prisma.rentalReminder.findMany({where:{sentAt:null,cancelledAt:null,dueAt:{lte:now},expiresAt:{gt:now},nextAttemptAt:{lte:now}},orderBy:{dueAt:'asc'},take:20});
  for(const job of jobs){
   // Atomic two-minute lease, plus row locks and provider idempotency protect concurrent replicas/retries.
   const claim=await prisma.rentalReminder.updateMany({where:{id:job.id,sentAt:null,cancelledAt:null,nextAttemptAt:{lte:now}},data:{nextAttemptAt:new Date(now.getTime()+120000)}});if(!claim.count)continue;
   await prisma.$transaction(async tx=>{
    // All booking edits update this same row. Hold it until sending is recorded so a cancellation/
    // extension cannot commit between our final check and the provider request. No global inventory lock.
    await tx.$queryRaw`SELECT "id" FROM "Booking" WHERE "id"=${job.bookingId} FOR UPDATE`;
    const freshJob=await tx.rentalReminder.findUnique({where:{id:job.id}});if(!freshJob||freshJob.sentAt||freshJob.cancelledAt)return;
    const b=await tx.booking.findUnique({where:{id:job.bookingId},include:{user:true,estimate:{select:{snapshot:true}}}});
    const [currentProducts,currentOptions]=await Promise.all([tx.product.findMany(),tx.riggingOption.findMany({select:{id:true,productId:true,price:true}})]);
    const plan=b&&reminderRecipientVerified(b,b.user)?planRentalReminders(b,currentProducts,currentOptions,b.estimate?.snapshot,base).find(p=>p.key===job.key):undefined;
    const checkedAt=at??clock(); // Recheck wall-clock time after queue work and row-lock waits.
    if(!plan||plan.dueAt>checkedAt||plan.expiresAt<=checkedAt){await tx.rentalReminder.update({where:{id:job.id},data:{cancelledAt:now}});stats.cancelled++;return;}
    const email=rentalReminderEmail(plan.input);
    const ok=await sender({to:plan.recipient,replyTo:COMPANY_EMAIL,...email,idempotencyKey:`ccc-rental-reminder-${job.id}`});
    await tx.rentalReminder.update({where:{id:job.id},data:{recipient:plan.recipient,subject:email.subject,attempts:{increment:1},...(ok?{sentAt:checkedAt}:{nextAttemptAt:new Date(checkedAt.getTime()+Math.min(3600000,60000*2**Math.min(freshJob.attempts,6)))})}});
    if(ok)stats.sent++;
   },{timeout:25000,maxWait:15000});
  }
  console.info(`Rental reminder sweep complete: ${stats.queued} eligible events, ${stats.sent} sent, ${stats.cancelled} cancelled.`);
 }catch{console.error('Rental reminder delivery paused; eligible reminders will retry.');}
 finally{running=false;}
 return stats;
}
export function startRentalReminderDelivery(){
 console.log(rentalRemindersEnabled()?`Rental reminders enabled: 9 am day-before / 8 am last-day, Cayman time.${customerEmailsEnabled()?'':' Waiting for customer email configuration.'}`:'Rental reminders disabled.');
 void runRentalReminders();return setInterval(()=>void runRentalReminders(),60000).unref();
}
