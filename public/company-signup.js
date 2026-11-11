(() => {
  const script = document.currentScript;
  const form = script?.closest('form');
  const email = form?.querySelector('input[name="email"]');
  const company = form?.querySelector('input[name="company"]');
  if (!email || !company) return;
  const list = document.createElement('datalist');
  list.id = 'matching-company-options';
  company.setAttribute('list', list.id);company.after(list);
  const note = document.createElement('small');note.className='hint';note.setAttribute('aria-live','polite');list.after(note);
  let timer, sequence=0;
  async function recommend() {
    const current=++sequence;
    company.readOnly=false;
    if (!email.validity.valid || !email.value) return;
    try {
      const response=await fetch('/account/company-suggestion?email='+encodeURIComponent(email.value));
      if (!response.ok) return;
      const data=await response.json();if(current!==sequence)return;
      list.replaceChildren();
      if(!data.eligible){company.value='';company.disabled=true;note.textContent='Use a company work email to join shared company rewards, or continue with a personal account.';return;}
      company.disabled=false;
      const option=document.createElement('option');option.value=data.company||data.suggestion;list.append(option);
      if(data.company){company.value=data.company;company.readOnly=true;note.textContent='Your work-email domain matches '+data.company+'. Verify your email to join its shared loyalty account.';}
      else{note.textContent='Suggested company: '+data.suggestion+'. Enter the company name matching '+data.domain+'; it will be saved after you verify your work email.';}
    }catch{company.disabled=false;note.textContent='Company eligibility will be checked when you save.';}
  }
  email.addEventListener('input',()=>{++sequence;if(company.readOnly)company.value='';company.disabled=false;company.readOnly=false;clearTimeout(timer);timer=setTimeout(recommend,350);});
  email.addEventListener('change',recommend);
  recommend();
})();
