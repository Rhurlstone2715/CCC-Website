import { prisma } from "./db.js";

// Matches the tiers advertised in the rewards section of public/rentals.html.
// One point per approved CI$1, so points are simply whole dollars spent.
export const TIERS = [
  { name: "Member", minCents: 0, discountPercent: 0 },
  { name: "Silver", minCents: 5_000_00, discountPercent: 5 },
  { name: "Gold", minCents: 15_000_00, discountPercent: 10 },
  { name: "Platinum", minCents: 25_000_00, discountPercent: 15 },
] as const;

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
  const [paid, user] = await Promise.all([
    prisma.booking.aggregate({ where: { userId, status: "PAID" }, _sum: { amountPaidCents: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { rewardCreditCents: true } }),
  ]);
  return (paid._sum.amountPaidCents ?? 0) + (user?.rewardCreditCents ?? 0);
}

export async function rewardsForUser(userId: number): Promise<Rewards> {
  return rewardsForSpend(await spendForUser(userId));
}
