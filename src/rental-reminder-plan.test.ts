import assert from'node:assert/strict';import{test}from'node:test';
import{planRentalReminders,reminderRecipientVerified,type ReminderBooking,type ReminderProduct}from'./rental-reminder-plan.js';
import{rentalReminderEmail}from'./rental-reminder-email.js';
const mixer:ReminderProduct={id:'mixer',name:'Mixer',category:'Tools',rates:{daily:40,weekly:175,monthly:600},delivery:true,operatorService:false,setPart:null,addOns:[],extra:{},hidden:false};
const b:ReminderBooking={id:1,status:'APPROVED',rentalReturnedAt:null,userId:1,customerName:'Sample',customerEmail:'sample@example.com',scheduleStart:new Date('2026-12-01'),scheduleEnd:new Date('2026-12-04'),rentalCollection:'delivery',siteAddress:'Sample site',area:'George Town',items:[{id:'mixer',name:'Mixer',term:'weekly',qty:2,periods:3,rate:175,amount:1050,operator:false}]};
const contract={rows:[{item:'Collection'}]},base='https://www.caymancrane.com';
const plan=(booking=b,products=[mixer],snapshot:unknown=contract)=>planRentalReminders(booking,products,[],snapshot,base);
test('confirmed end dates create two Cayman reminders and quantity is units, not duration',()=>{
 const p=plan();assert.equal(p.length,2);assert.equal(p[0].dueAt.toISOString(),'2026-12-03T14:00:00.000Z');assert.equal(p[1].dueAt.toISOString(),'2026-12-04T13:00:00.000Z');assert.equal(p[0].expiresAt.toISOString(),'2026-12-04T05:00:00.000Z');assert.equal(p[1].expiresAt.toISOString(),'2026-12-04T17:00:00.000Z');assert.equal(p[0].input.items[0].quantity,2);assert.equal(p[0].input.collectionIncluded,true);
});
test('pending, cancelled, declined, returned, daily-only, missing dates or missing contract do not schedule',()=>{
 for(const status of['PENDING','CANCELLED','DECLINED']as const)assert.equal(plan({...b,status}).length,0);
 assert.equal(plan({...b,rentalReturnedAt:new Date()}).length,0);assert.equal(plan({...b,scheduleEnd:null}).length,0);assert.equal(plan({...b,scheduleStart:null}).length,0);assert.equal(plan({...b,items:[{...(b.items as object[])[0],term:'daily'}]}).length,0);assert.equal(plan(b,[mixer],null).length,0);
});
test('pickup promises require collection in the saved contract and eligible items/location',()=>{
 const none=plan(b,[mixer],{rows:[{item:'Delivery'}]});assert.equal(none[0].input.returnNeedsConfirmation,true);assert.doesNotMatch(rentalReminderEmail(none[1].input).text,/CCC staff|arrive by/);
 const self=plan({...b,rentalCollection:'pickup'});assert.equal(self[0].input.collectionIncluded,false);assert.equal(self[0].input.returnNeedsConfirmation,false);assert.match(rentalReminderEmail(self[0].input).text,/return the item/);
 const crane=plan(b,[{...mixer,category:'Rough Terrain Cranes'}]);assert.equal(crane[0].input.returnNeedsConfirmation,true);assert.doesNotMatch(rentalReminderEmail(crane[0].input).text,/return the item|CCC staff/);
 assert.equal(plan({...b,siteAddress:null})[0].input.returnNeedsConfirmation,true);
});
test('different confirmed item dates get separate reminders and midnight end is exclusive',()=>{
 const items=[...(b.items as object[]),{id:'other',name:'Other',term:'monthly',qty:1,operator:false,sessionStart:'2026-11-08T08:00',sessionEnd:'2026-12-08T00:00'}];
 const p=plan({...b,items},[mixer,{...mixer,id:'other'}]);assert.equal(p.length,4);assert.deepEqual([...new Set(p.map(x=>x.endDate))],['2026-12-04','2026-12-07']);
});
test('date changes replace event keys while rates, quantities and address refresh in place',()=>{
 const one=plan();const changed=plan({...b,scheduleEnd:new Date('2026-12-11')});assert.notEqual(changed[0].key,one[0].key);
 const refreshed=plan({...b,siteAddress:'New site',items:[{...(b.items as object[])[0],qty:3}]},[{...mixer,rates:{daily:50,weekly:200,monthly:700}}]);assert.equal(refreshed[0].key,one[0].key);assert.equal(refreshed[0].input.items[0].quantity,3);assert.equal(refreshed[0].input.items[0].rates.daily,50);assert.match(refreshed[0].input.location,/New site/);
});
test('only the linked verified customer email is a recipient',()=>{
 const u={id:1,role:'CUSTOMER' as const,email:b.customerEmail,emailVerifiedAt:new Date()};assert.ok(reminderRecipientVerified(b,u));assert.ok(!reminderRecipientVerified(b,null));assert.ok(!reminderRecipientVerified(b,{...u,emailVerifiedAt:null}));assert.ok(!reminderRecipientVerified(b,{...u,email:'other@example.com'}));assert.ok(!reminderRecipientVerified(b,{...u,role:'ADMIN'}));
});
