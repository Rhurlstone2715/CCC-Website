import {readFile} from 'node:fs/promises';
import {PDFDocument,rgb,degrees} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
type Kind='estimate'|'paid'|'invoice';
let fontBytes:Promise<Buffer>|undefined;
let regularBytes:Promise<Buffer>|undefined;
export async function watermarkPdf(bytes:Uint8Array,kind:Kind):Promise<Uint8Array>{
 const marker=`ccc-watermark-v1-${kind}`,doc=await PDFDocument.load(bytes);
 const footerMarker='ccc-invoice-remittance-footer-v1';
 const needsWatermark=!doc.getKeywords()?.includes(marker),needsFooter=kind==='invoice'&&!doc.getKeywords()?.includes(footerMarker);
 if(!needsWatermark&&!needsFooter)return bytes;
 doc.registerFontkit(fontkit);
 const bold=await doc.embedFont(await(fontBytes??=readFile(new URL('../assets/estimates/Arial-Bold.ttf',import.meta.url))),{subset:true});
 const label=kind==='invoice'?'INVOICE':kind==='estimate'?'ESTIMATE':'PAID',angle=35*Math.PI/180;
 const regular=needsFooter?await doc.embedFont(await(regularBytes??=readFile(new URL('../assets/estimates/Arial.ttf',import.meta.url))),{subset:true}):null;
 for(const page of doc.getPages()){
  const {width,height}=page.getSize(),size=Math.min(kind==='paid'?128:90,width*.80/bold.widthOfTextAtSize(label,1));
  const w=bold.widthOfTextAtSize(label,size),h=bold.heightAtSize(size,{descender:false});
  if(needsWatermark)page.drawText(label,{x:width/2-(w*Math.cos(angle)-h*Math.sin(angle))/2,y:height/2-(w*Math.sin(angle)+h*Math.cos(angle))/2,size,font:bold,rotate:degrees(35),color:kind==='paid'?rgb(0,.55,.16):rgb(.85,0,0),opacity:.22});
  if(regular){
   page.drawRectangle({x:68,y:141,width:288,height:30,color:rgb(1,1,1)});
   for(const [text,top]of [['Thank you for your business.',623],['Please remit payment to Cayman Crane Company',635]] as const)page.drawText(text,{x:212-regular.widthOfTextAtSize(text,9)/2,y:792-top-9,font:regular,size:9,color:rgb(0,0,0)});
  }
 }
 doc.setKeywords([doc.getKeywords()??'',marker,...(needsFooter?[footerMarker]:[])].filter(Boolean));
 return doc.save();
}
