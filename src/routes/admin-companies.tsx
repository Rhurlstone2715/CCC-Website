import {registeredCompanyLogoUrls} from "../company-logos.js";
import { bodyLimit } from "hono/body-limit";
import { normalizeCompanyLogo } from "../logo-discovery.js";
import { Hono } from "hono";
import { type AppEnv, currentUser, requireAdmin, EMAIL_PATTERN } from "../auth.js";
import { companyAllowsEmail, companyEmailDomain, companyNameKey, companyNameKeys, subCompanyIssue } from "../companies.js";
import { prisma } from "../db.js";
import { AdminPage, pendingCount } from "../views/admin-page.js";
import { Field } from "../views/layout.js";
export const adminCompanies = new Hono<AppEnv>();
adminCompanies.use("*", requireAdmin);
adminCompanies.get("/", async c => {
  const query=(c.req.query("q")||"").trim().slice(0,120),page=Math.max(1,Math.min(10000,Math.trunc(Number(c.req.query("page")))||1)),size=50;
  const where={archivedAt:null,...(query?{OR:[{name:{contains:query,mode:"insensitive" as const}},{domain:{contains:query.replace(/^@/,""),mode:"insensitive" as const}},{emailDomains:{some:{domain:{contains:query.replace(/^@/,""),mode:"insensitive" as const}}}}]}:{})};
  const [companies,total] = await Promise.all([prisma.company.findMany({ where, orderBy: { name: "asc" }, skip:(page-1)*size,take:size,include: { emailDomains:true,subCompanies: { orderBy: [{ group: "asc" }, { name: "asc" }], include: { _count: { select: { users: true } } } }, _count: { select: { users: true } } } }),prisma.company.count({where})]);
  const logos=await registeredCompanyLogoUrls(companies);
  return c.html(<AdminPage title="Company loyalty accounts" user={(await currentUser(c))!} pending={await pendingCount()} active="customers">
    <div class="page-head"><h1>Company loyalty accounts</h1><p class="lede">Work-domain companies can share staff rewards. Companies without a work domain are restricted to one registered email login.</p></div>
    {c.req.query("logo") ? <p role="status">{c.req.query("logo")==="saved"?"Company logo saved. Verified staff will see it on their rewards badge.":"Choose a valid image no larger than 1 MB."}</p> : null}
    {c.req.query("updated") ? <p role="status">Company updated. Staff accounts were checked against its current email rule.{Number(c.req.query("detached")) > 0 ? ` ${Number(c.req.query("detached"))} account(s) no longer match and were unlinked. Customer logins and historical bookings are retained.` : ""}</p> : null}
    {c.req.query("saved") ? <p role="status">Company registered successfully. It is listed below and will be recommended to staff signing up with its work-email domain.</p> : null}
    {c.req.query("error") ? <p role="alert">{c.req.query("error") === "duplicate" ? "This company name or domain is already registered. Check the registered companies below." : "Enter a company name and valid work-email domain (for example @paragon.ky), or a valid registered login email for a single-email company."}</p> : null}
    <section class="card"><h2>Register a company domain</h2><p>Use this when a company’s trading name differs from its email domain. Check the business and domain before registering it.</p>
      <form method="post" action="/admin/companies" class="form"><Field name="name" label="Company name" required maxlength={120} /><Field name="domain" label="Work-email domain" required maxlength={253} hint="For example: @paragon.ky or paragon.ky. You can also paste a work email such as staff@paragon.ky." /><button class="button primary" type="submit">Register company</button></form>
    </section>
    <section class="card"><h2>Registered companies</h2><p>Edit the company name or its registered domain/email below. Work-domain accounts support matching staff; single-email accounts remain limited to one address.</p>
      <form method="get" action="/admin/companies" class="form"><Field name="q" label="Search company name or domain" value={query}/><button class="button secondary" type="submit">Search companies</button></form><p>{total} matching company listing(s) · Page {page} of {Math.max(1,Math.ceil(total/size))}</p>
      <div class="actions-row">{page>1?<a class="button secondary small" href={`/admin/companies?q=${encodeURIComponent(query)}&page=${page-1}`}>Previous</a>:null}{page*size<total?<a class="button secondary small" href={`/admin/companies?q=${encodeURIComponent(query)}&page=${page+1}`}>Next</a>:null}<a class="text-link" href="/cayman-business-directory-2026.csv" download>Download researched company list</a></div>
      {companies.length ? companies.map(co=><article class="card" style="margin:16px 0">
      {logos.get(`company:${co.id}`)?<img class="registered-company-logo" src={logos.get(`company:${co.id}`)} alt={`${co.name} logo`} width="180" height="96" loading="lazy"/>:null}
      <h3>{co.name}</h3><p>{co.domain || co.emailDomains.length ? `${[co.domain,...co.emailDomains.map(d=>d.domain)].filter(Boolean).map(d=>`@${d}`).join(", ")} · shared staff accounts` : `${co.ownerEmail || "Awaiting first verified email"} · one email login only`} · {co._count.users} account(s)</p>{co.emailDomains.length?<p>Additional verified staff domains: {co.emailDomains.map(d=>`@${d.domain}`).join(", ")}. Any existing single-email owner login is retained.</p>:null}
      <details><summary>Verified staff email domains</summary><p>Only add a domain confirmed as belonging to this company. Matching staff can share rewards; any existing owner email remains permitted.</p>{co.emailDomains.map(d=><form class="inline-form" method="post" action={`/admin/companies/${co.id}/email-domains/remove`}><input type="hidden" name="domain" value={d.domain}/><span>@{d.domain} </span><button class="button secondary small" type="submit">Remove staff domain</button></form>)}<form method="post" action={`/admin/companies/${co.id}/email-domains`} class="form"><div class="field"><label for={`additional-domain-${co.id}`}>Additional verified work-email domain</label><input id={`additional-domain-${co.id}`} name="domain" required placeholder="@company.ky" maxlength={253}/></div><button class="button secondary small" type="submit">Add verified domain</button></form></details>
      <form method="post" action={`/admin/companies/${co.id}/update`} class="form">
        <div class="field"><label for={`company-name-${co.id}`}>Company name</label><input id={`company-name-${co.id}`} name="name" value={co.name} required maxlength={120} /></div>
        <div class="field"><label for={`company-address-${co.id}`}>Company domain or single login email</label><input id={`company-address-${co.id}`} name="address" type="text" value={co.domain ? `@${co.domain}` : co.ownerEmail || ""} required={Boolean(co.domain || co.ownerEmail)} maxlength={254} /><small class="hint">Use @company.ky for verified shared staff access, or a full email for one login. Leave an unclaimed listing blank until its first email verification.</small></div>
        <p class="hint">Changing the domain or email unlinks staff who no longer match. Their logins and historical bookings are retained.</p>
        <button class="button secondary" type="submit">Save company changes</button>
      </form>
      <form method="post" action={`/admin/companies/${co.id}/logo`} enctype="multipart/form-data" class="form"><label for={`company-logo-${co.id}`}>Rewards badge logo</label><input id={`company-logo-${co.id}`} name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required /><small class="hint">Official company logo, up to 1 MB. Overrides automatic website matching.</small><button class="button secondary" type="submit">Save company logo</button></form>
      {co.subCompanies.length ? <details class="company-sublist"><summary>{co.subCompanies.length} sub-companies · {co.poolSubcompanyRewards ? "Shared parent rewards" : "Separate loyalty points for each sub-company"}</summary>{co.subCompanies.map(sub => <section class="card" style="margin:12px 0 12px 16px"><p class="eyebrow">{sub.group}</p>{logos.get(`subcompany:${sub.id}`)?<img class="registered-company-logo" src={logos.get(`subcompany:${sub.id}`)} alt={`${sub.name} logo`} width="180" height="96" loading="lazy"/>:null}<h4>{sub.name}</h4><p>{sub.domain ? `@${co.domain} or @${sub.domain}` : `@${co.domain} (parent company domain)`} · {sub._count.users} staff account(s)</p><form class="form" method="post" action={`/admin/companies/${co.id}/sub-companies/${sub.id}/update`}><label for={`sub-name-${sub.id}`}>Sub-company name</label><input id={`sub-name-${sub.id}`} name="name" value={sub.name} required maxlength={120} /><label for={`sub-domain-${sub.id}`}>Additional work-email domain (optional)</label><input id={`sub-domain-${sub.id}`} name="domain" value={sub.domain ? `@${sub.domain}` : ""} maxlength={253} /><p class="hint">Leave blank to use the parent company’s work-email domain. Historical bookings and rewards stay with this sub-company.</p><button type="submit" class="button secondary">Save sub-company</button></form><form method="post" action={`/admin/companies/${co.id}/sub-companies/${sub.id}/logo`} enctype="multipart/form-data" class="form"><label for={`sub-logo-${sub.id}`}>Department rewards badge logo</label><input id={`sub-logo-${sub.id}`} name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required /><button class="button secondary" type="submit">Save department logo</button></form></section>)}</details> : null}
    </article>) : <p>No active companies yet. A company is saved after its customer verifies their email.</p>}</section>
    <a href="/admin/customers">Back to customers</a>
  </AdminPage>);
});
adminCompanies.post("/", async c => {
  const body = await c.req.parseBody();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const raw = typeof body.domain === "string" ? body.domain.trim().toLowerCase() : "";
  const normalized = raw.startsWith("@") ? raw.slice(1) : raw;
  const domain = companyEmailDomain(normalized.includes("@") ? normalized : `staff@${normalized}`);
  const nameKey = companyNameKey(name);
  if (!name || name.length > 120 || !nameKey || !domain) return c.redirect("/admin/companies?error=invalid");
  if(await prisma.company.findFirst({where:{OR:[{nameKey:{in:companyNameKeys(name)}},{emailDomains:{some:{domain}}}]}}))return c.redirect("/admin/companies?error=duplicate");
  try { await prisma.company.create({ data: { name, nameKey, domain } }); }
  catch (error) { if ((error as { code?: string }).code === "P2002") return c.redirect("/admin/companies?error=duplicate"); throw error; }
  return c.redirect("/admin/companies?saved=1");
});

