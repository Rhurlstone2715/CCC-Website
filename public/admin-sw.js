// No fetch handler or offline cache: private admin pages always require a live login.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>event.waitUntil((async()=>{
 let data={};try{data=event.data?.json()||{};}catch{}
 const count=Number.isInteger(data.unreadCount)&&data.unreadCount>=0?data.unreadCount:1;
 const url=/^\/admin\/(?:bookings|customers)(?:\/\d+)?$/.test(data.url||'')?data.url:'/admin/bookings';
 await Promise.allSettled([
  self.registration.showNotification(data.kind==='customer-signup'?'New verified CCC customer':'New CCC booking',{body:data.kind==='customer-signup'?'A customer has verified their email. Open Cayman Crane Admin to view their details.':'Open Cayman Crane Admin to review the new booking.',icon:'/assets/ccc-icon-192.png',badge:'/assets/ccc-icon-192.png',tag:typeof data.tag==='string'?data.tag:'ccc-new-booking',data:{url}}),
  count?self.navigator.setAppBadge?.(count):self.navigator.clearAppBadge?.()
 ]);
 for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true}))client.postMessage({type:'ccc-booking-alert'});
})()));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{
 const path=event.notification.data?.url,url=/^\/admin\/(?:bookings|customers)(?:\/\d+)?$/.test(path||'')?path:'/admin/bookings';
 for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true})){if(new URL(client.url).origin===self.location.origin){await client.navigate(url);return client.focus();}}
 return self.clients.openWindow(url);
})());});
