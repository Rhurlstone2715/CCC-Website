// Loaded only by the isolated preview server. No production page includes this file.
(()=>{
 const url=new URL(location.href);if(url.searchParams.has('demo')){sessionStorage.setItem('ccc-preview-demo','1');if(!JSON.parse(localStorage.getItem('ccc-rental-cart')||'[]').length)localStorage.setItem('ccc-rental-cart',JSON.stringify([{id:'rt40',key:'rt40:hourly',term:'hourly',qty:4}]))}
 const originalFetch=window.fetch.bind(window);
 window.fetch=async(input,init)=>{
  const path=new URL(typeof input==='string'?input:input.url,location.href).pathname;
  if(path==='/api/rewards'&&sessionStorage.getItem('ccc-preview-demo'))return new Response(JSON.stringify({profile:{name:'Preview Customer',email:'preview@example.com',phone:'345 555 0100',company:'Example Company',emailConfirmed:true},rewards:{tier:'Member',discountPercent:0}}),{status:200,headers:{'content-type':'application/json'}});
  return originalFetch(input,init);
 };
 document.addEventListener('submit',e=>{
  const form=e.target;
  if(form.method.toUpperCase()==='GET')return;
  if(form.id==='checkoutForm'){
   const review=form.querySelector('[data-checkout-step="2"]');
   if(review.hidden)return;
   e.preventDefault();e.stopImmediatePropagation();
   for(const field of review.querySelectorAll('input'))if(!field.reportValidity())return;
   let note=form.querySelector('.preview-form-note');if(!note){note=document.createElement('p');note.className='preview-form-note';note.setAttribute('role','status');form.querySelector('.order-review').append(note)}
   note.textContent='Preview complete. Your sample request has not been sent.';note.scrollIntoView({block:'center',behavior:'smooth'});return;
  }
  e.preventDefault();e.stopImmediatePropagation();
  let note=form.querySelector('.preview-form-note');if(!note){note=document.createElement('p');note.className='preview-form-note';note.setAttribute('role','status');form.append(note)}
  note.textContent='Preview only — no request was sent and no account was changed. Use “Try booking flow” above to review checkout with sample details.';note.scrollIntoView({block:'center',behavior:'smooth'});
 },true);
})();
