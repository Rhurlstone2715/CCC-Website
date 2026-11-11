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
    {c.req.query("error") ? <p role="alert">Enter a company name and its work-email domain. Each company and domain can only be registered once; public email providers cannot be company domains.</p> : null}
    <section class="card"><h2>Register a company domain</h2><p>Use this when a company’s trading name differs from its email domain. Check the business and domain before registering it.</p>
      <form method="post" action="/admin/companies" class="form"><Field name="name" label="Company name" required maxlength={120} /><Field name="domain" label="Work-email domain" required maxlength={253} hint="For example: acme.ky (without @)." /><button class="button primary" type="submit">Register company</button></form>
    </section>
    <section class="card"><h2>Registered companies</h2>{companies.length ? <ul>{companies.map(co=><li><b>{co.name}</b> — {co.domain} · {co._count.users} staff account(s)</li>)}</ul> : <p>No verified companies yet. Matching work-email signups are saved after email confirmation.</p>}</section>
    <a href="/admin/customers">Back to customers</a>
  </AdminPage>);
});
adminCompanies.post("/", async c => {
  const body = await c.req.parseBody();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const raw = typeof body.domain === "string" ? body.domain.trim().toLowerCase() : "";
  const domain = companyEmailDomain(`staff@${raw}`);
  const nameKey = companyNameKey(name);
  if (!name || name.length > 120 || !nameKey || !domain) return c.redirect("/admin/companies?error=invalid");
  try { await prisma.company.create({ data: { name, nameKey, domain } }); }
  catch (error) { if ((error as { code?: string }).code === "P2002") return c.redirect("/admin/companies?error=duplicate"); throw error; }
  return c.redirect("/admin/companies");
});
