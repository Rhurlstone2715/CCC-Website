(()=>{
 const canvas=document.querySelector('#signatureCanvas');if(!canvas)return;
 const ctx=canvas.getContext('2d'),field=document.querySelector('#signatureDrawing'),status=document.querySelector('#signatureStatus');
 let strokes=[],active=null,pointer=null;
 function render(){ctx.clearRect(0,0,1000,300);ctx.strokeStyle='#161616';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';for(const s of strokes){ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}field.value=JSON.stringify(strokes.filter(s=>s.length>1));}
 function point(e){const r=canvas.getBoundingClientRect();return [Math.round(Math.max(0,Math.min(1000,(e.clientX-r.left)*1000/r.width))*10)/10,Math.round(Math.max(0,Math.min(300,(e.clientY-r.top)*300/r.height))*10)/10];}
 canvas.addEventListener('pointerdown',e=>{if(pointer!==null||e.button!==0||strokes.length>=64)return;e.preventDefault();pointer=e.pointerId;canvas.setPointerCapture(pointer);active=[point(e)];strokes.push(active);status.textContent='Signing…';});
 canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer||!active)return;e.preventDefault();if(strokes.reduce((n,s)=>n+s.length,0)>=5000)return;active.push(point(e));render();});
 function end(e){if(e.pointerId!==pointer)return;pointer=null;active=null;strokes=strokes.filter(s=>s.length>1);render();status.textContent=strokes.length?'Signature captured. You can clear it and sign again.':'Signature required.';}
 canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
 const clear=()=>{strokes=[];active=null;pointer=null;field.value='';render();status.textContent='Signature cleared. Please sign again.';};
 document.querySelector('#clearSignature').onclick=clear;
 window.bookingSignaturePad={clear,validate(){let length=0;for(const s of strokes)for(let i=1;i<s.length;i++)length+=Math.hypot(s[i][0]-s[i-1][0],s[i][1]-s[i-1][1]);if(length<10){status.textContent='Please draw your signature before submitting.';canvas.focus();return false;}return true;}};
})();
