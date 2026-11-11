(() => {
  const form = document.currentScript?.closest('form');
  const email = form?.querySelector('input[name="email"]');
  const company = form?.querySelector('input[name="company"]');
  if (!email || !company) return;
  const label = form.querySelector(`label[for="${company.id}"]`);
  const choice = document.createElement('select');
  choice.id = company.id + '-choice';choice.name = 'company';choice.hidden = true;choice.disabled = true;
  const describedBy=company.getAttribute('aria-describedby');if(describedBy)choice.setAttribute('aria-describedby',describedBy);
  company.after(choice);
  const list = document.createElement('datalist');list.id='matching-company-options';company.setAttribute('list',list.id);choice.after(list);
  const note=document.createElement('small');note.className='hint';note.setAttribute('aria-live','polite');list.after(note);
  let timer,sequence=0;
  function showTextInput() {
    choice.hidden=true;choice.disabled=true;company.hidden=false;company.style.display='';company.disabled=false;
    if(label)label.htmlFor=company.id;
  }
  async function recommend() {
    const current=++sequence;
    if(!email.validity.valid||!email.value)return;
    try {
      const response=await fetch('/account/company-suggestion?email='+encodeURIComponent(email.value));
      if(!response.ok)return;
      const data=await response.json();if(current!==sequence)return;
      list.replaceChildren();
      if(!data.eligible){showTextInput();company.value='';company.disabled=true;note.textContent='Use a company work email to join shared company rewards, or continue with a personal account.';return;}
      if(data.company){
        const saved=company.value;choice.replaceChildren();
        choice.add(new Option('Select your company (optional)',''));
        choice.add(new Option(`${data.company} — @${data.domain}`,data.company));
        choice.value=saved===data.company?data.company:'';
        company.hidden=true;company.style.display='none';company.disabled=true;choice.hidden=false;choice.disabled=false;
        if(label)label.htmlFor=choice.id;
        note.textContent='Your email matches this registered company. Select it to share company loyalty points after email verification.';
      } else {
        showTextInput();const option=document.createElement('option');option.value=data.suggestion;list.append(option);
        note.textContent='Suggested company: '+data.suggestion+'. Enter the company name matching '+data.domain+'; it will be saved after you verify your work email.';
      }
    }catch{if(current===sequence){showTextInput();note.textContent='Company eligibility will be checked when you save.';}}
  }
  choice.addEventListener('change',()=>{company.value=choice.value;});
  email.addEventListener('input',()=>{++sequence;if(!choice.hidden)company.value='';showTextInput();note.textContent='';clearTimeout(timer);timer=setTimeout(recommend,350);});
  email.addEventListener('change',recommend);
  recommend();
})();
