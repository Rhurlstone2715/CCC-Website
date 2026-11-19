(()=>{
 const badge=document.querySelector('#memberRewards'),guest=document.querySelector('[data-public-rewards]'),process=document.querySelector('[data-public-booking-process]');
 if(!badge||!guest||!process)return;
 const el=id=>document.getElementById(id),number=value=>Number(value||0).toLocaleString('en-KY');
 window.CCCMemberBadge={render(data){
  if(!data?.profile||data.admin){badge.hidden=true;badge.id='memberRewards';guest.hidden=false;guest.id='rewards';process.hidden=false;return;}
  const p=data.profile,r=data.rewards||{},tier=['Member','Silver','Gold','Platinum'].includes(r.tier)?r.tier:'Member';
  el('memberRewardsName').textContent=p.companyDisplayName||p.company||p.name;
  el('memberCustomerName').textContent=p.company?`${p.name} · Company rewards`:'Personal rewards account';
  el('memberSince').textContent=p.memberSince?`Member since ${p.memberSince}`:'';
  el('memberTierName').textContent=`${tier} member`;
  el('memberTierBenefit').textContent=r.discountPercent?`${r.discountPercent}% equipment discount`:'Your rewards start here';
  badge.querySelector('.member-rewards-card').dataset.tier=tier;
  const name=data.brand?.name||p.company||p.name;el('memberInitials').textContent=name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const image=el('memberCompanyLogo'),url=data.brand?.logoUrl;
  const hasLogo=typeof url==='string'&&(/^\/company-logos\//.test(url)||/^\/?assets\/company-logos\//.test(url));
  image.hidden=!hasLogo;el('memberInitials').hidden=hasLogo;
  if(hasLogo){image.alt=`${name} logo`;image.src=url;image.onerror=()=>{image.hidden=true;el('memberInitials').hidden=false;};}
  el('memberPoints').textContent=number(r.points);
  const remaining=Math.max(0,Number(r.amountToNextCents)||0),remainingPoints=Math.ceil(remaining/100);
  const money=(remaining/100).toLocaleString('en-KY',{minimumFractionDigits:remaining%100?2:0,maximumFractionDigits:2});
  el('memberNextTier').textContent=r.nextTier?`${number(remainingPoints)} points (KYD $${money} in confirmed rentals) until ${r.nextTier} is unlocked.`:'Platinum unlocked — you have reached the highest rewards tier.';
  const pending=Math.max(0,Number(r.pendingPoints)||0);el('memberPendingPoints').hidden=!pending;el('memberPendingPoints').textContent=`${number(pending)} points pending payment confirmation`;
  const percent=Math.max(0,Math.min(100,Number(r.progressPercent)||0));
  el('memberProgress').setAttribute('aria-valuenow',String(percent));el('memberProgress').setAttribute('aria-valuetext',r.nextTier?`${number(r.points)} confirmed points. ${number(remainingPoints)} points until ${r.nextTier}.`:`${number(r.points)} confirmed points. Highest tier unlocked.`);
  process.hidden=true;guest.hidden=true;guest.id='publicRewards';badge.id='rewards';badge.hidden=false;
  el('memberProgressFill').style.width='0%';requestAnimationFrame(()=>requestAnimationFrame(()=>{el('memberProgressFill').style.width=`${percent}%`;}));
 }};
})();
