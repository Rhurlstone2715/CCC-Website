import { Hono } from "hono";
import { type AppEnv, currentUser, requireAdmin, EMAIL_PATTERN } from "../auth.js";
import { companyAllowsEmail, companyEmailDomain, companyNameKey } from "../companies.js";
import { prisma } from "../db.js";
import { AdminPage, pendingCount } from "../views/admin-page.js";
import { Field } from "../views/layout.js";
export const adminCompanies = new Hono<AppEnv>();
adminCompanies.use("*", requireAdmin);
adminCompanies.get("/", async c => {
  const companies = await prisma.company.findMany({ where: { archivedAt: null }, orderBy: { name: "asc" }, include: { _count: { select: { users: true } } } });
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
      const updated = await tx.company.update({ where: { id }, data: { name, nameKey: companyNameKey(name), domain, ownerEmail } });
      const staff = await tx.user.findMany({ where: { companyAccountId: id } });
      let removed = 0;
      for (const member of staff) {
        const matches = Boolean(member.emailVerifiedAt && companyAllowsEmail(updated, member.email));
        await tx.user.update({ where: { id: member.id }, data: matches ? { company: name } : { companyAccountId: null, company: null } });
        if (!matches) removed++;
      }
      return removed;
    });
    return c.redirect(`/admin/companies?updated=1&detached=${detached}`);
  } catch (error) { if ((error as { code?: string }).code === "P2002") return c.redirect("/admin/companies?error=duplicate"); throw error; }
});
