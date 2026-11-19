import {mkdir,copyFile,cp} from 'node:fs/promises';
const root=new URL('../node_modules/pdfjs-dist/',import.meta.url),out=new URL('../public/vendor/pdfjs/',import.meta.url);
await mkdir(out,{recursive:true});
for(const name of ['pdf.min.mjs','pdf.worker.min.mjs'])await copyFile(new URL('legacy/build/'+name,root),new URL(name,out));
for(const name of ['cmaps','standard_fonts','wasm'])await cp(new URL(name,root),new URL(name,out),{recursive:true});
await copyFile(new URL('LICENSE',root),new URL('LICENSE',out));
