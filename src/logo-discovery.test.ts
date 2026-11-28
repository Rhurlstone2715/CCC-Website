import assert from 'node:assert/strict';import{test}from'node:test';
import{logoCandidates,publicLogoAddress,logoFetch,normalizeCompanyLogo}from'./logo-discovery.js';
test('company logo lookup rejects private, loopback and metadata addresses',async()=>{
 for(const ip of ['127.0.0.1','10.0.0.1','169.254.169.254','172.16.2.1','192.168.1.1','100.64.0.1','0.0.0.0','::1','999.2.3.4'])assert.equal(publicLogoAddress(ip),false,ip);
 for(const ip of ['104.18.1.1','192.0.78.24','198.185.159.144'])assert.equal(publicLogoAddress(ip),true,ip);
 for(const url of ['http://example.com/logo.png','https://127.0.0.1/logo','https://host.internal/logo','https://name:password@example.com/'])await assert.rejects(()=>logoFetch(url));
});
test('official header branding is preferred to sponsor logos and photos',()=>{
 const html='<header><div id="videoContainer"><img src="/building.jpg" width="426" height="240"></div><a href="/"><img src="/company-logo.png" width="400" height="100" alt="Company logo"></a><img src="/fb.png" alt="Facebook icon"></header><section class="partner-logos"><img src="/sponsor-logo.png" alt="Partner"></section><img src="/loading.gif" alt="Loading">';
 const candidates=logoCandidates(html,'https://example.com/');assert.equal(candidates[0].url,'https://example.com/company-logo.png');assert.equal(candidates.some(x=>/building|sponsor|fb.png|loading/.test(x.url)),false);
});
test('inline brand SVGs are discoverable and unsafe image bytes are rejected',async()=>{
 const list=logoCandidates('<header><svg class="brand-logo" viewBox="0 0 400 100"><path d="'+('M0 0 L400 100 '.repeat(20))+'"/></svg></header>','https://example.com/');assert.ok(list[0].url.startsWith('data:image/svg+xml;base64,'));
 await assert.rejects(()=>normalizeCompanyLogo(Buffer.from('<html>not a logo</html>')));
});

test('company logo conversion preserves native alpha and enclosed white brand details',async()=>{
 const sharp=(await import('sharp')).default;
 const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect width="100" height="60" fill="white"/><rect x="15" y="10" width="70" height="40" fill="#c00000"/><rect x="30" y="20" width="40" height="20" fill="white"/></svg>');
 const output=await normalizeCompanyLogo(svg);assert.equal((await sharp(output).metadata()).hasAlpha,true);
 const{data,info}=await sharp(output).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const center=(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*4;assert.equal(data[center+3],255);assert.ok(data[center]>235,'enclosed white artwork is retained');
 const native=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><circle cx="50" cy="30" r="20" fill="white"/></svg>');
 const result=await normalizeCompanyLogo(native);assert.equal((await sharp(result).stats()).isOpaque,false,'native transparent background stays transparent');
});

test('social SVGs inside a footer logo container cannot replace official company branding',()=>{
 const svg='<svg viewBox="0 0 512 512"><path d="'+('M0 0 L512 512 '.repeat(20))+'"/></svg>';
 const html='<header><img src="/official-logo.png" alt="Company logo"></header><footer class="logo-footer"><a href="https://instagram.com/company">'+svg+'</a><a href="https://facebook.com/company">'+svg+'</a></footer>';
 assert.equal(logoCandidates(html,'https://example.com/')[0].url,'https://example.com/official-logo.png');
});
