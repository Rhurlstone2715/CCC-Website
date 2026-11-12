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
type MembershipCompany = { id?: number; domain: string | null; ownerEmail: string | null; archivedAt?: Date | null; poolSubcompanyRewards?: boolean; subCompanies?: { id: number; companyId: number; domain: string | null }[] };
export function companyAllowsEmail(company: MembershipCompany, email: string): boolean {
  if (company.archivedAt) return false;
  if (company.ownerEmail) return company.ownerEmail === email.trim().toLowerCase();
  const domain = companyEmailDomain(email);
  return Boolean(domain && (company.domain === domain || company.subCompanies?.some(sub => sub.domain === domain)));
}
export function subCompanyIssue(company: MembershipCompany, email: string, id: number | null): string | null {
  if (!id) return company.poolSubcompanyRewards === false && company.subCompanies?.length ? "Select your office, department or sub-company." : null;
  const sub = company.subCompanies?.find(sub => sub.id === id && sub.companyId === company.id);
  if (!sub) return "Select a sub-company belonging to your selected company.";
  const domain = companyEmailDomain(email);
  return domain && (domain === company.domain || domain === sub.domain) ? null : "Use the work-email domain associated with this sub-company.";
}
export async function validateCompany(email: string, name: string | null, subCompanyId: number | null = null): Promise<string | null> {
  if (!name) return subCompanyId ? "Select the parent company for your sub-company." : null;
  const key = companyNameKey(name);
  if (!key) return "Enter a valid company name.";
  const named = await prisma.company.findUnique({ where: { nameKey: key }, include: { subCompanies: true } });
  if (named?.archivedAt) return "That company is no longer active. Contact Cayman Crane or use a different company.";
  if (named) return companyAllowsEmail(named, email) ? subCompanyIssue(named, email, subCompanyId) : named.ownerEmail
    ? "That company is limited to its registered email login. Use that email address or choose a different company."
    : "That company requires its matching work-email domain. Use a company work email.";
  if (subCompanyId) return "Select the registered parent company for this sub-company.";
  const domain = companyEmailDomain(email);
  const parent = domain ? await prisma.company.findFirst({ where: { archivedAt: null, subCompanies: { some: {} }, OR: [{ domain }, { subCompanies: { some: { domain } } }] }, select: { name: true } }) : null;
  if (parent) return `Your work email is registered under ${parent.name}. Select that company and your office or department.`;
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
    let company = await tx.company.findUnique({ where: { nameKey: key }, include: { subCompanies: true } });
    if (!company) {
      const domain = companyEmailDomain(user.email);
      const domainCompany = domain ? await tx.company.findUnique({ where: { domain } }) : null;
      const owned = await tx.company.findUnique({ where: { ownerEmail: user.email } });
      if (owned) return;
      // Only self-register a shared domain when its name matches. Otherwise register this email alone.
      const shared = domain && !domainCompany && key === domain.split('.')[0].replace(/[^a-z0-9]/g, '');
      company = await tx.company.upsert({ where: { nameKey: key }, create: { name: user.company, nameKey: key, domain: shared ? domain : null, ownerEmail: shared ? null : user.email }, update: {}, include: { subCompanies: true } });
    }
    if (!companyAllowsEmail(company, user.email) || subCompanyIssue(company, user.email, user.subCompanyId)) {
      if (user.companyAccountId) await tx.user.update({ where: { id: user.id }, data: { companyAccountId: null } });
      return;
    }
    await tx.user.update({ where: { id: user.id }, data: { companyAccountId: company.id, company: company.name } });
  });
}
export async function verifiedCompanyMembership(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { companyAccount: { include: { subCompanies: true } }, subCompany: { select: { name: true } } } });
  if (!user?.emailVerifiedAt || !user.companyAccount || !companyAllowsEmail(user.companyAccount, user.email) || subCompanyIssue(user.companyAccount, user.email, user.subCompanyId) || companyNameKey(user.company || "") !== user.companyAccount.nameKey) return null;
  return { companyAccountId: user.companyAccount.id, subCompanyId: user.subCompanyId, companyDisplayName: `${user.companyAccount.name}${user.subCompany ? ` / ${user.subCompany.name}` : ""}` };
}
export async function verifiedCompanyId(userId: number): Promise<number | null> {
  return (await verifiedCompanyMembership(userId))?.companyAccountId ?? null;
}
