/* Pixel-preserving PNG layers. Chart geometry remains a preliminary schematic. */
(()=>{
 const colours={rt890e:'yellow',rt635c:'yellow',rt175:'grey-white',rt40:'grey-white'};
 const ns='http://www.w3.org/2000/svg';
 const el=(tag,attrs={},text)=>{const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;};
 window.renderRtCraneImage=match=>{
  const colour=colours[match.id];if(!colour)return null;
  const angle=Number(match.angleDeg),length=Number(match.boomFt);if(!(angle>0&&angle<=90&&length>0))return null;
  const figure=document.createElement('figure');figure.className='selector-vector';figure.dataset.equipmentDesign='rt-artwork-'+colour;
  const svg=el('svg',{viewBox:'0 0 720 560',role:'img','aria-label':`${match.name}, ${colour==='yellow'?'yellow':'grey and white'} crane, ${angle} degree chart angle, ${length} ft main boom. Animated extension; schematic, not to scale.`});
  const add=(p,t,a,s)=>{const n=el(t,a,s);p.append(n);return n;};
  const label=(x,y,text,attrs={})=>add(svg,'text',{x,y,fill:'#383e47','font-family':'Arial, sans-serif','font-size':15,...attrs},text);
  add(svg,'title',{},`${match.name} — extending main boom at ${angle}°`);
  label(25,33,match.name,{'font-size':23,'font-weight':800});label(25,58,`${length} ft main boom · ${match.radiusFt} ft chart radius`);
  const pivot={x:875,y:875},delta=(angle-45)*Math.PI/180;
  const rotate=p=>({x:pivot.x+(p.x-pivot.x)*Math.cos(delta)-(p.y-pivot.y)*Math.sin(delta),y:pivot.y+(p.x-pivot.x)*Math.sin(delta)+(p.y-pivot.y)*Math.cos(delta)});
  const anchor={x:111,y:198},hookEnd=rotate(anchor),hookStart=rotate({x:anchor.x+220,y:anchor.y+220});
  const points=[{x:325,y:730},{x:1120,y:1160},...[[58,124],[170,56],[236,146],[952,823],[480,534]].map(([x,y])=>rotate({x,y})),hookEnd,{x:hookEnd.x+45,y:hookEnd.y+300},hookStart,{x:hookStart.x+45,y:hookStart.y+300}];
  const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
  const scale=Math.min(450/(maxX-minX),315/(maxY-minY));
  const scene=add(svg,'g',{transform:`translate(${25-minX*scale} ${85-minY*scale}) scale(${scale})`});
  const image=(parent,part)=>add(parent,'image',{href:`/assets/catalog/rt-selector/${colour}-${part}.png`,x:0,y:0,width:1254,height:1254,'data-art-part':part});
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const boom=add(scene,'g',{transform:`rotate(${angle-45} 875 875)`,'data-chart-angle':angle,'data-source-angle':45});
  const upper=add(boom,'g',{transform:'translate(0 0)','data-telescoping-stage':'upper'});image(upper,'boom-upper');
  if(!reduced)add(upper,'animateTransform',{attributeName:'transform',type:'translate',from:'220 220',to:'0 0',dur:'1.4s',fill:'freeze',calcMode:'spline',keySplines:'.2 .65 .3 1',keyTimes:'0;1'});
  image(boom,'boom-base');
  // Move the original hydraulic-cylinder pixels between the fixed chassis pin and rotated boom pin.
  const base={x:643,y:910},mount={x:518,y:577},end=rotate(mount);
  const original=Math.atan2(mount.y-base.y,mount.x-base.x)*180/Math.PI;
  const current=Math.atan2(end.y-base.y,end.x-base.x)*180/Math.PI;
  const stretch=Math.hypot(end.x-base.x,end.y-base.y)/Math.hypot(mount.x-base.x,mount.y-base.y);
  const piston=add(scene,'g',{transform:`translate(${base.x} ${base.y}) rotate(${current}) scale(${stretch} 1) rotate(${-original}) translate(${-base.x} ${-base.y})`});image(piston,'cylinder');
  image(scene,'body');
  const hook=add(scene,'g',{transform:`translate(${hookEnd.x-anchor.x} ${hookEnd.y-anchor.y})`,'data-art-rigging':'vertical'});image(hook,'hook');
  if(!reduced)add(hook,'animateTransform',{attributeName:'transform',type:'translate',from:`${hookStart.x-anchor.x} ${hookStart.y-anchor.y}`,to:`${hookEnd.x-anchor.x} ${hookEnd.y-anchor.y}`,dur:'1.4s',fill:'freeze',calcMode:'spline',keySplines:'.2 .65 .3 1',keyTimes:'0;1'});
  add(svg,'line',{x1:25,y1:414,x2:475,y2:414,stroke:'#ccd1d6','stroke-width':2});
  label(500,141,`${angle}°`,{fill:'#bc101c','font-size':36,'font-weight':800});label(500,166,'CHART BOOM ANGLE',{'font-size':11,'font-weight':700});
  label(500,194,`${length} ft main boom`);label(500,219,'Planned lift setup',{'font-size':14});
  window.drawCraneSelectorMeasures?.(svg,match,{pivotX:25-minX*scale+pivot.x*scale,loadX:25-minX*scale+hookEnd.x*scale,tipY:85-minY*scale+hookEnd.y*scale,groundY:414});
  label(25,545,'Dimensions apply to this load and setup · schematic, not to scale',{'font-size':13,fill:'#68717b'});
  figure.append(svg);
  if(!reduced){
   queueMicrotask(()=>{if(!svg.isConnected)return;svg.pauseAnimations();svg.setCurrentTime(0);if(!('IntersectionObserver'in window)){svg.unpauseAnimations();return;}const observer=new IntersectionObserver(entries=>{if(!svg.isConnected){observer.disconnect();return;}if(entries.some(e=>e.isIntersecting)){svg.unpauseAnimations();observer.disconnect();}},{threshold:.2});observer.observe(svg);});
  }
  const caption=document.createElement('figcaption');caption.textContent='Illustration only. Height is approximate for this boom setup; CCC confirms rigging, ground conditions and clearance.';figure.append(caption);return figure;
 };
})();
