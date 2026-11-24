/* Shared dimensional annotations; values come from the selected, capacity-screened setup. */
(()=>{
 const ns='http://www.w3.org/2000/svg',red='#c41420';
 window.drawCraneSelectorMeasures=(svg,match,geometry)=>{
  const radius=Number(match.radiusFt),height=Number(match.estimatedTipScreenFt);if(!(radius>0&&height>0))return;
  const g=document.createElementNS(ns,'g');g.setAttribute('data-selector-measurements','');svg.append(g);
  const add=(tag,a,text)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;g.append(e);return e;};
  const label=(x,y,value,a={})=>add('text',{x,y,fill:red,'font-family':'Arial, sans-serif','font-size':14,'font-weight':700,...a},value);
  const line=(x1,y1,x2,y2,a={})=>add('line',{x1,y1,x2,y2,stroke:red,'stroke-width':1.8,...a});
  const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
  const left=Math.min(geometry.pivotX,geometry.loadX),right=Math.max(geometry.pivotX,geometry.loadX),y=475;
  for(const x of[left,right]){line(x,geometry.groundY,x,y,{'stroke-dasharray':'4 4',opacity:.7});line(x,y-6,x,y+6);}
  line(left,y,right,y);label((left+right)/2,501,`Max radius ${fmt(radius)} ft`,{'text-anchor':'middle','font-size':20,'data-measure-label':'maximum-radius'});
  // Height is the conservative pre-screen, not the manufacturer's absolute tip-height maximum.
  const x=481,top=Math.max(80,Math.min(geometry.tipY,geometry.groundY-60)),bottom=geometry.groundY;
  line(x,top,x,bottom);line(x-6,top,x+6,top);line(x-6,bottom,x+6,bottom);
  label(x-10,(top+bottom)/2,`Max lift height ≈ ${fmt(height)} ft`,{transform:`rotate(-90 ${x-10} ${(top+bottom)/2})`,'text-anchor':'middle','font-size':17,'data-measure-label':'maximum-height'});
  // A separate plan view makes the circular swing radius clear without implying a scale site plan.
  const cx=590,cy=354,r=47;
  label(cx,281,'RADIUS · TOP VIEW',{'text-anchor':'middle','font-size':16});
  add('circle',{cx,cy,r,fill:'none',stroke:red,'stroke-width':1.8,'stroke-dasharray':'5 4','data-radius-circle':''});
  add('circle',{cx,cy,r:3,fill:red});line(cx,cy,cx+r,cy);line(cx+r,cy-5,cx+r,cy+5);
  label(cx,cy+74,`Max radius ${fmt(radius)} ft`,{'text-anchor':'middle','font-size':20});
 };
})();
