import { companyAllowsEmail, companyNameKey, subCompanyIssue } from "./companies.js";
import { prisma } from "./db.js";

// Matches the tiers advertised in the rewards section of public/rentals.html.
// One point per admin-confirmed KYD $1. Pending estimates never unlock tiers.
import { TIERS } from "./loyalty-tiers.js";
export { TIERS } from "./loyalty-tiers.js";

export type Rewards = {
  tier: string;
  discountPercent: number;
  nextTier: string | null;
  amountToNextCents: number;
  points: number;
  spendCents: number;
  // Progress from the current tier's threshold to the next, 0 to 100.
  progressPercent: number;
};

export function rewardsForSpend(spendCents: number): Rewards {
  const spend = Math.max(0, spendCents);
  const index = TIERS.findLastIndex(t => spend >= t.minCents);
  const tier = TIERS[index];
  const next = TIERS[index + 1];
  const progressPercent = next ? Math.floor(((spend - tier.minCents) / (next.minCents - tier.minCents)) * 100) : 100;
  return {
    tier: tier.name,
    discountPercent: tier.discountPercent,
    nextTier: next?.name ?? null,
    amountToNextCents: next ? next.minCents - spend : 0,
    points: Math.floor(spend / 100),
    spendCents: spend,
    progressPercent,
  };
}

// Spend counts paid bookings plus any credit an admin has added.
export async function spendForUser(userId: number): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { companyAccount: { include: { subCompanies: true,emailDomains:true } }, subCompany: true } });
  if (!user) return 0;
  const companyId = user.emailVerifiedAt && user.companyAccount && companyAllowsEmail(user.companyAccount, user.email) && !subCompanyIssue(user.companyAccount, user.email, user.subCompanyId) && companyNameKey(user.company || "") === user.companyAccount.nameKey ? user.companyAccount.id : null;
  const separate = companyId && user.companyAccount?.poolSubcompanyRewards === false && user.subCompanyId;
  const paid = await prisma.booking.aggregate({ where: { ...(companyId ? { companyAccountId: companyId, ...(separate ? { subCompanyId: user.subCompanyId } : {}) } : { userId, companyAccountId: null }), status: "PAID" }, _sum: { amountPaidCents: true } });
  return (paid._sum.amountPaidCents ?? 0) + (companyId ? (separate ? user.subCompany?.rewardCreditCents ?? 0 : user.companyAccount?.rewardCreditCents ?? 0) : user.rewardCreditCents);
}

export async function rewardsForUser(userId: number): Promise<Rewards> {
  return rewardsForSpend(await spendForUser(userId));
}

// Display-only estimate: never included in spendForUser or discount eligibility.
export function pendingBookingPoints(booking: {status: string; estimate?: {totalCents: number | null} | null}): number | null {
  if (!['PENDING', 'APPROVED'].includes(booking.status)) return 0;
  return booking.estimate?.totalCents == null ? null : Math.floor(Math.max(0, booking.estimate.totalCents) / 100);
}

export async function pendingRewardsForUser(userId: number) {
  const user = await prisma.user.findUnique({ where: {id: userId}, include: {companyAccount: {include: {subCompanies: true,emailDomains:true}}} });
  if (!user) return {points: 0, unpricedCount: 0};
  const companyId = user.emailVerifiedAt && user.companyAccount && companyAllowsEmail(user.companyAccount, user.email) && !subCompanyIssue(user.companyAccount, user.email, user.subCompanyId) && companyNameKey(user.company || '') === user.companyAccount.nameKey ? user.companyAccount.id : null;
  const separate = companyId && user.companyAccount?.poolSubcompanyRewards === false && user.subCompanyId;
  const bookings = await prisma.booking.findMany({where: {...(companyId ? {companyAccountId: companyId, ...(separate ? {subCompanyId: user.subCompanyId} : {})} : {userId, companyAccountId: null}), status: {in: ['PENDING', 'APPROVED']}}, select: {status: true, estimate: {select: {totalCents: true}}}});
  return bookings.reduce((sum,b) => { const points=pendingBookingPoints(b); return {points: sum.points + (points ?? 0), unpricedCount: sum.unpricedCount + (points === null ? 1 : 0)}; }, {points: 0, unpricedCount: 0});
}
