import freeEmailDomains from "free-email-domains";
import { getDomain } from "tldts";
import { domainToASCII } from "node:url";
import { prisma } from "./db.js";

// Consumer/shared mailbox providers cannot establish ownership of a company.
const PERSONAL = new Set<string>([...freeEmailDomains, ...('gmail.com googlemail.com outlook.com hotmail.com live.com msn.com yahoo.com yahoo.co.uk yahoo.ca yahoo.fr yahoo.co.in ymail.com rocketmail.com aol.com icloud.com me.com mac.com proton.me protonmail.com pm.me fastmail.com hey.com gmx.com gmx.de mail.com email.com zoho.com zohomail.com yandex.com yandex.ru tutanota.com tuta.com tutamail.com hushmail.com mailinator.com guerrillamail.com temp-mail.org 10minutemail.com qq.com 163.com 126.com comcast.net verizon.net att.net sbcglobal.net bellsouth.net btinternet.com orange.fr free.fr icloud.com candw.ky candw.com flow.com'.split(' '))]);
export function companyEmailDomain(email: string): string | null {
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2 || !parts[0]) return null;
  const hostname = domainToASCII(parts[1]);
  const domain = getDomain(hostname, { allowPrivateDomains: true });
  if (!domain || domain.length > 253 || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) return null;
  if (PERSONAL.has(domain)) return null;
  return domain;
}
export function companyNameKey(name: string): string {
  return name.toLowerCase().replace(/\b(company|co|limited|ltd|incorporated|inc|llc|corp|corporation)\b/g, '').replace(/[^a-z0-9]/g, '');
}
export function companyAllowsEmail(company: { domain: string | null; ownerEmail: string | null }, email: string): boolean {
  return company.ownerEmail ? company.ownerEmail === email.trim().toLowerCase() : Boolean(company.domain && companyEmailDomain(email) === company.domain);
}
export async function validateCompany(email: string, name: string | null): Promise<string | null> {
  if (!name) return null;
  const key = companyNameKey(name);
  if (!key) return "Enter a valid company name.";
  const named = await prisma.company.findUnique({ where: { nameKey: key } });
  if (named) return companyAllowsEmail(named, email) ? null : named.ownerEmail
    ? "That company is limited to its registered email login. Use that email address or choose a different company."
    : "That company requires its matching work-email domain. Use a company work email.";
  const owned = await prisma.company.findUnique({ where: { ownerEmail: email.toLowerCase() } });
  if (owned) return `This email is already registered to ${owned.name}. Use that company name.`;
  return null;
}
// A domain company can have multiple verified staff. An email-only company has one allowed login email.
export async function syncCompanyMembership(userId: number): Promise<void> {
  await prisma.$transaction(async tx => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return;
    if (!user.emailVerifiedAt || !user.company) {
      if (user.companyAccountId) await tx.user.update({ where: { id: user.id }, data: { companyAccountId: null } });
      return;
    }
    const key = companyNameKey(user.company);
    if (!key) return;
    let company = await tx.company.findUnique({ where: { nameKey: key } });
    if (!company) {
      const domain = companyEmailDomain(user.email);
      const domainCompany = domain ? await tx.company.findUnique({ where: { domain } }) : null;
      const owned = await tx.company.findUnique({ where: { ownerEmail: user.email } });
      if (owned) return;
      // Only self-register a shared domain when its name matches. Otherwise register this email alone.
      const shared = domain && !domainCompany && key === domain.split('.')[0].replace(/[^a-z0-9]/g, '');
      company = await tx.company.upsert({ where: { nameKey: key }, create: { name: user.company, nameKey: key, domain: shared ? domain : null, ownerEmail: shared ? null : user.email }, update: {} });
    }
    if (!companyAllowsEmail(company, user.email)) {
      if (user.companyAccountId) await tx.user.update({ where: { id: user.id }, data: { companyAccountId: null } });
      return;
    }
    await tx.user.update({ where: { id: user.id }, data: { companyAccountId: company.id, company: company.name } });
  });
}
export async function verifiedCompanyId(userId: number): Promise<number | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { companyAccount: true } });
  return user?.emailVerifiedAt && user.companyAccount && companyAllowsEmail(user.companyAccount, user.email) && companyNameKey(user.company || "") === user.companyAccount.nameKey ? user.companyAccount.id : null;
}
