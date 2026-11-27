import{estimateSnapshot,renderEstimatePdf}from'../estimates.js';
import {Hono} from 'hono';
import {type AppEnv,requireAdmin} from '../auth.js';
import {prisma} from '../db.js';
import {watermarkPdf} from '../pdf-watermarks.js';
import {bookingRef} from '../bookings.js';

export const adminDocuments=new Hono<AppEnv>();
adminDocuments.use('*',requireAdmin);
adminDocuments.get('/preview/jr-latest',async c=>{
 const company={OR:[{contains:'J&R',mode:'insensitive' as const},{contains:'J & R',mode:'insensitive' as const}]};
 const booking=await prisma.booking.findFirst({where:{OR:[...company.OR.map(v=>({company:v})),...company.OR.map(v=>({companyAccount:{name:v}}))]},orderBy:[{createdAt:'desc'},{id:'desc'}],select:{id:true}});
 if(!booking)return c.text('No J&R Construction booking was found.',404);
 c.header('Cache-Control','private, no-store');return c.redirect(`/admin/bookings/${booking.id}/documents/invoice-preview`);
});
async function documentFor(bookingId:number,kind:string){
 if(kind==='invoice-preview'){
  return prisma.$transaction(async tx=>{const b=await tx.booking.findUnique({where:{id:bookingId}});if(!b)return null;const s=await estimateSnapshot(tx,b,0);s.date=new Date().toLocaleDateString('en-GB',{timeZone:'America/Cayman',day:'numeric',month:'short',year:'numeric'});const pdf=await renderEstimatePdf(s,true,undefined,{number:'PREVIEW',amountPaidCents:b.status==='PAID'?(b.amountPaidCents??0):0});return{title:'Invoice preview — not issued',pdf,mark:'invoice' as const,download:`/admin/bookings/${bookingId}/documents/invoice-preview/pdf`};},{timeout:30000});
 }
 if(kind==='estimate'){
  const e=await prisma.estimate.findUnique({where:{bookingId}});
  return e?{title:`Estimate #${e.number}`,pdf:e.pdf,mark:'estimate' as const,download:`/account/bookings/${bookingId}/estimate.pdf`}:null;
 }
 if(kind==='receipt'){
  const r=await prisma.paymentReceipt.findFirst({where:{bookingId,supersededAt:null,booking:{status:'PAID'}},orderBy:{id:'desc'}});
  return r?{title:`Paid receipt R-${String(r.id).padStart(6,'0')}`,pdf:r.pdf,mark:'paid' as const,download:`/account/bookings/${bookingId}/receipt.pdf`}:null;
 }
 const invoice=/^invoice-(\d+)$/.exec(kind);
 if(invoice){const i=await prisma.finalInvoice.findFirst({where:{bookingId,id:Number(invoice[1])}});return i?{title:`Invoice #${i.number}`,pdf:i.pdf,mark:'invoice' as const,download:`/account/bookings/${bookingId}/invoices/${i.id}.pdf`}:null;}
 const archive=/^estimate-(\d+)$/.exec(kind);
 if(archive){
  const e=await prisma.estimateArchive.findFirst({where:{bookingId,number:Number(archive[1])}});
  return e?{title:`Previous estimate #${e.number}`,pdf:e.pdf,mark:'estimate' as const,download:`/admin/bookings/${bookingId}/estimates/${e.number}.pdf`}:null;
 }
 return null;
}
adminDocuments.get('/:id{[0-9]+}/documents/:kind/pdf',async c=>{
 const document=await documentFor(Number(c.req.param('id')),c.req.param('kind'));if(!document)return c.notFound();
 c.header('Content-Type','application/pdf');c.header('Cache-Control','private, no-store');c.header('X-Content-Type-Options','nosniff');
 return c.body(new Uint8Array(await watermarkPdf(document.pdf,document.mark)));
});
adminDocuments.get('/:id{[0-9]+}/documents/:kind',async c=>{
 const id=Number(c.req.param('id')),kind=c.req.param('kind'),document=await documentFor(id,kind);if(!document)return c.notFound();
 return c.html(<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/><meta name="apple-mobile-web-app-capable" content="yes"/><meta name="theme-color" content="#17181a"/><title>{document.title} — Cayman Crane Admin</title><link rel="icon" href="/assets/ccc-icon-192.png"/><link rel="stylesheet" href="/admin-document-viewer.css"/><script type="module" src="/admin-document-viewer.js"></script></head><body>
  <header class="document-toolbar"><a class="document-back" href={`/admin/bookings/${id}`}>← Back to booking</a><div><h1>{document.title}</h1><small>{bookingRef(id)}</small></div><a class="document-download" href={document.download} target="_blank" rel="noopener" download>Download PDF</a></header>
  <main id="documentPages" aria-label={document.title} data-pdf-url={`/admin/bookings/${id}/documents/${kind}/pdf`}><p id="documentStatus" role="status">Loading document…</p></main><noscript><p>Enable JavaScript to preview this PDF. You can still use Back to booking or Download PDF above.</p></noscript>
 </body></html>);
});
