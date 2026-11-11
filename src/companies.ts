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
export async function validateCompany(email: string, name: string | null): Promise<string | null> {
  if (!name) return null;
  const domain = companyEmailDomain(email);
  if (!domain) return 'Use a company-domain email address to join company loyalty rewards, or leave Company blank for a personal account.';
  const existing = await prisma.company.findUnique({ where: { domain } });
  if (existing) return companyNameKey(existing.name) === companyNameKey(name) ? null : `Your email domain is linked to ${existing.name}. Select that company.`;
  const key = companyNameKey(name);
  if (!key || key !== domain.split('.')[0].replace(/[^a-z0-9]/g, '')) return 'The company name must match your work-email domain. Contact Cayman Crane if your company uses a different name or abbreviation.';
  const claimed = await prisma.company.findUnique({ where: { nameKey: key } });
  if (claimed && claimed.domain !== domain) return 'That company is registered under a different email domain. Use its work email or contact Cayman Crane.';
  return null;
}
// Create/join only after the mailbox is verified. Never infer membership from old company text.
export async function syncCompanyMembership(userId: number): Promise<void> {
  await prisma.$transaction(async tx => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return;
    const domain = companyEmailDomain(user.email);
    if (!user.emailVerifiedAt || !user.company || !domain) {
      if (user.companyAccountId) await tx.user.update({ where: { id: user.id }, data: { companyAccountId: null } });
      return;
    }
    let company = await tx.company.findUnique({ where: { domain } });
    if (!company) {
      const key = companyNameKey(user.company);
      if (!key || key !== domain.split('.')[0].replace(/[^a-z0-9]/g, '')) return;
      const named = await tx.company.findUnique({ where: { nameKey: key } });
      if (named && named.domain !== domain) return;
      company = await tx.company.upsert({ where: { domain }, create: { name: user.company, nameKey: key, domain }, update: {} });
    }
    if (companyNameKey(company.name) !== companyNameKey(user.company)) return;
    await tx.user.update({ where: { id: user.id }, data: { companyAccountId: company.id, company: company.name } });
  });
}
export async function verifiedCompanyId(userId: number): Promise<number | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { companyAccount: true } });
  return user?.emailVerifiedAt && user.companyAccount && companyEmailDomain(user.email) === user.companyAccount.domain && companyNameKey(user.company || "") === user.companyAccount.nameKey ? user.companyAccount.id : null;
}
