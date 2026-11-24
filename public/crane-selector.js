(()=>{
 const form=document.getElementById('craneSelectorForm');if(!form)return;
 const results=document.getElementById('craneSelectorResults'),status=document.getElementById('craneSelectorStatus');
 const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
 const text=(tag,value,className)=>{const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;};
 const row=(dl,label,value)=>{const item=document.createElement('div');item.append(text('dt',label),text('dd',value));dl.append(item);};
 form.onsubmit=async event=>{
  event.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('button[type=submit]');button.disabled=true;results.replaceChildren();status.className='';status.textContent='Finding equipment for your lift…';
  const values=Object.fromEntries(['loadLb','liftHeightFt'].map(k=>[k,Number(form.elements[k].value)]));
  try{
   const response=await fetch('/api/crane-selector',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(values)}),data=await response.json();if(!response.ok)throw Error(data.error||'Could not calculate this lift.');
   const match=data.matches?.[0];
   status.textContent=match?'Your suggested equipment':'Please contact CCC for a lift review';
   if(match){
    const card=text('article','', 'selector-match selector-simple-match');card.append(text('p','Suggested for your lift','eyebrow red'),text('h3',match.name),text('p',`${data.recommendationReason||'Suggested after reviewing the available load charts.'} For your ${fmt(values.loadLb)} lb item at approximately ${fmt(values.liftHeightFt)} ft. Check that your site’s reach fits within the maximum radius shown.`,'selector-results-note'));
    const stats=text('dl','','selector-key-stats');
    row(stats,'Maximum radius for your load',`${fmt(match.radiusFt)} ft`);
    row(stats,'Approx. max lift height · this setup',`${fmt(match.estimatedTipScreenFt)} ft`);
    row(stats,'Recommended item-weight limit',`${fmt(match.allowedItemLb)} lb`);card.append(stats);
    if(window.renderCraneSelectorVector)card.append(window.renderCraneSelectorVector(match));
    card.append(text('p',`${fmt(match.riggingLb)} lb hook and rigging allowance included. Main boom, full outriggers. CCC confirms site conditions and availability.`,'selector-results-note'));
    const details=text('details','','selector-calculation');details.append(text('summary','View calculation and source chart'));
    const dl=document.createElement('dl');
    for(const[label,value]of [['Your item weight',`${fmt(values.loadLb)} lb`],['Hook & rigging allowance',`${fmt(match.riggingLb)} lb`],['Total suspended weight',`${fmt(match.totalLb)} lb`],['Recommended suspended-load limit',`${fmt(match.allowedGrossLb)} lb`],['Main boom length',`${fmt(match.boomFt)} ft`],['Chart boom angle',`${fmt(match.angleDeg)}°`],['Manufacturer chart rating before margin',`${fmt(match.ratedLb)} lb`],['Chart attachment deduction',`${fmt(match.deductionLb)} lb`]])row(dl,label,value);
    if(match.singleLineLimitLb)row(dl,'Single-part hook-ball rating before margin',`${fmt(match.singleLineLimitLb)} lb`);
    if(match.hourlyRate!==null)row(dl,'Published hourly rate',`KYD $${fmt(match.hourlyRate)}`);
    details.append(dl,text('p',match.setup),text('p',match.deductionNote));if(match.singleLineNote)details.append(text('p','Boom truck setup: single-part line with hook ball only. CCC confirms the actual rigging and line configuration.'));
    details.append(text('p','The recommendation accounts for chart deductions and any single-line restriction. Height is a conservative estimate for this setup, not the crane’s absolute maximum. CCC must verify the actual unit, rigging, clearance and ground conditions.'));
    const links=text('div','','selector-links'),chart=text('a',`Load chart · page ${match.page}`);chart.href='/'+match.source+'#page='+match.page;chart.target='_blank';chart.rel='noopener';links.append(chart);
    if(match.singleLineSourcePage){const line=text('a',`Hook-ball limit · page ${match.singleLineSourcePage}`);line.href='/'+match.source+'#page='+match.singleLineSourcePage;line.target='_blank';line.rel='noopener';links.append(line);}details.append(links);card.append(details);
    const view=text('a','View equipment & rates','selector-equipment-link');view.href='/rentals?category='+(match.category==='Boom Trucks'?'boom-trucks':'cranes')+'#catalog';card.append(view);results.append(card);
   }else results.append(text('p','We could not find a suitable reviewed setup for these details. Send your requirements to CCC so we can help.','selector-results-note'));
   const summary=`Lift review request\nItem weight: ${values.loadLb} lb\nApproximate lifting height: ${values.liftHeightFt} ft\n${match?`Suggested machine: ${match.name}\nMaximum chart radius: ${match.radiusFt} ft\nApproximate maximum height for this setup: ${match.estimatedTipScreenFt} ft\nRecommended item-weight limit: ${match.allowedItemLb} lb\nHook/rigging: ${match.riggingLb} lb\nMain boom: ${match.boomFt} ft at ${match.angleDeg}°`:'Manual review needed'}\nMain boom, full outriggers; CCC confirmation required.`;
   const inquire=text('a',match?'Ask CCC to confirm this lift':'Ask CCC for help','button primary');inquire.href='mailto:caymancrane@gmail.com?subject='+encodeURIComponent('Crane selection and lift review')+'&body='+encodeURIComponent(summary);results.append(inquire);
  }catch(error){status.textContent=error.message||'Could not calculate this lift. Contact CCC for a review.';status.className='selector-error';}finally{button.disabled=false;}
 };
})();
