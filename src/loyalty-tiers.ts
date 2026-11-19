// One source of truth for the website and welcome email.
export const TIERS = [
  { name: "Member", minCents: 0, discountPercent: 0 },
  { name: "Silver", minCents: 5_000_00, discountPercent: 5 },
  { name: "Gold", minCents: 15_000_00, discountPercent: 10 },
  { name: "Platinum", minCents: 25_000_00, discountPercent: 15 },
] as const;

// Round the combined discount once to the nearest KYD $5 (500 cents).
export function loyaltyDiscountCents(eligibleCents:number,percent:number):number {
  return Math.round(eligibleCents*percent/50_000)*500;
}
