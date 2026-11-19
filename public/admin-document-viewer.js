import {getDocument,GlobalWorkerOptions} from '/vendor/pdfjs/pdf.min.mjs';
GlobalWorkerOptions.workerSrc='/vendor/pdfjs/pdf.worker.min.mjs';
const pages=document.querySelector('#documentPages'),status=document.querySelector('#documentStatus');
(async()=>{
 try{
  const response=await fetch(pages.dataset.pdfUrl,{credentials:'same-origin',cache:'no-store'});
  if(!response.ok||!response.headers.get('content-type')?.includes('application/pdf'))throw Error('Your session may have expired. Use Back to booking to sign in again.');
  const pdf=await getDocument({data:new Uint8Array(await response.arrayBuffer()),isEvalSupported:false,disableWorkerRendering:true,cMapUrl:'/vendor/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'/vendor/pdfjs/standard_fonts/',wasmUrl:'/vendor/pdfjs/wasm/'}).promise;
  for(let i=1;i<=pdf.numPages;i++){
   status.textContent=`Loading page ${i} of ${pdf.numPages}…`;
   const page=await pdf.getPage(i),base=page.getViewport({scale:1}),width=Math.max(240,Math.min(pages.clientWidth-24,900)),scale=width/base.width;
   const viewport=page.getViewport({scale:scale*Math.min(window.devicePixelRatio||1,2)});
   const figure=document.createElement('figure');figure.className='document-page';const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`Page ${i} of ${pdf.numPages}`);
   const caption=document.createElement('figcaption');caption.textContent=`Page ${i} of ${pdf.numPages}`;figure.append(canvas,caption);pages.append(figure);
   await page.render({canvasContext:canvas.getContext('2d'),canvas,viewport}).promise;
  }
  status.hidden=true;
 }catch(error){status.textContent=`Could not preview the document. ${error.message||'Try again or use Download PDF.'}`;}
})();
