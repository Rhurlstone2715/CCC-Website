import {readFileSync} from 'node:fs';
import {companyNameKey} from './companies.js';
import {prisma} from './db.js';

// Read-back audit: never creates users, changes ownership, or sends messages.
export async function auditCompanyDirectory(){
 const directory=JSON.parse(readFileSync(new URL('../data/cayman-business-directory-2026.json',import.meta.url),'utf8')) as {companies:{name:string;domain:string|null;aliasNames:string[];verifiedDomains?:string[]}[]};
 const companies=await prisma.company.findMany({select:{id:true,nameKey:true,domain:true,emailDomains:{select:{domain:true}}}});
 const subCompanies=await prisma.subCompany.findMany({select:{companyId:true,domain:true}});
 let mapped=0;const missing:string[]=[],duplicateMatches:string[]=[],missingDomains:string[]=[];
 for(const row of directory.companies){const keys=new Set([row.name,...row.aliasNames].flatMap(n=>[companyNameKey(n),companyNameKey(n.replace(/^the\s+/i,''))]));
  const matches=new Set(companies.filter(c=>keys.has(c.nameKey)||Boolean(row.domain&&(c.domain===row.domain||c.emailDomains.some(d=>d.domain===row.domain)))).map(c=>c.id));
  if(row.domain)for(const sub of subCompanies)if(sub.domain===row.domain)matches.add(sub.companyId);
  if(!matches.size)missing.push(row.name);else mapped++;
  if(matches.size>1)duplicateMatches.push(row.name);
  for(const domain of row.verifiedDomains||[])if(!companies.some(c=>matches.has(c.id)&&(c.domain===domain||c.emailDomains.some(d=>d.domain===domain)))&&!subCompanies.some(s=>matches.has(s.companyId)&&s.domain===domain))missingDomains.push(domain);
 }
 return {researched:directory.companies.length,mapped,missing,duplicateMatches,verifiedDomainCount:directory.companies.reduce((n,c)=>n+(c.verifiedDomains?.length||0),0),missingDomains};
}
