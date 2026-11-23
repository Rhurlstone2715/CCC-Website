/* Chart-driven schematic. Geometry depicts the chart angle, not a scaled lift plan. */
(()=>{
 const ns='http://www.w3.org/2000/svg';
 const node=(tag,attrs={},value)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(value!==undefined)e.textContent=value;return e;};
 window.renderCraneSelectorVector=match=>{
  const angle=Number(match.angleDeg),length=Number(match.boomFt);
  if(!Number.isFinite(angle)||angle<=0||angle>90||!Number.isFinite(length)||length<=0)return document.createTextNode('Chart geometry needs CCC review.');
  const figure=document.createElement('figure');figure.className='selector-vector';
  const svg=node('svg',{viewBox:'0 0 720 410',role:'img','aria-label':`${match.name}, main boom ${length} ft, published chart angle ${angle} degrees at ${match.radiusFt} ft chart radius. Schematic, not to scale.`});
  svg.append(node('title',{},`${match.name} — ${angle}° chart boom angle`));
  const add=(parent,tag,attrs,value)=>{const e=node(tag,attrs,value);parent.append(e);return e;};
  const label=(x,y,value,attrs={})=>add(svg,'text',{x,y,fill:'#383e47','font-family':'Arial, sans-serif','font-size':16,...attrs},value);
  label(30,33,match.name,{'font-size':23,'font-weight':800});
  label(30,59,`Main boom ${length} ft · chart radius ${match.radiusFt} ft`,{'font-size':15});
  const truck=match.category==='Boom Trucks'||/Altec|National/i.test(match.name);
  const red='#bc101c',dark='#870912',metal='#3c4650';
  add(svg,'line',{x1:30,y1:375,x2:690,y2:375,stroke:'#ccd1d6','stroke-width':2});
  // Outriggers and chassis.
  for(const x of [112,337]){add(svg,'path',{d:`M${x} 343 v29 h-20 m20 0 h20`,stroke:metal,'stroke-width':7,fill:'none'});}
  add(svg,'rect',{x:truck?80:102,y:326,width:truck?287:265,height:23,rx:5,fill:dark});
  for(const x of truck?[114,292,333]:[150,202,303]){add(svg,'circle',{cx:x,cy:351,r:21,fill:'#20262c'});add(svg,'circle',{cx:x,cy:351,r:10,fill:'#b6bec7'});}
  if(truck){
   add(svg,'path',{d:'M76 326 V290 Q76 282 86 282 H130 L155 307 V329 Z',fill:red});
   add(svg,'path',{d:'M87 290 H126 L141 306 H87 Z',fill:'#bcd8e4'});
   add(svg,'rect',{x:165,y:313,width:192,height:13,fill:red});
  }else{
   add(svg,'rect',{x:126,y:301,width:150,height:25,rx:5,fill:red});
   add(svg,'path',{d:'M282 326 V285 H319 L342 308 V326 Z',fill:red});
   add(svg,'path',{d:'M291 292 H315 L330 307 H291 Z',fill:'#bcd8e4'});
  }
  const px=230,py=303,boomLength=250,radians=angle*Math.PI/180;
  add(svg,'line',{x1:px,y1:py,x2:px+145,y2:py,stroke:'#adb5bd','stroke-dasharray':'5 5'});
  const boomBase=add(svg,'g',{transform:`translate(${px} ${py})`});
  const boom=add(boomBase,'g',{transform:`rotate(${-angle})`,'data-chart-angle':angle});
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(!reduced)add(boom,'animateTransform',{attributeName:'transform',type:'rotate',from:'-8',to:-angle,dur:'1.3s',fill:'freeze',calcMode:'spline',keySplines:'.2 .65 .3 1',keyTimes:'0;1'});
  // Three nested red telescopic sections extend along the boom's local axis.
  for(const [x,y,width,height,color]of [[0,-14,100,28,dark],[64,-11,112,22,red],[138,-8,112,16,'#e22531']]){
   const part=add(boom,'rect',{x,y,width,height,rx:3,fill:color,stroke:dark,'stroke-width':1});
   if(x>0&&!reduced)add(part,'animate',{attributeName:'width',from:35,to:width,dur:'1.3s',fill:'freeze'});
  }
  add(boom,'circle',{cx:0,cy:0,r:11,fill:metal});add(boom,'circle',{cx:250,cy:0,r:6,fill:metal});
  const arc=48,ax=px+arc*Math.cos(radians),ay=py-arc*Math.sin(radians);
  add(svg,'path',{d:`M${px+arc} ${py} A${arc} ${arc} 0 0 0 ${ax} ${ay}`,fill:'none',stroke:red,'stroke-width':2});
  label(px+61,py-15,`${angle}°`,{fill:dark,'font-weight':800,'font-size':20});
  const tx=px+boomLength*Math.cos(radians),ty=py-boomLength*Math.sin(radians);
  const rigging=add(svg,'g',{class:'selector-vector-rigging'});
  add(rigging,'line',{x1:tx,y1:ty,x2:tx,y2:ty+59,stroke:metal,'stroke-width':2});
  add(rigging,'rect',{x:tx-5,y:ty+57,width:10,height:14,rx:3,fill:dark});
  add(rigging,'path',{d:`M${tx} ${ty+71} v7 q12 13 15 0`,fill:'none',stroke:metal,'stroke-width':4});
  // Label deliberately stays horizontal for readability on phones.
  label(500,139,`${angle}°`,{fill:red,'font-size':39,'font-weight':800});
  label(500,166,'CHART BOOM ANGLE',{'font-size':12,'font-weight':700});
  label(500,194,`${length} ft main boom`,{'font-size':16,'font-weight':700});
  label(500,219,`${match.radiusFt} ft chart radius`,{'font-size':14});
  label(30,400,'Illustration only · not to scale · CCC must verify the actual lift',{'font-size':13,fill:'#68717b'});
  figure.append(svg);const caption=document.createElement('figcaption');caption.textContent=`${match.name}: ${angle}° published loaded boom angle at the selected ${match.radiusFt} ft chart radius. The exact lift angle and extension require CCC confirmation.`;figure.append(caption);return figure;
 };
})();
