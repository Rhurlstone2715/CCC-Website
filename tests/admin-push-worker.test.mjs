import assert from'node:assert/strict';import{test}from'node:test';import{readFileSync}from'node:fs';import{runInNewContext}from'node:vm';
const code=readFileSync(new URL('../public/admin-sw.js',import.meta.url),'utf8');
test('background booking push always shows a visible notification and updates the icon count',async()=>{
 const handlers={},shown=[],badges=[],messages=[];const self={location:{origin:'https://www.caymancrane.com'},addEventListener:(type,fn)=>handlers[type]=fn,navigator:{setAppBadge:async n=>badges.push(n),clearAppBadge:async()=>badges.push(0)},registration:{showNotification:async(...args)=>shown.push(args)},clients:{matchAll:async()=>[{postMessage:m=>messages.push(m)}]}};
 runInNewContext(code,{self,URL,Promise});let pending;handlers.push({data:{json:()=>({unreadCount:3,url:'/admin/bookings/12',tag:'ccc-booking-12'})},waitUntil:p=>pending=p});await pending;
 assert.equal(shown.length,1);assert.equal(shown[0][0],'New CCC booking');assert.equal(shown[0][1].data.url,'/admin/bookings/12');assert.deepEqual(badges,[3]);assert.equal(messages[0].type,'ccc-booking-alert');
 handlers.push({data:{json:()=>({unreadCount:0,url:'https://attacker.example'})},waitUntil:p=>pending=p});await pending;assert.equal(shown.length,2);assert.equal(shown[1][1].data.url,'/admin/bookings');assert.equal(badges.at(-1),0);
});
test('admin manifest keeps login in scope and starts at bookings',()=>{
 const m=JSON.parse(readFileSync(new URL('../public/admin.webmanifest',import.meta.url),'utf8'));assert.equal(m.display,'standalone');assert.equal(m.scope,'/');assert.match(m.start_url,/^\/admin\/bookings/);assert.equal(m.icons.length,2);
});
