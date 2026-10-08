import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { prisma } from "./db.js";
import type { Role } from "./generated/prisma/client.js";

export type SessionUser = { id: number; email: string; name: string; phone: string | null; company: string | null; role: Role };
export type AppEnv = { Variables: { user?: SessionUser | null } };

const SESSION_COOKIE = "ccc_session";
const SESSION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// ---- Passwords: scrypt from Node's standard library, no native modules ----

const SCRYPT = { N: 2 ** 15, r: 8, p: 1, keylen: 64 };

function derive(password: string, salt: Buffer, N: number, r: number, p: number, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, keylen, { N, r, p, maxmem: 128 * N * r * 2 }, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const { N, r, p, keylen } = SCRYPT;
  const key = await derive(password, salt, N, r, p, keylen);
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, N, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await derive(password, Buffer.from(salt, "base64"), Number(N), Number(r), Number(p), expected.length);
  return timingSafeEqual(actual, expected);
}

// Used when no account matches, so a wrong email takes as long as a wrong password.
const dummyHash = hashPassword(randomBytes(16).toString("hex"));
export async function verifyAgainstDummy(password: string): Promise<void> {
  await verifyPassword(password, await dummyHash);
}

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 200;
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters for your password.`;
  if (password.length > PASSWORD_MAX) return "That password is too long.";
  return null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Tokens and sessions ----

export function newToken(): { token: string; id: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, id: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isHttps(c: Context): boolean {
  return c.req.header("x-forwarded-proto") === "https" || new URL(c.req.url).protocol === "https:";
}

export async function startSession(c: Context<AppEnv>, userId: number): Promise<void> {
  const { token, id } = newToken();
  await prisma.session.create({ data: { id, userId, expiresAt: new Date(Date.now() + SESSION_DAYS * DAY_MS) } });
  setCookie(c, SESSION_COOKIE, token, { httpOnly: true, secure: isHttps(c), sameSite: "Lax", path: "/", maxAge: SESSION_DAYS * 24 * 60 * 60 });
  c.set("user", undefined);
}

export async function endSession(c: Context<AppEnv>): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await prisma.session.deleteMany({ where: { id: hashToken(token) } });
  deleteCookie(c, SESSION_COOKIE, { path: "/", secure: isHttps(c) });
  c.set("user", null);
}

export async function endAllSessions(userId: number): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

// Looks up the signed-in user once per request. Sessions slide: any visit in
// the second half of a session's life extends it to a fresh 30 days.
export async function currentUser(c: Context<AppEnv>): Promise<SessionUser | null> {
  const cached = c.get("user");
  if (cached !== undefined) return cached;

  const token = getCookie(c, SESSION_COOKIE);
  let user: SessionUser | null = null;
  if (token) {
    const session = await prisma.session.findUnique({
      where: { id: hashToken(token) },
      include: { user: { select: { id: true, email: true, name: true, phone: true, company: true, role: true } } },
    });
    if (session && session.expiresAt.getTime() > Date.now()) {
      user = session.user;
      if (session.expiresAt.getTime() - Date.now() < (SESSION_DAYS / 2) * DAY_MS) {
        await prisma.session.update({ where: { id: session.id }, data: { expiresAt: new Date(Date.now() + SESSION_DAYS * DAY_MS) } });
      }
    } else if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
  }
  c.set("user", user);
  return user;
}

// Only allow redirects back into this site.
export function safeNext(next: unknown, fallback: string): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : fallback;
}

export const requireCustomer: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (!(await currentUser(c))) return c.redirect(`/account?next=${encodeURIComponent(c.req.path)}`);
  await next();
};

export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = await currentUser(c);
  if (!user) return c.redirect(`/admin/login?next=${encodeURIComponent(c.req.path)}`);
  if (user.role !== "ADMIN") return c.redirect("/admin/login?notice=not-admin");
  await next();
};

// Cross-site form posts are already stopped by SameSite=Lax cookies; this also
// rejects any state-changing request a browser marks as coming from another
// site. Sec-Fetch-Site covers browsers that send "Origin: null".
export const sameOriginWrites: MiddlewareHandler = async (c, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    const origin = c.req.header("origin");
    const host = c.req.header("x-forwarded-host") || c.req.header("host") || new URL(c.req.url).host;
    let blocked = c.req.header("sec-fetch-site") === "cross-site";
    if (!blocked && origin && origin !== "null") {
      try {
        blocked = new URL(origin).host !== host;
      } catch {
        blocked = true;
      }
    }
    if (blocked) {
      console.warn(`Blocked cross-site ${c.req.method} ${c.req.path}: origin ${origin}, host ${host}`);
      return c.text("Forbidden", 403);
    }
  }
  await next();
};

// Base URL for links in emails. PUBLIC_URL wins (set it once a custom domain is
// live); otherwise Railway's generated domain, then the request itself.
export function publicUrl(c: Context): string {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return new URL(c.req.url).origin;
}

// ---- Password reset links ----

export async function createResetLink(c: Context, userId: number, hours: number): Promise<string> {
  const { token, id } = newToken();
  await prisma.passwordReset.create({ data: { id, userId, expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000) } });
  return `${publicUrl(c)}/account/reset?token=${token}`;
}

export async function findValidReset(token: string) {
  const reset = await prisma.passwordReset.findUnique({ where: { id: hashToken(token) } });
  return reset && !reset.usedAt && reset.expiresAt.getTime() > Date.now() ? reset : null;
}
