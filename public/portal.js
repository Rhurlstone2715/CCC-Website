// Small enhancements for the account and admin pages. Everything works
// without this script; it only adds confirm prompts and copy buttons.
document.addEventListener("submit", event => {
  const form = event.target.closest("form[data-confirm]");
  if (form && !window.confirm(form.dataset.confirm)) event.preventDefault();
});

document.addEventListener("click", async event => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  const source = document.getElementById(button.dataset.copy);
  if (!source) return;
  try {
    await navigator.clipboard.writeText(source.value ?? source.textContent);
    const label = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = label), 1800);
  } catch {
    source.select?.();
  }
});

// Give customers one focused account form while preserving no-JavaScript access.
(()=>{
 const panels=document.querySelector('.auth-panels');if(!panels)return;
 const tabs=[...document.querySelectorAll('[data-auth-tab]')];
 function select(name,focus=false){
   tabs.forEach(t=>{const active=t.dataset.authTab===name;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;if(active&&focus)t.focus()});
 }
 tabs.forEach((tab,i)=>{tab.onclick=()=>select(tab.dataset.authTab);tab.onkeydown=e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;select(tabs[n].dataset.authTab,true)}}});
 document.querySelectorAll('[data-auth-link]').forEach(a=>a.onclick=e=>{e.preventDefault();select(a.dataset.authLink);panels.scrollIntoView({block:'start',behavior:'smooth'})});
 const fromHash=()=>select(location.hash==='#signup'?'signup':panels.dataset.authInitial||'login');window.addEventListener('hashchange',fromHash);fromHash();
})();
