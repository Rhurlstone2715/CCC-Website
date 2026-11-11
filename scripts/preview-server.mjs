// Isolated visual preview. No database, migrations, credentials or outbound notifications.
import { readFile } from 'node:fs/promises';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
// Account page rendering imports Prisma, but this unreachable fixture URL and
// stripped cookies ensure the preview cannot use a live customer account.
process.env.DATABASE_URL='postgresql://preview:preview@127.0.0.1:1/preview_disabled';
delete process.env.RESEND_API_KEY;delete process.env.GOOGLE_CLIENT_SECRET;delete process.env.PUBLIC_URL;
const {account}=await import('../dist/routes/account.js');
const app=new Hono();
const banner='<div class="preview-banner"><b>DESIGN PREVIEW</b><span>Bookings and account changes are disabled.</span><a href="/rentals?demo=1&amp;checkout=1">Try booking flow →</a></div>';
function decorate(html){return html.replace('<head>','<head><meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/preview-ui.css"><script src="/preview-ui.js"></script>').replace(/<body([^>]*)>/,'<body$1>'+banner)}
app.use('*',async(c,next)=>{c.header('X-Robots-Tag','noindex, nofollow');c.header('Cache-Control','no-store');if(!['GET','HEAD'].includes(c.req.method))return c.json({error:'This is a design preview. No bookings, account changes or emails are created.'},403);await next()});
app.get('/healthz',c=>c.text('Design preview ready'));
app.get('/catalog.js',async c=>c.body(await readFile(new URL('../data/preview-catalog.js',import.meta.url),'utf8'),200,{'content-type':'application/javascript'}));
app.get('/api/rewards',c=>c.json({error:'Preview: sign-in disabled'},401));
const directory=JSON.parse(await readFile(new URL('../data/cayman-company-directory.json',import.meta.url),'utf8')).companies;
app.get('/account/company-suggestion',c=>{const domain=(c.req.query('email')||'').toLowerCase().split('@')[1];const found=directory.find(r=>r.domain===domain);return c.json({eligible:true,company:found?.name||null,domain:found?.domain||null,mode:found?'domain':'single-email'})});
app.get('/account/profile',c=>c.redirect('/account'));
for(const path of ['/account','/account/forgot'])app.get(path,async c=>{const url=new URL(c.req.url);const route=path==='/account'?'/':'/forgot';const response=await account.request('http://preview'+route+url.search);return c.html(decorate(await response.text()))});
app.get('/privacy',c=>c.html(decorate('<!doctype html><html><head><title>Preview privacy notice</title></head><body><main style="max-width:700px;margin:80px auto;font:18px/1.7 system-ui;padding:20px"><h1>Design preview</h1><p>This preview does not create accounts, process bookings or send messages. Please use sample details only.</p><a href="/rentals">Back to equipment</a></main></body></html>')));
for(const path of ['/','/rentals'])app.get(path,async c=>c.html(decorate(await readFile(new URL('../public/rentals.html',import.meta.url),'utf8'))));
// Serve public assets only; never expose repository files or environment variables.
app.use('*',serveStatic({root:'./public'}));
serve({fetch:app.fetch,port:Number(process.env.PORT||8080),hostname:'0.0.0.0'});
