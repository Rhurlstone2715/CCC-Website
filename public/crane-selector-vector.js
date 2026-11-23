/* Chart-driven schematic. Geometry depicts the chart angle, not a scaled lift plan. */
(()=>{
 const ns='http://www.w3.org/2000/svg';
 const node=(tag,attrs={},value)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(value!==undefined)e.textContent=value;return e;};
 window.renderCraneSelectorVector=match=>{
  const angle=Number(match.angleDeg),length=Number(match.boomFt);
  if(!Number.isFinite(angle)||angle<=0||angle>90||!Number.isFinite(length)||length<=0)return document.createTextNode('Chart geometry needs CCC review.');
  const figure=document.createElement('figure');figure.className='selector-vector';
  if(match.id==='rt890e'){
   figure.dataset.equipmentDesign='rt890e-cutout';
   const row=document.createElement('div');row.className='selector-cutout-row';
   const img=document.createElement('img');img.src='/assets/catalog/rt890e-selector-cutout.png';img.alt='Yellow rough-terrain crane illustration for Grove RT890E';img.width=1254;img.height=1254;img.className='selector-crane-cutout';
   const info=document.createElement('div');info.className='selector-cutout-labels';
   for(const[tag,value]of [['strong',match.name],['b',`${angle}°`],['small','SELECTED CHART BOOM ANGLE'],['span',`${length} ft main boom`],['span',`${match.radiusFt} ft chart radius`]]){const el=document.createElement(tag);el.textContent=value;info.append(el);}
   row.append(img,info);figure.append(row);const caption=document.createElement('figcaption');caption.textContent='Equipment illustration only; its fixed boom position does not depict the selected lift. The chart angle shown alongside requires CCC lift-team confirmation.';figure.append(caption);return figure;
  }
  const svg=node('svg',{viewBox:'0 0 720 410',role:'img','aria-label':`${match.name}, main boom ${length} ft, published chart angle ${angle} degrees at ${match.radiusFt} ft chart radius. Schematic, not to scale.`});
  svg.append(node('title',{},`${match.name} — ${angle}° chart boom angle`));
  const add=(parent,tag,attrs,value)=>{const e=node(tag,attrs,value);parent.append(e);return e;};
  const label=(x,y,value,attrs={})=>add(svg,'text',{x,y,fill:'#383e47','font-family':'Arial, sans-serif','font-size':16,...attrs},value);
  label(30,33,match.name,{'font-size':23,'font-weight':800});
  label(30,59,`Main boom ${length} ft · chart radius ${match.radiusFt} ft`,{'font-size':15});
  const truck=match.category==='Boom Trucks'||/Altec|National/i.test(match.name);
  const red='#df351c',dark=truck?'#b41d13':'#08090b',metal='#303238',ink=truck?red:'#08090b';
  svg.setAttribute('data-equipment-design',truck?'red-boom-truck':'black-rt-crane');
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  add(svg,'line',{x1:30,y1:375,x2:690,y2:375,stroke:'#ccd1d6','stroke-width':2});
  // Articulated vector recreation of the supplied red truck / black RT references.
  const wheel=(x,y,r,silhouette=false)=>{
   add(svg,'circle',{cx:x,cy:y,r,fill:silhouette?'#08090b':'#25272a',stroke:silhouette?'#08090b':'#55585b','stroke-width':silhouette?4:2,...(silhouette?{'stroke-dasharray':'5 2'}:{})});
   add(svg,'circle',{cx:x,cy:y,r:r*.49,fill:silhouette?'#fff':'#b5bcc0'});
   if(!silhouette)add(svg,'circle',{cx:x,cy:y,r:r*.31,fill:'#879097'});
  };
  let px,py,direction;
  if(truck){
   px=177;py=273;direction=1;
   // Long flat deck, red bonnet cab, twin rear axles and deployed stabilizers.
   add(svg,'path',{d:'M76 343 L76 322 Q76 303 96 299 L124 296 V277 Q125 267 137 267 H155 Q168 267 168 282 V341 Z',fill:red,stroke:dark,'stroke-width':2});
   add(svg,'path',{d:'M128 279 Q128 274 137 274 H153 Q160 274 160 282 V302 H127 Z',fill:'#237d8b',stroke:'#176371','stroke-width':2});
   add(svg,'line',{x1:140,y1:275,x2:138,y2:302,stroke:'#81b7be','stroke-width':2});
   add(svg,'path',{d:'M124 306 H160 V337 H124 Z',fill:'#cb281b'});
   add(svg,'rect',{x:148,y:310,width:9,height:3,rx:1,fill:dark});
   add(svg,'path',{d:'M79 321 L91 313 H114 V324 H79 Z',fill:'#f26036'});
   add(svg,'rect',{x:77,y:331,width:8,height:10,fill:'#151515'});
   add(svg,'path',{d:'M77 342 H390 V352 H76 Q70 352 70 345 Z',fill:'#18191b'});
   add(svg,'rect',{x:165,y:328,width:222,height:9,fill:red});
   add(svg,'rect',{x:167,y:337,width:220,height:7,fill:'#222'});
   for(let x=191;x<385;x+=27)add(svg,'rect',{x,y:330,width:12,height:2,fill:'#fff'});
   add(svg,'rect',{x:217,y:348,width:48,height:18,fill:'#8d8f90',stroke:'#505154'});
   add(svg,'line',{x1:240,y1:349,x2:240,y2:365,stroke:'#c6c7c8'});
   wheel(104,350,23);wheel(292,350,23);wheel(341,350,23);
   for(const x of [172,373]){add(svg,'rect',{x:x-4,y:337,width:9,height:35,fill:red});add(svg,'rect',{x:x-9,y:371,width:19,height:4,rx:2,fill:'#46413d'});}
   add(svg,'rect',{x:166,y:282,width:21,height:46,fill:dark});
   add(svg,'path',{d:'M171 279 L157 266 Q151 258 158 252 L167 249 L193 273 Q197 280 190 284 Z',fill:dark});
   add(svg,'rect',{x:382,y:278,width:3,height:50,fill:'#111'});
   add(svg,'rect',{x:381,y:274,width:5,height:6,fill:dark});
  }else{
   px=370;py=280;direction=-1;
   // Two large treaded wheels, high cab and counterweight from the RT silhouette.
   add(svg,'path',{d:'M156 335 L178 324 H235 L244 314 H337 L346 304 H416 L423 322 H439 L443 349 L431 359 H161 L151 348 Z',fill:ink});
   add(svg,'path',{d:'M242 324 L236 286 Q236 276 246 275 L299 271 Q310 271 311 285 L315 317 L348 303 L369 280 H386 L389 293 H418 Q428 293 429 305 V319 H343 L333 337 Z',fill:ink});
   add(svg,'path',{d:'M245 283 L255 281 L253 311 H242 Z',fill:'#fff'});
   add(svg,'rect',{x:260,y:280,width:33,height:30,rx:3,fill:'#fff'});
   for(const x of [169,424])add(svg,'path',{d:`M${x} 345 v26 m-8 3 h16`,stroke:ink,'stroke-width':5,fill:'none'});
   wheel(208,345,30,true);wheel(363,345,30,true);
  }
  const boomScale=.78,boomLength=250*boomScale,radians=angle*Math.PI/180;
  add(svg,'line',{x1:px,y1:py,x2:px+direction*145,y2:py,stroke:'#adb5bd','stroke-dasharray':'5 5'});
  const boomBase=add(svg,'g',{transform:`translate(${px} ${py}) scale(${direction*boomScale} ${boomScale})`});
  const boom=add(boomBase,'g',{transform:`rotate(${-angle})`,'data-chart-angle':angle});
  if(!reduced)add(boom,'animateTransform',{attributeName:'transform',type:'rotate',from:'-8',to:-angle,dur:'1.3s',fill:'freeze',calcMode:'spline',keySplines:'.2 .65 .3 1',keyTimes:'0;1'});
  // Telescopic stages slide inside one another while maintaining a continuous boom.
  add(boom,'path',{d:'M-7 -11 Q-13 0 -7 11 H111 V-11 Z',fill:ink});
  for(const [x,width,height,fill,start]of [[80,100,16,truck?'#191b1d':ink,15],[166,84,11,truck?'#202224':ink,70]]){
   const stage=add(boom,'rect',{x,y:-height/2,width,height,rx:2,fill});
   if(!reduced)add(stage,'animate',{attributeName:'x',from:start,to:x,dur:'1.3s',fill:'freeze'});
   add(stage,'title',{},'Telescopic main boom');
  }
  for(const x of [107,175])add(boom,'path',{d:`M${x} -12 v24`,stroke:truck?'#5d5f61':'#fff','stroke-width':2});
  add(boom,'path',{d:'M0 10 L55 17 L92 5',stroke:truck?'#9d130f':ink,'stroke-width':7,fill:'none'});
  add(boom,'path',{d:'M53 17 L83 8',stroke:truck?'#bcc0c3':'#42454a','stroke-width':3});
  add(boom,'circle',{cx:0,cy:0,r:6,fill:truck?'#64231e':'#222'});
  const head=add(boom,'rect',{x:244,y:-13,width:10,height:26,rx:3,fill:truck?'#626466':ink});
  if(!reduced)add(head,'animate',{attributeName:'x',from:148,to:244,dur:'1.3s',fill:'freeze'});
  const arc=44,ax=px+direction*arc*Math.cos(radians),ay=py-arc*Math.sin(radians);
  add(svg,'path',{d:`M${px+direction*arc} ${py} A${arc} ${arc} 0 0 ${direction===1?0:1} ${ax} ${ay}`,fill:'none',stroke:ink,'stroke-width':2});
  label(px+direction*65-15,py-12,`${angle}°`,{fill:dark,'font-weight':800,'font-size':18});
  const tx=px+direction*boomLength*Math.cos(radians),ty=py-boomLength*Math.sin(radians);
  const rigging=add(svg,'g',{class:'selector-vector-rigging'});
  add(rigging,'line',{x1:tx,y1:ty,x2:tx,y2:ty+59,stroke:metal,'stroke-width':2});
  if(!truck)add(rigging,'line',{x1:tx-5,y1:ty,x2:tx-5,y2:ty+59,stroke:metal,'stroke-width':1});
  if(truck){rigging.setAttribute('data-hoist','single-part-hook-ball');add(rigging,'circle',{cx:tx,cy:ty+66,r:8,fill:'#f3c837',stroke:dark});}else add(rigging,'path',{d:`M${tx-7} ${ty+58} Q${tx} ${ty+53} ${tx+7} ${ty+58} L${tx+4} ${ty+75} H${tx-4} Z`,fill:ink,stroke:dark});
  if(truck)for(const offset of [60,66])add(rigging,'path',{d:`M${tx-5} ${ty+offset} l10 5`,stroke:dark,'stroke-width':2});
  add(rigging,'path',{d:`M${tx} ${ty+75} v5 q-11 13 -13 0`,fill:'none',stroke:truck?dark:ink,'stroke-width':3});
  // Label deliberately stays horizontal for readability on phones.
  label(500,139,`${angle}°`,{fill:red,'font-size':39,'font-weight':800});
  label(500,166,'CHART BOOM ANGLE',{'font-size':12,'font-weight':700});
  label(500,194,`${length} ft main boom`,{'font-size':16,'font-weight':700});
  label(500,219,`${match.radiusFt} ft chart radius`,{'font-size':14});
  label(30,400,'Illustration only · not to scale · CCC must verify the actual lift',{'font-size':13,fill:'#68717b'});
  figure.append(svg);const caption=document.createElement('figcaption');caption.textContent=`${match.name}: ${angle}° published loaded boom angle at the selected ${match.radiusFt} ft chart radius. The exact lift angle and extension require CCC confirmation.`;figure.append(caption);return figure;
 };
})();
