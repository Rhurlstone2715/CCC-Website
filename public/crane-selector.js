(()=>{
 const form=document.getElementById('craneSelectorForm');if(!form)return;
 const results=document.getElementById('craneSelectorResults'),status=document.getElementById('craneSelectorStatus');
 const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
 const text=(tag,value,className)=>{const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;};
 form.onsubmit=async event=>{
  event.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('button[type=submit]');button.disabled=true;results.replaceChildren();status.className='';status.textContent='Checking reviewed chart entries…';
  const values=Object.fromEntries(['loadLb','liftHeightFt'].map(k=>[k,Number(form.elements[k].value)]));
  try{
   const response=await fetch('/api/crane-selector',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(values)}),data=await response.json();if(!response.ok)throw Error(data.error||'Could not calculate this lift.');
   status.textContent=data.matches.length?`${data.matches.length} preliminary equipment match${data.matches.length===1?'':'es'} for CCC review.`:'Manual lift review required.';
   results.append(text('p','Compare each maximum chart radius with the reach needed at your site. Options are sorted by published hourly rate; CCC confirms the actual lift and availability.','selector-results-note'));
   results.append(text('p',`Item weight: ${fmt(data.loadLb)} lb · approximate lifting height: ${fmt(data.liftHeightFt)} ft. Standard rigging is included separately for each machine.`, 'selector-results-note'),text('p',data.reason,'selector-results-note'));
   data.matches.forEach((match,index)=>{
    const card=text('article','', 'selector-match');card.append(text('p',index===0?'Recommended for lift-team review':'Alternative for lift-team review','eyebrow red'),text('h3',match.name));if(window.renderCraneSelectorVector)card.append(window.renderCraneSelectorVector(match));const dl=document.createElement('dl');
    for(const [label,value]of [['Maximum qualifying chart radius',`${fmt(match.radiusFt)} ft`],['Standard rigging included',`${fmt(match.riggingLb)} lb`],['Total suspended weight',`${fmt(match.totalLb)} lb`],['Chart boom angle',`${fmt(match.angleDeg)}°`],['Main boom chart column',`${fmt(match.boomFt)} ft`],['Published capacity',`${fmt(match.ratedLb)} lb`],['Chart attachment deduction',`${fmt(match.deductionLb)} lb`],['60% gross planning limit',`${fmt(match.allowedGrossLb)} lb`],['Gross chart utilization',`${fmt(match.chartUtilizationPercent)}%`],['Published hourly rate',match.hourlyRate===null?'Confirm with CCC':`KYD $${fmt(match.hourlyRate)}`]]){const item=document.createElement('div');item.append(text('dt',label),text('dd',value));dl.append(item);}card.append(dl,text('p',match.setup),text('p',match.deductionNote),text('p','Reach screening is approximate. Boom deflection, actual hook clearance, ground bearing, obstacles, wind, hoist/reeving and the unit-specific chart must be verified by CCC.'));
    const links=text('div','','selector-links'),chart=text('a',`Review source chart · page ${match.page}`);chart.href='/'+match.source+'#page='+match.page;chart.target='_blank';chart.rel='noopener';const view=text('a','View equipment & rates');view.href='/rentals?category='+(match.category==='Boom Trucks'?'boom-trucks':'cranes')+'#catalog';links.append(chart,view);card.append(links);results.append(card);
   });
   const summary=`Crane selector lift review\nItem weight: ${values.loadLb} lb\nApproximate lifting height: ${values.liftHeightFt} ft\nMain boom, full-outrigger stationary setup only.\n60% maximum of the adjusted chart rating.\nPreliminary maximum chart radii:\n${data.matches.map(m=>`${m.name}: ${m.radiusFt} ft radius, ${m.boomFt} ft boom, ${m.angleDeg}° chart angle; ${m.riggingLb} lb standard rigging, ${m.totalLb} lb gross`).join('\n')||'Manual review required'}`;

   const inquire=text('a','Request CCC lift review','button primary');inquire.href='mailto:caymancrane@gmail.com?subject='+encodeURIComponent('Crane selection and lift review')+'&body='+encodeURIComponent(summary);results.append(inquire);
   if(data.excluded?.length)results.append(text('p',data.excluded.map(p=>`${p.name}: ${p.reason}`).join(' '),'selector-excluded'));
  }catch(error){status.textContent=error.message||'Could not calculate this lift. Contact CCC for a review.';status.className='selector-error';}finally{button.disabled=false;}
 };
})();
