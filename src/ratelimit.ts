import type { Context } from "hono";
import { getConnInfo } from "@hono/node-server/conninfo";

// In-memory sliding-window limiter. Fine for a single Railway instance; the
// counts reset on deploy, which is acceptable for abuse protection.
export function createLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, times] of hits) if (times.every(t => now - t >= windowMs)) hits.delete(key);
  }, windowMs).unref();

  // Returns true when the key is over its limit. Every call counts as an attempt.
  const attempt = (key: string): boolean => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    return recent.length > limit;
  };
  // Forgets a key's attempts, e.g. after a successful login.
  return Object.assign(attempt, { reset: (key: string) => void hits.delete(key) });
}

export function clientIp(c: Context): string {
  const forwarded = c.req.header("x-real-ip") || c.req.header("x-forwarded-for")?.split(",")[0].trim();
  if (forwarded) return forwarded;
  try {
    return getConnInfo(c).remote.address || "unknown";
  } catch {
    // No socket, e.g. requests made directly against the app in tests.
    return "unknown";
  }
}
