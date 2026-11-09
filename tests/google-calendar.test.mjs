import '../dist/test-env.js';
import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { Hono } from 'hono';
import { prisma } from '../dist/db.js';
import { googleCalendar } from '../dist/routes/google-calendar.js';
import { bookingGoogleEvent, googleBookingEventId, encryptRefreshToken, syncGoogleCalendar } from '../dist/google-calendar.js';
const base='https://www.caymancrane.com';
const booking={id:12,status:'PENDING',customerName:'Test Customer',customerEmail:'customer@example.com',phone:'345 555 0100',startDate:new Date('2026-11-09T00:00:00Z'),startTime:'08:00',scheduleStart:null,scheduleEnd:null,siteAddress:'Site',area:'George Town',items:[{name:'Crane',term:'daily',qty:1}]};
after(()=>prisma.$disconnect());
function stub(t, object, key, value){const old=object[key];object[key]=value;t.after(()=>{object[key]=old;});}
function config(t){for(const [key,value]of Object.entries({GOOGLE_CLIENT_ID:'test-id',GOOGLE_CLIENT_SECRET:'test-secret',PUBLIC_URL:base})){const old=process.env[key];process.env[key]=value;t.after(()=>{if(old===undefined)delete process.env[key];else process.env[key]=old;});}}
test('booking events use requested dates, tentative status and Cayman start-time details',()=>{
 const event=bookingGoogleEvent(booking,base);
 assert.equal(event.status,'tentative');assert.deepEqual(event.start,{date:'2026-11-09'});assert.deepEqual(event.end,{date:'2026-11-10'});
 assert.match(event.description,/08:00 \(Cayman\)/);assert.match(event.summary,/CCC-00012/);
});
test('confirmed dates override requested dates and inclusive last day becomes exclusive Google end',()=>{
 const event=bookingGoogleEvent({...booking,status:'APPROVED',scheduleStart:new Date('2026-11-12'),scheduleEnd:new Date('2026-11-14')},base);
 assert.equal(event.status,'confirmed');assert.equal(event.start.date,'2026-11-12');assert.equal(event.end.date,'2026-11-15');
 for(const status of ['CANCELLED','DECLINED'])assert.equal(bookingGoogleEvent({...booking,status},base),null);
 assert.equal(bookingGoogleEvent({...booking,startDate:null},base),null);
 assert.equal(googleBookingEventId(12,base),googleBookingEventId(12,base));
 assert.notEqual(googleBookingEventId(12,base),googleBookingEventId(13,base));
});
test('sync backfills new bookings, retries existing IDs and removes only tracked cancelled/deleted bookings',async t=>{
 config(t);
 const link={id:1,encryptedToken:encryptRefreshToken('refresh-secret'),events:{'99':{id:'ccc-old-booking',hash:'old'}}};
 let writes=0;
 stub(t,prisma.googleCalendarLink,'findUnique',async()=>link);
 stub(t,prisma.googleCalendarLink,'update',async({data})=>{Object.assign(link,data);writes++;return link;});
 stub(t,prisma.googleCalendarLink,'updateMany',async()=>({count:1}));
 stub(t,prisma.booking,'findMany',async()=>[booking,{...booking,id:99,status:'CANCELLED'},{...booking,id:13,startDate:null}]);
 const requests=[];
 stub(t,globalThis,'fetch',async(url,options)=>{
  requests.push({url,options});
  if(url.includes('/token'))return Response.json({access_token:'test-access'});
  if(options.method==='PUT')return new Response('',{status:404});
  if(options.method==='POST')return Response.json({id:googleBookingEventId(12,base)});
  return new Response(null,{status:204});
 });
 await syncGoogleCalendar();
 assert.ok(requests.some(r=>r.url.includes('caymancrane%40gmail.com/events')&&r.options.method==='POST'));
 assert.equal(requests.filter(r=>r.options.method==='DELETE').length,1);
 assert.ok(requests.find(r=>r.options.method==='DELETE').url.includes('ccc-old-booking'));
 assert.ok(link.events['12']);assert.equal(link.events['99'],undefined);assert.equal(link.lastError,null);assert.ok(writes>=3);
 requests.length=0;await syncGoogleCalendar();
 assert.equal(requests.filter(r=>r.url.includes('/calendar/v3/')&&(r.options.method==='POST'||r.options.method==='PUT')).length,0);
});
test('Google authorization requires admin access and rejects missing callback state',async t=>{
 config(t);const app=new Hono();app.use('*',async(c,next)=>{c.set('user',{id:1,role:'ADMIN'});await next();});app.route('/admin/google-calendar',googleCalendar);
 const start=await app.request('/admin/google-calendar/connect',{method:'POST'});
 assert.equal(start.status,302);assert.match(start.headers.get('set-cookie'),/HttpOnly/);
 const url=new URL(start.headers.get('location'));assert.equal(url.searchParams.get('login_hint'),'caymancrane@gmail.com');assert.equal(url.searchParams.get('access_type'),'offline');
 assert.equal((await app.request('/admin/google-calendar/callback?code=bad&state=bad')).status,400);
 const customer=new Hono();customer.use('*',async(c,next)=>{c.set('user',{id:2,role:'CUSTOMER'});await next();});customer.route('/admin/google-calendar',googleCalendar);
 const denied=await customer.request('/admin/google-calendar/connect',{method:'POST'});assert.equal(denied.headers.get('location'),'/account/profile?notice=not-admin');
});
test('connecting a different Google account is refused without saving credentials',async t=>{
 config(t);const app=new Hono();app.use('*',async(c,next)=>{c.set('user',{id:1,role:'ADMIN'});await next();});app.route('/admin/google-calendar',googleCalendar);
 const start=await app.request('/admin/google-calendar/connect',{method:'POST'});
 const state=new URL(start.headers.get('location')).searchParams.get('state');
 const cookie=start.headers.get('set-cookie').split(';')[0];let saved=false;
 stub(t,prisma.googleCalendarLink,'upsert',async()=>{saved=true;return {};});
 stub(t,globalThis,'fetch',async url=>Response.json(url.includes('/token')?{access_token:'access',refresh_token:'refresh'}:{email:'other@example.com',email_verified:true}));
 const response=await app.request(`/admin/google-calendar/callback?code=test&state=${state}`,{headers:{cookie}});
 assert.equal(response.headers.get('location'),'/admin/google-calendar?notice=failed');assert.equal(saved,false);
});
test('Google API errors identify disabled APIs and missing permissions without exposing response data',async()=>{
 const {calendarApiError}=await import('../dist/google-calendar.js');
 const disabled=await calendarApiError(Response.json({error:{errors:[{reason:'accessNotConfigured'}],details:[{reason:'SERVICE_DISABLED',metadata:{consumer:'projects/281511181344'}}]}},{status:403}));
 assert.match(disabled.message,/Enable Google Calendar API/);assert.match(disabled.message,/281511181344/);
 const permission=await calendarApiError(Response.json({error:{errors:[{reason:'insufficientPermissions'}],message:'private-response-data'}},{status:403}));
 assert.match(permission.message,/Reconnect Google/);assert.doesNotMatch(permission.message,/private-response-data/);
});
