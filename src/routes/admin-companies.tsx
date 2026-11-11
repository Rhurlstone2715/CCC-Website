import { Hono } from "hono";
import { type AppEnv, currentUser, requireAdmin } from "../auth.js";
import { companyEmailDomain, companyNameKey } from "../companies.js";
import { prisma } from "../db.js";
import { AdminPage, pendingCount } from "../views/admin-page.js";
import { Field } from "../views/layout.js";
export const adminCompanies = new Hono<AppEnv>();
adminCompanies.use("*", requireAdmin);
adminCompanies.get("/", async c => {
  const companies = await prisma.company.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { users: true } } } });
  return c.html(<AdminPage title="Company loyalty accounts" user={(await currentUser(c))!} pending={await pendingCount()} active="customers">
    <div class="page-head"><h1>Company loyalty accounts</h1><p class="lede">Staff keep their own logins and share their verified company’s points and tier.</p></div>
    {c.req.query("saved") ? <p role="status">Company registered successfully. It is listed below and will be recommended to staff signing up with its work-email domain.</p> : null}
    {c.req.query("error") ? <p role="alert">{c.req.query("error") === "duplicate" ? "This company name or domain is already registered. Check the registered companies below." : "Enter a company name and valid work-email domain, such as @paragon.ky. Public email providers cannot be company domains."}</p> : null}
    <section class="card"><h2>Register a company domain</h2><p>Use this when a company’s trading name differs from its email domain. Check the business and domain before registering it.</p>
      <form method="post" action="/admin/companies" class="form"><Field name="name" label="Company name" required maxlength={120} /><Field name="domain" label="Work-email domain" required maxlength={253} hint="For example: @paragon.ky or paragon.ky. You can also paste a work email such as staff@paragon.ky." /><button class="button primary" type="submit">Register company</button></form>
    </section>
    <section class="card"><h2>Registered companies</h2>{companies.length ? <ul>{companies.map(co=><li><b>{co.name}</b> — @{co.domain} · {co._count.users} staff account(s)</li>)}</ul> : <p>No verified companies yet. Matching work-email signups are saved after email confirmation.</p>}</section>
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
