import test from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument,PDFName,decodePDFRawStream} from 'pdf-lib';
import {watermarkPdf} from '../dist/pdf-watermarks.js';

for (const [kind,color] of [['estimate','0.85 0 0 rg'],['paid','0 0.55 0.16 rg']]) {
 test(`${kind} watermark covers every page and remains stable on repeat delivery`,async()=>{
  const source=await PDFDocument.create();source.setTitle('Original booking');source.addPage();source.addPage();
  const stamped=await watermarkPdf(await source.save(),kind);
  const doc=await PDFDocument.load(stamped);
  assert.equal(doc.getTitle(),'Original booking');assert.equal(doc.getPageCount(),2);
  for(const page of doc.getPages()){
   const contents=page.node.lookup(PDFName.of('Contents'));
   const operators=contents.asArray().map(ref=>Buffer.from(decodePDFRawStream(doc.context.lookup(ref)).decode()).toString()).join('\n');
   assert.ok(operators.includes(color));assert.match(operators,/ Tj/);
  }
  assert.strictEqual(await watermarkPdf(stamped,kind),stamped);
 });
}
