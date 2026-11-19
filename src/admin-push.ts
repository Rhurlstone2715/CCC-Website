import {Hono} from 'hono';
import {bodyLimit} from 'hono/body-limit';
import {ECDH} from 'node:crypto';
import * as webPush from 'web-push';
import {type AppEnv,currentUser} from './auth.js';
import {prisma} from './db.js';
import type {Prisma} from './generated/prisma/client.js';

export function pushConfigured(){return Boolean(process.env.WEB_PUSH_PUBLIC_KEY&&process.env.WEB_PUSH_PRIVATE_KEY);}
export function validPushEndpoint(value:unknown):value is string{
 if(typeof value!=='string'||value.length>4096)return false;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(
  ['web.push.apple.com','fcm.googleapis.com','android.googleapis.com'].includes(u.hostname)||u.hostname==='updates.push.services.mozilla.com'||u.hostname.endsWith('.push.services.mozilla.com')||u.hostname.endsWith('.notify.windows.com')
 );}catch{return false;}
}
function validSubscription(input:unknown):{endpoint:string;keys:{p256dh:string;auth:string}}|null{
 if(!input||typeof input!=='object')return null;const s=input as {endpoint?:unknown;keys?:{p256dh?:unknown;auth?:unknown}};
 if(!validPushEndpoint(s.endpoint)||typeof s.keys?.p256dh!=='string'||typeof s.keys.auth!=='string')return null;
 try{if(!/^[\w=-]+$/.test(s.keys.p256dh)||!/^[\w=-]+$/.test(s.keys.auth))return null;
  const point=Buffer.from(s.keys.p256dh,'base64url'),auth=Buffer.from(s.keys.auth,'base64url');if(point.length!==65||point[0]!==4||auth.length!==16)return null;
  ECDH.convertKey(point,'prime256v1');return {endpoint:s.endpoint,keys:{p256dh:s.keys.p256dh,auth:s.keys.auth}};
 }catch{return null;}
}
export async function queueAdminBookingNotices(tx:Prisma.TransactionClient,bookingId:number){
 const admins=await tx.user.findMany({where:{role:'ADMIN'},select:{id:true,adminPushSubscriptions:{select:{id:true}}}});
 for(const admin of admins){const notice=await tx.adminBookingNotice.create({data:{adminId:admin.id,bookingId}});
  if(admin.adminPushSubscriptions.length)await tx.adminPushDelivery.createMany({data:admin.adminPushSubscriptions.map(s=>({noticeId:notice.id,subscriptionId:s.id}))});
 }
}
// Called in the same transaction that verifies the customer's email.
export async function queueAdminSignupNotices(tx:Prisma.TransactionClient,customerId:number){
 const customer=await tx.user.findUnique({where:{id:customerId},select:{emailVerifiedAt:true,role:true}});
 if(!customer?.emailVerifiedAt||customer.role!=='CUSTOMER')return;
 const admins=await tx.user.findMany({where:{role:'ADMIN'},select:{id:true,adminPushSubscriptions:{select:{id:true}}}});
 for(const admin of admins){
  const notice=await tx.adminBookingNotice.upsert({where:{adminId_customerId:{adminId:admin.id,customerId}},update:{},create:{adminId:admin.id,customerId}});
  if(admin.adminPushSubscriptions.length)await tx.adminPushDelivery.createMany({data:admin.adminPushSubscriptions.map(sub=>({noticeId:notice.id,subscriptionId:sub.id})),skipDuplicates:true});
 }
}
let sending=false;
export async function deliverAdminPushNotifications(sender:typeof webPush.sendNotification=webPush.sendNotification){
 if(sending||!pushConfigured())return;sending=true;
 try{
  const jobs=await prisma.adminPushDelivery.findMany({where:{sentAt:null,nextAttemptAt:{lte:new Date()}},include:{notice:{include:{admin:{select:{role:true}}}},subscription:{include:{admin:{select:{role:true}}}}},orderBy:{nextAttemptAt:'asc'},take:20});
  for(const job of jobs){
   const where={noticeId:job.noticeId,subscriptionId:job.subscriptionId};const now=new Date();const claim=await prisma.adminPushDelivery.updateMany({where:{...where,sentAt:null,nextAttemptAt:{lte:now}},data:{nextAttemptAt:new Date(now.getTime()+120000)}});if(!claim.count)continue;
   if(job.notice.readAt||job.notice.admin.role!=='ADMIN'||job.subscription.admin.role!=='ADMIN'||job.notice.adminId!==job.subscription.adminId){await prisma.adminPushDelivery.updateMany({where,data:{sentAt:new Date()}});continue;}
   const unreadCount=await prisma.adminBookingNotice.count({where:{adminId:job.notice.adminId,readAt:null}});
   const signup=job.notice.customerId!==null;
   const eventId=signup?job.notice.customerId:job.notice.bookingId;
   try{await sender({endpoint:job.subscription.endpoint,keys:{p256dh:job.subscription.p256dh,auth:job.subscription.auth}},JSON.stringify({kind:signup?'customer-signup':'booking',title:signup?'New verified CCC customer':'New CCC booking',body:signup?'A customer has verified their email. Open Cayman Crane Admin to view their details.':'Open Cayman Crane Admin to review the new booking.',unreadCount,url:`/admin/${signup?'customers':'bookings'}/${eventId}`,tag:`ccc-${signup?'customer':'booking'}-${eventId}`}),{TTL:86400,topic:`${signup?'customer':'booking'}-${eventId}`,timeout:10000,vapidDetails:{subject:process.env.WEB_PUSH_SUBJECT||'mailto:caymancrane@gmail.com',publicKey:process.env.WEB_PUSH_PUBLIC_KEY!,privateKey:process.env.WEB_PUSH_PRIVATE_KEY!}});
    await prisma.adminPushDelivery.updateMany({where,data:{sentAt:new Date(),attempts:{increment:1}}});
   }catch(error){const status=(error as {statusCode?:number}).statusCode;
    if([400,404,410].includes(status??0))await prisma.adminPushSubscription.deleteMany({where:{id:job.subscriptionId}});
    else await prisma.adminPushDelivery.updateMany({where,data:{attempts:{increment:1},nextAttemptAt:new Date(Date.now()+Math.min(3600000,30000*2**Math.min(job.attempts,7)))}});
   }
  }
 }catch{console.error('Admin push paused; saved notifications will retry.');}finally{sending=false;}
}
export function startAdminPushDelivery(){void deliverAdminPushNotifications();return setInterval(()=>void deliverAdminPushNotifications(),30000).unref();}
export const adminPush=new Hono<AppEnv>();
adminPush.use('*',async(c,next)=>{const user=await currentUser(c);if(!user)return c.json({error:'Sign in as an admin.'},401);if(user.role!=='ADMIN')return c.json({error:'Admin access required.'},403);await next();});
adminPush.get('/state',async c=>{const user=(await currentUser(c))!;return c.json({adminId:user.id,configured:pushConfigured(),publicKey:process.env.WEB_PUSH_PUBLIC_KEY||null,unreadCount:await prisma.adminBookingNotice.count({where:{adminId:user.id,readAt:null}})});});
adminPush.use('*',bodyLimit({maxSize:16000,onError:c=>c.json({error:'Notification request too large.'},413)}));
adminPush.post('/subscribe',async c=>{
 if(!pushConfigured())return c.json({error:'Admin notifications are not configured yet.'},503);
 const user=(await currentUser(c))!,sub=validSubscription(await c.req.json().catch(()=>null));if(!sub)return c.json({error:'Invalid device subscription.'},400);
 const existing=await prisma.adminPushSubscription.findUnique({where:{endpoint:sub.endpoint}});
 if(!existing&&await prisma.adminPushSubscription.count({where:{adminId:user.id}})>=20)return c.json({error:'Too many enabled devices. Disable an unused device first.'},400);
 const saved=await prisma.adminPushSubscription.upsert({where:{endpoint:sub.endpoint},create:{adminId:user.id,endpoint:sub.endpoint,...sub.keys},update:{adminId:user.id,...sub.keys}});
 if(existing&&existing.adminId!==user.id)await prisma.adminPushDelivery.deleteMany({where:{subscriptionId:saved.id}});
 return c.json({ok:true});
});
adminPush.post('/unsubscribe',async c=>{const user=(await currentUser(c))!,body=await c.req.json().catch(()=>({}));if(typeof body.endpoint!=='string')return c.json({error:'Invalid subscription.'},400);await prisma.adminPushSubscription.deleteMany({where:{adminId:user.id,endpoint:body.endpoint}});return c.json({ok:true});});
adminPush.post('/seen',async c=>{
 const user=(await currentUser(c))!,body=await c.req.json().catch(()=>({}));
 const valid=(ids:unknown):ids is number[]=>Array.isArray(ids)&&ids.length<=200&&ids.every(id=>Number.isInteger(id)&&Number(id)>0);
 if(!valid(body.bookingIds??[])||!valid(body.customerIds??[]))return c.json({error:'Invalid notification list.'},400);
 await prisma.adminBookingNotice.updateMany({where:{adminId:user.id,readAt:null,OR:[{bookingId:{in:body.bookingIds??[]}},{customerId:{in:body.customerIds??[]}}]},data:{readAt:new Date()}});
 return c.json({unreadCount:await prisma.adminBookingNotice.count({where:{adminId:user.id,readAt:null}})});
});
