(() => {
 const enable=document.querySelector('#enableAdminPush'),disable=document.querySelector('#disableAdminPush'),status=document.querySelector('#adminPushStatus'),install=document.querySelector('#adminPushInstall');if(!enable)return;
 let registration,state,enabled=false;
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const json=async(path,body)=>{const r=await fetch('/admin/push/'+path,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});if(!r.ok)throw Error(r.status===401||r.status===403?'Sign in as an admin to enable admin alerts.':'The notification setting could not be saved. Try again.');return r.json();};
 const badge=async(count)=>{try{if(!enabled||!count)await navigator.clearAppBadge?.();else await navigator.setAppBadge?.(count);}catch{}};
 async function refresh(markSeen=false){state=await json('state');const ids=(document.querySelector('[data-read-bookings]')?.dataset.readBookings||'').split(',').filter(Boolean).map(Number);const customerIds=(document.querySelector('[data-read-customers]')?.dataset.readCustomers||'').split(',').filter(Boolean).map(Number);if(markSeen&&(ids.length||customerIds.length)){const result=await json('seen',{bookingIds:ids,customerIds});state.unreadCount=result.unreadCount;}await badge(state.unreadCount);}
 function show(on){enabled=on;enable.hidden=on;disable.hidden=!on;status.textContent=on?'Enabled on this device. New bookings and verified customer signups show an alert and unread badge. Viewing a booking or customer clears its unread count.':'Admin alerts are off on this device.';}
 const decode=key=>Uint8Array.from(atob(key.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 async function turnOff(){const sub=await registration?.pushManager.getSubscription();if(sub){await sub.unsubscribe();try{await json('unsubscribe',{endpoint:sub.endpoint});}catch{}}localStorage.removeItem('ccc-admin-push-owner');show(false);await badge(0);}
 enable.onclick=async()=>{
  enable.disabled=true;
  try{const permission=await Notification.requestPermission();if(permission!=='granted'){status.textContent='Notifications were not allowed. On iPhone, enable Allow Notifications and Badges for CCC Admin in Settings → Notifications, then try again.';return;}
   const sub=await registration.pushManager.getSubscription()||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decode(state.publicKey)});
   await json('subscribe',sub.toJSON());localStorage.setItem('ccc-admin-push-owner',String(state.adminId));show(true);await refresh(true);
  }catch(error){status.textContent=error.message||'Could not enable alerts. Open the home-screen app and try again.';}finally{enable.disabled=false;}
 };
 disable.onclick=()=>turnOff().catch(()=>{status.textContent='Could not disable alerts. Try again.';});
 (async()=>{
  try{
   await refresh(true);
   if(ios&&!standalone){install.hidden=false;status.textContent='Open CCC Admin from its home-screen web app to enable iPhone alerts.';return;}
   if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){install.hidden=false;status.textContent='This browser cannot enable admin alerts. Use a supported home-screen web app on iOS 16.4 or later.';return;}
   registration=await navigator.serviceWorker.register('/admin-sw.js',{scope:'/',updateViaCache:'none'});await navigator.serviceWorker.ready;
   if(!state.configured){status.textContent='Admin notifications are being configured. Refresh shortly.';return;}
   const sub=await registration.pushManager.getSubscription();if(sub&&Notification.permission==='granted'){
    await json('subscribe',sub.toJSON());localStorage.setItem('ccc-admin-push-owner',String(state.adminId));show(true);await badge(state.unreadCount);
   }else show(false);
   enable.disabled=false;
  }catch(error){status.textContent=error.message;}
 })();
 navigator.serviceWorker?.addEventListener('message',event=>{if(event.data?.type==='ccc-booking-alert')void refresh().catch(()=>{});});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void refresh().catch(()=>{});});
 document.addEventListener('submit',event=>{const form=event.target.closest('form[action="/account/logout"]');if(!form||!registration)return;event.preventDefault();void turnOff().finally(()=>form.submit());});
})();
