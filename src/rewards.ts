import { companyAllowsEmail, companyNameKey, subCompanyIssue } from "./companies.js";
import { prisma } from "./db.js";

// Matches the tiers advertised in the rewards section of public/rentals.html.
// One point per approved CI$1, so points are simply whole dollars spent.
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
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { companyAccount: { include: { subCompanies: true } }, subCompany: true } });
  if (!user) return 0;
  const companyId = user.emailVerifiedAt && user.companyAccount && companyAllowsEmail(user.companyAccount, user.email) && !subCompanyIssue(user.companyAccount, user.email, user.subCompanyId) && companyNameKey(user.company || "") === user.companyAccount.nameKey ? user.companyAccount.id : null;
  const separate = companyId && user.companyAccount?.poolSubcompanyRewards === false && user.subCompanyId;
  const paid = await prisma.booking.aggregate({ where: { ...(companyId ? { companyAccountId: companyId, ...(separate ? { subCompanyId: user.subCompanyId } : {}) } : { userId, companyAccountId: null }), status: "PAID" }, _sum: { amountPaidCents: true } });
  return (paid._sum.amountPaidCents ?? 0) + (companyId ? (separate ? user.subCompany?.rewardCreditCents ?? 0 : user.companyAccount?.rewardCreditCents ?? 0) : user.rewardCreditCents);
}

export async function rewardsForUser(userId: number): Promise<Rewards> {
  return rewardsForSpend(await spendForUser(userId));
}