adminCompanies.post("/:id{[0-9]+}/update", async c => {
  const id = Number(c.req.param("id"));
  const current = await prisma.company.findUnique({ where: { id } });
  if (!current || current.archivedAt) return c.notFound();
  const body = await c.req.parseBody();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim().toLowerCase() : "";
  const normalized = address.startsWith("@") ? address.slice(1) : address;
  const isDomain=Boolean(current.domain) || address.startsWith("@") || Boolean(address && !address.includes("@"));
  const domain = isDomain ? companyEmailDomain(normalized.includes("@") ? normalized : `staff@${normalized}`) : null;
  const ownerEmail = isDomain ? null : address || null;
  if (!name || name.length > 120 || !companyNameKey(name) || (isDomain ? !domain : ownerEmail ? ownerEmail.length > 254 || !EMAIL_PATTERN.test(ownerEmail) : Boolean(current.domain || current.ownerEmail))) return c.redirect("/admin/companies?error=invalid");
  if(await prisma.company.findFirst({where:{id:{not:id},OR:[{nameKey:{in:companyNameKeys(name)}},...(domain?[{emailDomains:{some:{domain}}}]:[])]}}))return c.redirect("/admin/companies?error=duplicate");
  try {
    const detached = await prisma.$transaction(async tx => {
      const updated = await tx.company.update({ where: { id }, data: { name, nameKey: companyNameKey(name), domain, ownerEmail }, include: { emailDomains:true,subCompanies: true } });
      const staff = await tx.user.findMany({ where: { companyAccountId: id } });
      let removed = 0;
      for (const member of staff) {
        const matches = Boolean(member.emailVerifiedAt && companyAllowsEmail(updated, member.email) && !subCompanyIssue(updated, member.email, member.subCompanyId));
        await tx.user.update({ where: { id: member.id }, data: matches ? { company: name } : { companyAccountId: null, company: null } });
        if (!matches) removed++;
      }
      return removed;
    });
    return c.redirect(`/admin/companies?updated=1&detached=${detached}`);
  } catch (error) { if ((error as { code?: string }).code === "P2002") return c.redirect("/admin/companies?error=duplicate"); throw error; }
});

