import { prisma } from "./db.js";
import { COMPANY_EMAIL, customerEmailsEnabled, sendEmail } from "./email.js";
import { welcomeEmail } from "./welcome-email.js";
import type { User } from "./generated/prisma/client.js";

type Details = { name: string; email: string; phone?: string | null; company?: string | null; companyMode?: string | null; marketing?: boolean; createdAt?: string; baseUrl: string };
export async function queueSignupAlert(user: User, baseUrl: string, client: Pick<typeof prisma, "accountEmail" | "subCompany"> = prisma) {
  const subCompany = user.subCompanyId ? await client.subCompany.findUnique({ where: { id: user.subCompanyId }, select: { name: true } }) : null;
  await client.accountEmail.upsert({ where: { key: `signup-${user.id}` }, update: {}, create: {
    key: `signup-${user.id}`, kind: "SIGNUP", userId: user.id, recipient: COMPANY_EMAIL,
    payload: { name: user.name, email: user.email, phone: user.phone, company: user.company ? `${user.company}${subCompany ? ` / ${subCompany.name}` : ""}` : null, marketing: user.marketingOptIn, createdAt: user.createdAt.toISOString(), baseUrl },
  } });
}
export async function queueWelcomeEmail(userId: number, baseUrl: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { companyAccount: true, subCompany: true } });
  if (!user?.emailVerifiedAt) return;
  await prisma.accountEmail.upsert({ where: { key: `welcome-${user.id}` }, update: {}, create: {
    key: `welcome-${user.id}`, kind: "WELCOME", userId, recipient: user.email,
    payload: { name: user.name, email: user.email, company: user.companyAccount ? `${user.companyAccount.name}${user.subCompany ? ` / ${user.subCompany.name}` : ""}` : null, companyMode: user.companyAccount ? (!user.companyAccount.poolSubcompanyRewards && user.subCompany ? "sub-company" : user.companyAccount.domain ? "domain" : "single-email") : null, baseUrl },
  } });
}
let running = false;
export async function deliverAccountEmails() {
  if (running || !process.env.RESEND_API_KEY) return;
  running = true;
  try {
    const jobs = await prisma.accountEmail.findMany({ where: { sentAt: null, nextAttemptAt: { lte: new Date() } }, orderBy: { id: "asc" }, take: 20 });
    for (const job of jobs) {
      if (job.kind === "WELCOME" && !customerEmailsEnabled()) continue;
      const d = job.payload as unknown as Details;
      const email = job.kind === "WELCOME" ? welcomeEmail(d, d.baseUrl) : {
        subject: `New customer signup — ${d.name}`,
        text: [
          "NEW CUSTOMER SIGNUP", "", `Customer ID: ${job.userId}`, `Name: ${d.name}`, `Email: ${d.email}`,
          `Phone: ${d.phone || "Not provided"}`, `Company requested: ${d.company || "Individual account"}`,
          "Email verification: pending — the customer must confirm their own email.",
          `Marketing emails: ${d.marketing ? "Opted in" : "Not opted in"}`,
          `Registered: ${new Date(d.createdAt!).toLocaleString("en-US", { timeZone: "America/Cayman" })} (Cayman time)`,
          "", `Customer details: ${d.baseUrl}/admin/customers/${job.userId}`,
          "", "Passwords and verification links are private and are not included in this notification.",
        ].join("\n"),
      };
      const ok = await sendEmail({ to: job.recipient, ...email, ...(job.kind === "SIGNUP" ? { replyTo: d.email } : {}), idempotencyKey: `ccc-account-${job.key}` });
      await prisma.accountEmail.update({ where: { id: job.id }, data: { attempts: { increment: 1 }, ...(ok ? { sentAt: new Date() } : { nextAttemptAt: new Date(Date.now() + Math.min(3600000, 60000 * 2 ** Math.min(job.attempts, 6))) }) } });
    }
  } catch { console.error("Account email delivery paused; queued notifications will retry."); }
  finally { running = false; }
}
export function startAccountEmailDelivery() {
  void deliverAccountEmails();
  return setInterval(() => { void deliverAccountEmails(); }, 30000).unref();
}
