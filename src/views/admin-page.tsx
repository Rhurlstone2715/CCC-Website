import type { Child, FC } from "hono/jsx";
import type { SessionUser } from "../auth.js";
import { prisma } from "../db.js";
import { Layout } from "./layout.js";

export type AdminSection = "bookings" | "calendar" | "customers" | "catalog";

export const pendingCount = () => prisma.booking.count({ where: { status: "PENDING" } });

export const AdminPage: FC<{ title: string; user: SessionUser; pending: number; active?: AdminSection; children: Child }> = ({ title, user, pending, active, children }) => (
  <Layout title={title} area="admin" user={user} pendingCount={pending} active={active}>
    {children}
  </Layout>
);

// Accepts "1250", "1,250.50" or "CI$1,250". Returns cents, or null if invalid.
export function parseAmount(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/ci\$|\$|,|\s/gi, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const cents = Math.round(Number(cleaned) * 100);
  return cents <= 100_000_000_00 ? cents : null;
}

export function centsToInput(cents: number | null | undefined): string {
  return cents ? (cents / 100).toFixed(cents % 100 ? 2 : 0) : "";
}