adminCompanies.post("/:companyId{[0-9]+}/sub-companies/:id{[0-9]+}/update", async c => {
 const companyId=Number(c.req.param("companyId")),id=Number(c.req.param("id"));
 const company=await prisma.company.findUnique({where:{id:companyId},include:{subCompanies:true}});
 if(!company||company.archivedAt||!company.subCompanies.some(sub=>sub.id===id))return c.notFound();
 const body=await c.req.parseBody();const name=typeof body.name==="string"?body.name.trim():"";const raw=typeof body.domain==="string"?body.domain.trim().toLowerCase():"";const normalized=raw.replace(/^@/,"");const domain=raw?companyEmailDomain(normalized.includes("@")?normalized:`staff@${normalized}`):null;
 if(!name||name.length>120||!companyNameKey(name)||(raw&&!domain))return c.redirect("/admin/companies?error=invalid");
 try{
  const detached=await prisma.$transaction(async tx=>{
   const updated=await tx.subCompany.update({where:{id},data:{name,nameKey:companyNameKey(name),domain}});const parent={...company,subCompanies:company.subCompanies.map(sub=>sub.id===id?updated:sub)};
   const staff=await tx.user.findMany({where:{subCompanyId:id}});let detached=0;
   for(const member of staff)if(member.companyAccountId===companyId&&(!member.emailVerifiedAt||!companyAllowsEmail(parent,member.email)||subCompanyIssue(parent,member.email,id))){await tx.user.update({where:{id:member.id},data:{companyAccountId:null}});detached++}
   return detached;
  });return c.redirect(`/admin/companies?updated=1&detached=${detached}`);
 }catch(error){if((error as{code?:string}).code==="P2002")return c.redirect("/admin/companies?error=duplicate");throw error}
});

