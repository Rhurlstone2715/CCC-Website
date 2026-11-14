import {readFileSync} from 'node:fs';
import {Hono} from 'hono';
import type {AppEnv} from './auth.js';
import {prisma} from './db.js';
import {verifiedCompanyMembership} from './companies.js';
import {discoverCompanyLogo} from './logo-discovery.js';
type LogoAsset={name:string;path:string;sourceUrl:string;imageUrl:string};
let manifest:Record<string,LogoAsset>|undefined;
export function researchedCompanyLogos(){if(!manifest){try{manifest=JSON.parse(readFileSync(new URL('../public/assets/company-logos/manifest.json',import.meta.url),'utf8'));}catch{manifest={};}}return manifest!;}
export type RewardsBrand={name:string;parentName:string|null;initials:string;logoUrl:string|null};
export async function rewardsBrand(userId:number):Promise<RewardsBrand|null>{
 const membership=await verifiedCompanyMembership(userId);if(!membership)return null;
 const company=await prisma.company.findUnique({where:{id:membership.companyAccountId},include:{subCompanies:true}});if(!company)return null;
 const sub=company.subCompanies.find(s=>s.id===membership.subCompanyId);
 const name=sub?.name??company.name,initials=name.split(/\s+/).filter(w=>/[a-z0-9]/i.test(w)).slice(0,2).map(w=>w[0]).join('').toUpperCase();
 const domains=[...new Set([sub?.domain,company.domain].filter((d):d is string=>Boolean(d)))];
 const keys=[...new Set([...(sub?[`subcompany:${sub.id}`,...(sub.domain?[`domain:${sub.domain}`]:[])]:[]),`company:${company.id}`,...domains.map(d=>`domain:${d}`)])];
 const cached=await prisma.companyLogo.findMany({where:{key:{in:keys},data:{not:null}},select:{key:true,checkedAt:true}});
 let logoUrl:string|null=null;
 for(const key of keys){const row=cached.find(c=>c.key===key);if(row){logoUrl=`/company-logos/${encodeURIComponent(key)}?v=${row.checkedAt.getTime()}`;break;}
  if(key.startsWith('domain:')){const asset=researchedCompanyLogos()[key.slice(7)];if(asset){logoUrl=asset.path;break;}}
 }
 return {name,parentName:sub?company.name:null,initials,logoUrl};
}
export const companyLogos=new Hono<AppEnv>();
companyLogos.get('/:key',async c=>{const logo=await prisma.companyLogo.findUnique({where:{key:c.req.param('key')}});if(!logo?.data)return c.notFound();c.header('Content-Type','image/webp');c.header('Cache-Control','public, max-age=3600');c.header('X-Content-Type-Options','nosniff');return c.body(new Uint8Array(logo.data));});
let busy=false;
export async function refreshCompanyLogos(){
 if(busy)return;busy=true;
 try{
  const companies=await prisma.company.findMany({where:{archivedAt:null},select:{domain:true,subCompanies:{select:{domain:true}}}});
  const domains=[...new Set(companies.flatMap(c=>[c.domain,...c.subCompanies.map(s=>s.domain)]).filter((d):d is string=>Boolean(d)))].filter(d=>!researchedCompanyLogos()[d]);
  const existing=await prisma.companyLogo.findMany({where:{key:{in:domains.map(d=>`domain:${d}`)}}});
  const due=domains.filter(domain=>{const row=existing.find(r=>r.key===`domain:${domain}`);return !row||(!row.manual&&row.nextAttemptAt<=new Date());}).slice(0,4);
  await Promise.all(due.map(async domain=>{
   const key=`domain:${domain}`;try{
    const logo=await discoverCompanyLogo([`https://${domain}/`,`https://www.${domain}/`],true);
    const data={data:new Uint8Array(logo.bytes),sourceUrl:logo.sourceUrl,imageUrl:logo.imageUrl,checkedAt:new Date(),nextAttemptAt:new Date(Date.now()+30*86400000),lastError:null};
    await prisma.companyLogo.upsert({where:{key},create:{key,...data},update:data});
   }catch{await prisma.companyLogo.upsert({where:{key},create:{key,lastError:'No usable company logo found on its official website.',nextAttemptAt:new Date(Date.now()+7*86400000)},update:{checkedAt:new Date(),lastError:'No usable company logo found on its official website.',nextAttemptAt:new Date(Date.now()+7*86400000)}});}
  }));
 }catch{console.error('Company logo refresh paused; rewards remain available.');}finally{busy=false;}
}
export function startCompanyLogoRefresh(){void refreshCompanyLogos();return setInterval(()=>void refreshCompanyLogos(),30000).unref();}
