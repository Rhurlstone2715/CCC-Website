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