const logoLimit=bodyLimit({maxSize:1100000,onError:c=>c.redirect('/admin/companies?logo=invalid')});
async function storeUploadedLogo(key:string,logo:unknown){
 if(!(logo instanceof File)||logo.size===0||logo.size>1000000)return false;
 try{const data=new Uint8Array(await normalizeCompanyLogo(Buffer.from(await logo.arrayBuffer())));const values={data,manual:true,sourceUrl:null,imageUrl:null,checkedAt:new Date(),nextAttemptAt:new Date('2099-01-01')};await prisma.companyLogo.upsert({where:{key},create:{key,...values},update:values});return true;}catch{return false;}
}
adminCompanies.post('/:id{[0-9]+}/logo',logoLimit,async c=>{
 const id=Number(c.req.param('id'));if(!await prisma.company.findFirst({where:{id,archivedAt:null}}))return c.notFound();
 const body=await c.req.parseBody();return c.redirect(`/admin/companies?logo=${await storeUploadedLogo(`company:${id}`,body.logo)?'saved':'invalid'}`);
});
adminCompanies.post('/:id{[0-9]+}/sub-companies/:subId{[0-9]+}/logo',logoLimit,async c=>{
 const id=Number(c.req.param('id')),subId=Number(c.req.param('subId'));if(!await prisma.subCompany.findFirst({where:{id:subId,companyId:id,company:{archivedAt:null}}}))return c.notFound();
 const body=await c.req.parseBody();return c.redirect(`/admin/companies?logo=${await storeUploadedLogo(`subcompany:${subId}`,body.logo)?'saved':'invalid'}`);
});

adminCompanies.post('/:id{[0-9]+}/email-domains',async c=>{
 const id=Number(c.req.param('id'));if(!await prisma.company.findFirst({where:{id,archivedAt:null}}))return c.notFound();
 const body=await c.req.parseBody(),raw=typeof body.domain==='string'?body.domain.trim().replace(/^@/,''):'';
 const domain=companyEmailDomain(raw.includes('@')?raw:`staff@${raw}`);if(!domain)return c.redirect('/admin/companies?error=invalid');
 if(await prisma.company.findFirst({where:{OR:[{domain},{emailDomains:{some:{domain}}}]}})||await prisma.subCompany.findFirst({where:{domain}}))return c.redirect('/admin/companies?error=duplicate');
 try{await prisma.companyEmailDomain.create({data:{domain,companyId:id,sourceUrl:'Admin verified'}});}catch(e){if((e as{code?:string}).code==='P2002')return c.redirect('/admin/companies?error=duplicate');throw e;}
 return c.redirect('/admin/companies?updated=1');
});
adminCompanies.post('/:id{[0-9]+}/email-domains/remove',async c=>{
 const id=Number(c.req.param('id')),body=await c.req.parseBody(),domain=typeof body.domain==='string'?body.domain:'';
 const detached=await prisma.$transaction(async tx=>{
  const company=await tx.company.findFirst({where:{id,archivedAt:null},include:{emailDomains:true,subCompanies:true}});if(!company)return null;
  await tx.companyEmailDomain.deleteMany({where:{companyId:id,domain}});company.emailDomains=company.emailDomains.filter(d=>d.domain!==domain);let count=0;
  for(const user of await tx.user.findMany({where:{companyAccountId:id}}))if(!companyAllowsEmail(company,user.email)||subCompanyIssue(company,user.email,user.subCompanyId)){await tx.user.update({where:{id:user.id},data:{companyAccountId:null,company:null}});count++;}
  return count;
 });
 return detached===null?c.notFound():c.redirect(`/admin/companies?updated=1&detached=${detached}`);
});
