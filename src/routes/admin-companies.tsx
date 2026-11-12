import { Hono } from "hono";
import { type AppEnv, currentUser, requireAdmin, EMAIL_PATTERN } from "../auth.js";
import { companyAllowsEmail, companyEmailDomain, companyNameKey, subCompanyIssue } from "../companies.js";
import { prisma } from "../db.js";
import { AdminPage, pendingCount } from "../views/admin-page.js";
import { Field } from "../views/layout.js";
export const adminCompanies = new Hono<AppEnv>();
adminCompanies.use("*", requireAdmin);
adminCompanies.get("/", async c => {
  const companies = await prisma.company.findMany({ where: { archivedAt: null }, orderBy: { name: "asc" }, include: { subCompanies: { orderBy: [{ group: "asc" }, { name: "asc" }], include: { _count: { select: { users: true } } } }, _count: { select: { users: true } } } });
  return c.html(<AdminPage title="Company loyalty accounts" user={(await currentUser(c))!} pending={await pendingCount()} active="customers">
    <div class="page-head"><h1>Company loyalty accounts</h1><p class="lede">Work-domain companies can share staff rewards. Companies without a work domain are restricted to one registered email login.</p></div>
    {c.req.query("updated") ? <p role="status">Company updated. Staff accounts were checked against its current email rule.{Number(c.req.query("detached")) > 0 ? ` ${Number(c.req.query("detached"))} account(s) no longer match and were unlinked. Customer logins and historical bookings are retained.` : ""}</p> : null}
    {c.req.query("saved") ? <p role="status">Company registered successfully. It is listed below and will be recommended to staff signing up with its work-email domain.</p> : null}
    {c.req.query("error") ? <p role="alert">{c.req.query("error") === "duplicate" ? "This company name or domain is already registered. Check the registered companies below." : "Enter a company name and valid work-email domain (for example @paragon.ky), or a valid registered login email for a single-email company."}</p> : null}
    <section class="card"><h2>Register a company domain</h2><p>Use this when a company’s trading name differs from its email domain. Check the business and domain before registering it.</p>
      <form method="post" action="/admin/companies" class="form"><Field name="name" label="Company name" required maxlength={120} /><Field name="domain" label="Work-email domain" required maxlength={253} hint="For example: @paragon.ky or paragon.ky. You can also paste a work email such as staff@paragon.ky." /><button class="button primary" type="submit">Register company</button></form>
    </section>
    <section class="card"><h2>Registered companies</h2><p>Edit the company name or its registered domain/email below. Work-domain accounts support matching staff; single-email accounts remain limited to one address.</p>{companies.length ? companies.map(co=><article class="card" style="margin:16px 0">
      <h3>{co.name}</h3><p>{co.domain ? `@${co.domain} · shared staff accounts` : `${co.ownerEmail} · one email login only`} · {co._count.users} account(s)</p>
      <form method="post" action={`/admin/companies/${co.id}/update`} class="form">
        <div class="field"><label for={`company-name-${co.id}`}>Company name</label><input id={`company-name-${co.id}`} name="name" value={co.name} required maxlength={120} /></div>
        <div class="field"><label for={`company-address-${co.id}`}>{co.domain ? "Company email domain" : "Registered login email"}</label><input id={`company-address-${co.id}`} name="address" type={co.domain ? "text" : "email"} value={co.domain ? `@${co.domain}` : co.ownerEmail!} required maxlength={254} /></div>
        <p class="hint">Changing the domain or email unlinks staff who no longer match. Their logins and historical bookings are retained.</p>
        <button class="button secondary" type="submit">Save company changes</button>
      </form>
      {co.subCompanies.length ? <details class="company-sublist"><summary>{co.subCompanies.length} sub-companies · {co.poolSubcompanyRewards ? "Shared parent rewards" : "Separate loyalty points for each sub-company"}</summary>{co.subCompanies.map(sub => <section class="card" style="margin:12px 0 12px 16px"><p class="eyebrow">{sub.group}</p><h4>{sub.name}</h4><p>{sub.domain ? `@${co.domain} or @${sub.domain}` : `@${co.domain} (parent company domain)`} · {sub._count.users} staff account(s)</p><form class="form" method="post" action={`/admin/companies/${co.id}/sub-companies/${sub.id}/update`}><label for={`sub-name-${sub.id}`}>Sub-company name</label><input id={`sub-name-${sub.id}`} name="name" value={sub.name} required maxlength={120} /><label for={`sub-domain-${sub.id}`}>Additional work-email domain (optional)</label><input id={`sub-domain-${sub.id}`} name="domain" value={sub.domain ? `@${sub.domain}` : ""} maxlength={253} /><p class="hint">Leave blank to use the parent company’s work-email domain. Historical bookings and rewards stay with this sub-company.</p><button type="submit" class="button secondary">Save sub-company</button></form></section>)}</details> : null}
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
  const domain = current.domain ? companyEmailDomain(normalized.includes("@") ? normalized : `staff@${normalized}`) : null;
  const ownerEmail = current.domain ? null : address;
  if (!name || name.length > 120 || !companyNameKey(name) || (current.domain ? !domain : !ownerEmail || ownerEmail.length > 254 || !EMAIL_PATTERN.test(ownerEmail))) return c.redirect("/admin/companies?error=invalid");
  try {
    const detached = await prisma.$transaction(async tx => {
      const updated = await tx.company.update({ where: { id }, data: { name, nameKey: companyNameKey(name), domain, ownerEmail }, include: { subCompanies: true } });
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
