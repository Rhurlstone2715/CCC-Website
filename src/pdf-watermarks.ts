import {readFile} from 'node:fs/promises';
import {PDFDocument,rgb,degrees} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
type Kind='estimate'|'paid'|'invoice';
let fontBytes:Promise<Buffer>|undefined;
export async function watermarkPdf(bytes:Uint8Array,kind:Kind):Promise<Uint8Array>{
 const marker=`ccc-watermark-v1-${kind}`,doc=await PDFDocument.load(bytes);
 if(doc.getKeywords()?.includes(marker))return bytes;
 doc.registerFontkit(fontkit);
 const bold=await doc.embedFont(await(fontBytes??=readFile(new URL('../assets/estimates/Arial-Bold.ttf',import.meta.url))),{subset:true});
 const label=kind==='invoice'?'INVOICE':kind==='estimate'?'ESTIMATE':'PAID',angle=35*Math.PI/180;
 for(const page of doc.getPages()){
  const {width,height}=page.getSize(),size=Math.min(kind==='paid'?128:90,width*.80/bold.widthOfTextAtSize(label,1));
  const w=bold.widthOfTextAtSize(label,size),h=bold.heightAtSize(size,{descender:false});
  page.drawText(label,{x:width/2-(w*Math.cos(angle)-h*Math.sin(angle))/2,y:height/2-(w*Math.sin(angle)+h*Math.cos(angle))/2,size,font:bold,rotate:degrees(35),color:kind==='paid'?rgb(0,.55,.16):rgb(.85,0,0),opacity:.22});
 }
 doc.setKeywords([doc.getKeywords()??'',marker].filter(Boolean));
 return doc.save();
}
