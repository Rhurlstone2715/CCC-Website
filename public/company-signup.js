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
  const subValue=form.querySelector('input[name="subCompanyId"]');
  const subWrap=document.createElement('div');subWrap.className='field';subWrap.hidden=true;
  const subLabel=document.createElement('label');subLabel.textContent='Office / department';
  const subSelect=document.createElement('select');subSelect.id=company.id+'-subcompany';subLabel.htmlFor=subSelect.id;
  const subHint=document.createElement('small');subHint.className='hint';subHint.textContent='Staff in the same sub-company share its loyalty points. Points stay separate from other departments.';
  subWrap.append(subLabel,subSelect,subHint);company.closest('.field').after(subWrap);
  let subChoices=[];let subRequired=false;
  function showSubCompanies(){
    const selected=subValue?.value||'';subSelect.replaceChildren();subSelect.add(new Option(subRequired?'Select your office / department':'No sub-company selected',''));
    const groups=new Map();for(const item of subChoices){if(!groups.has(item.group)){const group=document.createElement('optgroup');group.label=item.group;groups.set(item.group,group);subSelect.append(group)}groups.get(item.group).append(new Option(item.name,String(item.id)))}
    const enabled=choice.value!==''&&subChoices.length>0;subWrap.hidden=!enabled;subSelect.disabled=!enabled;subSelect.required=enabled&&subRequired;subSelect.value=selected;
    if(!enabled&&subValue)subValue.value='';
  }
  subSelect.addEventListener('change',()=>{if(subValue)subValue.value=subSelect.value});
  let timer,sequence=0;
  function showTextInput() {
    subWrap.hidden=true;subSelect.disabled=true;choice.hidden=true;choice.disabled=true;company.hidden=false;company.style.display='';company.disabled=false;
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
      if(data.mode==='single-email'){showTextInput();note.textContent='You can register a new company using this email as its only login. Other email addresses cannot join it. Verify your email to activate company rewards.';return;}
      subChoices=data.subCompanies||[];subRequired=Boolean(data.requiresSubCompany);
      if(data.company){
        const saved=company.value;choice.replaceChildren();
        choice.add(new Option('Select your company (optional)',''));
        choice.add(new Option(`${data.company} — @${data.companyDomain||data.domain}`,data.company));
        choice.value=saved===data.company?data.company:'';
        company.hidden=true;company.style.display='none';company.disabled=true;choice.hidden=false;choice.disabled=false;
        if(label)label.htmlFor=choice.id;showSubCompanies();
        note.textContent='Your email matches this registered company. Select it to share company loyalty points after email verification.';
      } else {
        showTextInput();const option=document.createElement('option');option.value=data.suggestion;list.append(option);
        note.textContent='Suggested company: '+data.suggestion+'. Enter the company name matching '+data.domain+'; it will be saved after you verify your work email.';
      }
    }catch{if(current===sequence){showTextInput();note.textContent='Company eligibility will be checked when you save.';}}
  }
  choice.addEventListener('change',()=>{company.value=choice.value;showSubCompanies();});
  email.addEventListener('input',()=>{++sequence;if(subValue)subValue.value='';if(!choice.hidden)company.value='';showTextInput();note.textContent='';clearTimeout(timer);timer=setTimeout(recommend,350);});
  email.addEventListener('change',recommend);
  recommend();
})();
