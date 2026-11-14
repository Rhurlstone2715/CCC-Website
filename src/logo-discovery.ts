import {resolve4} from 'node:dns/promises';
import {Agent,EnvHttpProxyAgent,fetch} from 'undici';
import {load} from 'cheerio';
import sharp from 'sharp';

export function publicLogoAddress(ip:string){
 const a=ip.split('.').map(Number);if(a.length!==4||a.some(x=>!Number.isInteger(x)||x<0||x>255))return false;
 return ![0,10,127].includes(a[0])&&a[0]<224&&!(a[0]===169&&a[1]===254)&&!(a[0]===172&&a[1]>=16&&a[1]<=31)&&!(a[0]===192&&(a[1]===168||(a[1]===0&&[0,2].includes(a[2]))))&&!(a[0]===198&&([18,19].includes(a[1])||(a[1]===51&&a[2]===100)))&&!(a[0]===203&&a[1]===0&&a[2]===113)&&!(a[0]===100&&a[1]>=64&&a[1]<=127);
}
export async function logoFetch(raw:string,limit=2_000_000):Promise<{bytes:Buffer;url:string;type:string}>{
 let url=new URL(raw);
 for(let redirects=0;redirects<=4;redirects++){
  if(url.protocol!=='https:'||url.username||url.password||url.port||!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)||/\.(local|internal|localhost)$/i.test(url.hostname))throw new Error('Only public HTTPS websites are supported.');
  const ips=(await resolve4(url.hostname)).filter(publicLogoAddress);if(!ips.length)throw new Error('No public website address.');
  // Pin the validated address so a second DNS lookup cannot reach an internal host.
  const dispatcher=process.env.CCC_LOGO_RESEARCH_PROXY==='1'?new EnvHttpProxyAgent():new Agent({connect:{lookup:(_host,opts,callback)=>{const records=ips.map(address=>({address,family:4}));if(opts.all)callback(null,records);else callback(null,records[0].address,4);}}});
  try{
   const response=await fetch(url,{redirect:'manual',dispatcher,signal:AbortSignal.timeout(10000),headers:{'user-agent':'Mozilla/5.0 (compatible; CaymanCraneCompanyLogo/1.0; company identity lookup)','accept':'text/html,image/*;q=0.9,*/*;q=0.5'}});
   if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('location');await response.body?.cancel();if(!location)throw new Error('Missing website redirect.');url=new URL(location,url);continue;}
   if(!response.ok)throw new Error(`Website returned ${response.status}.`);
   if(Number(response.headers.get('content-length')||0)>limit){await response.body?.cancel();throw new Error('Logo response too large.');}
   const chunks:Buffer[]=[];let size=0;
   if(response.body)for await(const value of response.body){size+=value.length;if(size>limit)throw new Error('Logo response too large.');chunks.push(Buffer.from(value));}
   return {bytes:Buffer.concat(chunks),url:url.href,type:response.headers.get('content-type')||''};
  }finally{await dispatcher.destroy();}
 }
 throw new Error('Too many website redirects.');
}
export function logoCandidates(html:string,pageUrl:string){
 const $=load(html),found:{url:string;score:number}[]=[];
 const add=(raw:string|undefined,score:number)=>{if(!raw)return;try{const url=new URL(raw,pageUrl);if(url.protocol==='http:')url.protocol='https:';if(!['https:','data:'].includes(url.protocol))return;if(/wordpress|wix-logo|facebook|instagram|linkedin|tripadvisor|whatsapp|google-logo|recaptcha|visa|mastercard|payment|certificat/i.test(url.href))return;found.push({url:url.href,score});}catch{}};
 $('img').each((_,el)=>{const img=$(el),src=img.attr('data-src')||img.attr('src'),label=[img.attr('alt'),img.attr('class'),img.attr('id'),src].join(' ');const inHeader=img.closest('header,[role=banner]').length>0;const wide=Number(img.attr('width'))/Number(img.attr('height'))>=2;let home=false;try{const href=img.closest('a').attr('href');if(href)home=new URL(href,pageUrl).pathname==='/';}catch{}let score=/logo/i.test(label)?100:inHeader&&(wide||home)?65:0;if(wide&&score)score+=10;if(inHeader&&score)score+=200;const context=img.parents().slice(0,4).map((_,e)=>[$(e).attr('id'),$(e).attr('class')].join(' ')).get().join(' ');if(/partner|sponsor|client|brand-carousel|accredit|preloader/i.test(context))score=0;if(img.closest('[id*=video],[class*=video],video').length||/load(?:ing|er)|spinner|preloader|partner|sponsor|client|award|accredit|association|facebook|instagram|linkedin|twitter|youtube|whatsapp|social|visa|mastercard|tripadvisor/i.test(label))score=0;if(score)add(src,score);});
 $('svg').each((_,el)=>{const svg=$(el),label=[svg.attr('class'),svg.attr('id'),svg.attr('aria-label')].join(' '),inside=svg.closest('[class*=logo],[id*=logo]').length>0;if(!inside&&!/logo/i.test(label))return;if(/icon|social|search|menu|cart|arrow|loading|spinner/i.test(label))return;const box=svg.attr('viewBox')?.split(/[ ,]+/).map(Number);if(box&&box[2]<=32&&box[3]<=32)return;svg.attr('xmlns','http://www.w3.org/2000/svg');const content=$.html(svg);if(content.length>200)add('data:image/svg+xml;base64,'+Buffer.from(content).toString('base64'),350);});
 $('[style]').each((_,el)=>{const e=$(el),label=[e.attr('class'),e.attr('id'),e.attr('data-framer-name')].join(' '),style=e.attr('style')||'';if(/logo/i.test(label)){const match=style.match(/url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/i);if(match)add(match[1]||match[2]||match[3],320);}});
 $('link[rel*="icon"]').each((_,el)=>{const l=$(el);if(!/\.ico(?:\?|$)/i.test(l.attr('href')||''))add(l.attr('href'),20);});
 $('script[type="application/ld+json"]').each((_,el)=>{try{const traverse=(v:unknown)=>{if(!v||typeof v!=='object')return;if(Array.isArray(v)){v.forEach(traverse);return;}const x=v as Record<string,unknown>;if(/Organization|Corporation|LocalBusiness|Hotel|ConstructionBusiness/.test(String(x['@type']))){const logo=typeof x.logo==='string'?x.logo:(x.logo as {url?:string})?.url;add(logo,90);}if(x['@graph'])traverse(x['@graph']);};traverse(JSON.parse($(el).text()));}catch{}});
 const seen=new Set<string>();const sorted=found.sort((a,b)=>b.score-a.score);const minimum=(sorted[0]?.score??0)>=250?200:0;return sorted.filter(x=>x.score>=minimum&&!seen.has(x.url)&&!!seen.add(x.url)).slice(0,6);
}
export async function normalizeCompanyLogo(bytes:Buffer){
 const image=sharp(bytes,{limitInputPixels:16_000_000,animated:false});const metadata=await image.metadata();if((metadata.width??0)<16||(metadata.height??0)<10)throw new Error('Logo too small.');
 const sample=await sharp(bytes,{limitInputPixels:16_000_000}).resize({width:100,height:100,fit:'inside'}).ensureAlpha().raw().toBuffer();let light=0,count=0;for(let i=0;i<sample.length;i+=4){if(sample[i+3]<64)continue;light+=(sample[i]+sample[i+1]+sample[i+2])/3;count++;}
 if(count<8)throw new Error('Logo has no visible artwork.');
 const background=light/count>220?'#17212b':'#ffffff';
 return image.resize({width:440,height:200,fit:'inside',withoutEnlargement:true}).flatten({background}).webp({quality:92}).toBuffer();
}
export async function discoverCompanyLogo(homepages:string[],strict=false){
 let last='No identifiable logo found.';
 for(const homepage of homepages){
  try{const page=await logoFetch(homepage,8_000_000);if(!/html/i.test(page.type))continue;if(/this domain is for sale|buy this domain|domain parking|sedoparking/i.test(page.bytes.toString('utf8')))throw new Error('Website domain is parked.');
   for(const candidate of logoCandidates(page.bytes.toString('utf8'),page.url).filter(c=>!strict||c.score>=300)){
    try{const raw=candidate.url.startsWith('data:image/')?(candidate.url.includes(';base64,')?Buffer.from(candidate.url.slice(candidate.url.indexOf(',')+1),'base64'):Buffer.from(decodeURIComponent(candidate.url.slice(candidate.url.indexOf(',')+1)))):(await logoFetch(candidate.url)).bytes;
     const bytes=await normalizeCompanyLogo(raw);return {bytes,sourceUrl:page.url,imageUrl:candidate.url.startsWith('data:')?page.url:candidate.url};
    }catch{last='Website image could not be used.';}
   }
  }catch(e){last=e instanceof Error?e.message:'Website unavailable.';}
 }
 throw new Error(last);
}
