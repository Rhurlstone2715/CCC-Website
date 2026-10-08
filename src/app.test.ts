// Integration tests against a real Postgres test database.
// Run with `npm test`; needs TEST_DATABASE_URL (see .env.example).
// test-env must stay the first import: it points Prisma at the test database.
import "./test-env.js";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { after, before, beforeEach, describe, test } from "node:test";
import { app } from "./app.js";
import { hashPassword, safeNext, verifyPassword } from "./auth.js";
import { prisma } from "./db.js";
import { rewardsForSpend } from "./rewards.js";
import { parseAmount } from "./routes/admin.js";

const TEST_DB = process.env.TEST_DATABASE_URL;

after(() => prisma.$disconnect());

describe("rewards tiers", () => {
  test("thresholds match the advertised tiers", () => {
    assert.deepEqual(
      [0, 4_999_99, 5_000_00, 14_999_99, 15_000_00, 25_000_00, 90_000_00].map(cents => {
        const r = rewardsForSpend(cents);
        return [r.tier, r.discountPercent];
      }),
      [
        ["Member", 0],
        ["Member", 0],
        ["Silver", 5],
        ["Silver", 5],
        ["Gold", 10],
        ["Platinum", 15],
        ["Platinum", 15],
      ],
    );
  });

  test("progress and points", () => {
    const r = rewardsForSpend(10_000_00);
    assert.equal(r.nextTier, "Gold");
    assert.equal(r.amountToNextCents, 5_000_00);
    assert.equal(r.progressPercent, 50);
    assert.equal(r.points, 10_000);
    const top = rewardsForSpend(30_000_00);
    assert.equal(top.nextTier, null);
    assert.equal(top.amountToNextCents, 0);
  });
});

describe("passwords and redirects", () => {
  test("hash round trip", async () => {
    const hash = await hashPassword("correct horse");
    assert.match(hash, /^scrypt\$/);
    assert.equal(await verifyPassword("correct horse", hash), true);
    assert.equal(await verifyPassword("wrong horse", hash), false);
  });

  test("safeNext only allows local paths", () => {
    assert.equal(safeNext("/rentals", "/x"), "/rentals");
    assert.equal(safeNext("//evil.example", "/x"), "/x");
    assert.equal(safeNext("https://evil.example", "/x"), "/x");
    assert.equal(safeNext("/\\evil.example", "/x"), "/x");
  });
});

describe("site", { skip: TEST_DB ? false : "TEST_DATABASE_URL not set" }, () => {
  const realFetch = globalThis.fetch;

  before(() => {
    execSync("npx prisma migrate deploy", { env: process.env, stdio: "pipe" });
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE "Booking", "Session", "PasswordReset", "User" RESTART IDENTITY CASCADE');
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
  });

  after(() => {
    globalThis.fetch = realFetch;
  });

  // Each call gets its own IP unless one is given, so rate limits don't leak between tests.
  async function req(path: string, opts: { method?: string; form?: Record<string, string>; json?: unknown; cookie?: string; ip?: string; origin?: string } = {}) {
    const headers: Record<string, string> = { "x-real-ip": opts.ip ?? randomUUID() };
    let body: string | undefined;
    if (opts.form) {
      headers["content-type"] = "application/x-www-form-urlencoded";
      body = new URLSearchParams(opts.form).toString();
    } else if (opts.json !== undefined) {
      headers["content-type"] = "application/json";
      body = JSON.stringify(opts.json);
    }
    if (opts.cookie) headers.cookie = opts.cookie;
    if (opts.origin) headers.origin = opts.origin;
    return app.request(path, { method: opts.method ?? (body !== undefined ? "POST" : "GET"), headers, body });
  }

  function sessionCookie(res: Response): string {
    const header = res.headers.get("set-cookie") ?? "";
    const match = header.match(/ccc_session=([^;]*)/);
    assert.ok(match && match[1], `expected a session cookie, got: ${header}`);
    return `ccc_session=${match[1]}`;
  }

  async function signup(email = "kim@example.com", password = "longenough1") {
    const res = await req("/account/signup", { form: { name: "Kim Ebanks", email, phone: "345 555 0100", company: "Ebanks Build", password } });
    assert.equal(res.status, 302);
    return sessionCookie(res);
  }

  async function makeAdmin() {
    const res = await req("/admin/setup", { form: { code: "test-setup-code", name: "Ric Admin", email: "admin@example.com", password: "adminpass123" } });
    assert.equal(res.status, 302);
    return sessionCookie(res);
  }

  const booking = {
    customerName: "Kim Ebanks",
    customerEmail: "kim@example.com",
    requestText: "BOOKING ITEMS:\n• Terex RT40 — Daily",
    termsText: "Rental terms",
    signature: "Kim Ebanks",
    initials: "KE",
    agreement: true,
    paymentAck: true,
  };

  test("signed-out visitors get a 401 from rewards", async () => {
    const res = await req("/api/rewards");
    assert.equal(res.status, 401);
  });

  test("sign up logs you in and returns rewards and profile", async () => {
    const cookie = await signup();
    const res = await req("/api/rewards", { cookie });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.rewards.tier, "Member");
    assert.equal(data.rewards.nextTier, "Silver");
    assert.equal(data.profile.email, "kim@example.com");
    assert.equal(data.profile.company, "Ebanks Build");
    assert.equal(res.headers.get("cache-control"), "private, no-store");
  });

  test("sign up rejects duplicates and short passwords", async () => {
    await signup("Kim@Example.com");
    const dup = await req("/account/signup", { form: { name: "Kim", email: "kim@example.com", password: "longenough1" } });
    assert.equal(dup.status, 409);
    const short = await req("/account/signup", { form: { name: "Lee", email: "lee@example.com", password: "short" } });
    assert.equal(short.status, 400);
  });

  test("log in, wrong password, log out", async () => {
    await signup();
    const wrong = await req("/account/login", { form: { email: "kim@example.com", password: "nope-nope" } });
    assert.equal(wrong.status, 401);
    const ok = await req("/account/login", { form: { email: "KIM@example.com ", password: "longenough1", next: "/rentals" } });
    assert.equal(ok.status, 302);
    assert.equal(ok.headers.get("location"), "/rentals");
    const cookie = sessionCookie(ok);
    assert.equal((await req("/api/rewards", { cookie })).status, 200);
    await req("/account/logout", { form: {}, cookie });
    assert.equal((await req("/api/rewards", { cookie })).status, 401);
  });

  test("login is rate limited per email", async () => {
    // Its own email: the limiter is per process, so this must not lock out other tests.
    await signup("limited@example.com");
    let last: Response | undefined;
    for (let i = 0; i < 11; i++) last = await req("/account/login", { form: { email: "limited@example.com", password: "wrong-guess" } });
    assert.match(await last!.text(), /Too many login attempts/);
  });

  test("open redirects are refused after login", async () => {
    await signup();
    const res = await req("/account/login", { form: { email: "kim@example.com", password: "longenough1", next: "//evil.example" } });
    assert.equal(res.headers.get("location"), "/account/profile");
  });

  test("cross-site form posts are rejected", async () => {
    const res = await req("/account/login", { form: { email: "a@b.co", password: "x" }, origin: "https://evil.example" });
    assert.equal(res.status, 403);
    const same = await req("/account/login", { form: { email: "a@b.co", password: "xxxxxxxx" }, origin: "http://localhost" });
    assert.notEqual(same.status, 403);
    const nullOrigin = await app.request("/account/login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", origin: "null", "sec-fetch-site": "same-origin", "x-real-ip": randomUUID() },
      body: "email=a%40b.co&password=xxxxxxxx",
    });
    assert.notEqual(nullOrigin.status, 403);
    const crossSite = await app.request("/account/login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", origin: "null", "sec-fetch-site": "cross-site" },
      body: "email=a%40b.co&password=xxxxxxxx",
    });
    assert.equal(crossSite.status, 403);
  });

  test("profile page needs a session", async () => {
    const res = await req("/account/profile");
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), "/account?next=%2Faccount%2Fprofile");
  });

  test("bookings made while logged in are linked to the account", async () => {
    const cookie = await signup();
    const res = await req("/api/bookings", { json: booking, cookie });
    // No Resend key in tests, so the alert can't send and the page falls back to email.
    assert.equal(res.status, 503);
    const saved = await prisma.booking.findFirstOrThrow();
    assert.ok(saved.userId);
    assert.equal(saved.rewardTier, "Member");
    const guest = await req("/api/bookings", { json: booking });
    assert.equal(guest.status, 503);
    assert.equal((await prisma.booking.findFirstOrThrow({ where: { id: 2 } })).userId, null);
  });

  test("customers can't reach admin pages", async () => {
    const cookie = await signup();
    const res = await req("/admin/bookings", { cookie });
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), "/admin/login?notice=not-admin");
    assert.equal((await req("/admin/bookings")).headers.get("location"), "/admin/login?next=%2Fadmin%2Fbookings");
  });

  test("admin setup needs the right code", async () => {
    const bad = await req("/admin/setup", { form: { code: "wrong", name: "X", email: "x@example.com", password: "adminpass123" } });
    assert.equal(bad.status, 403);
    const cookie = await makeAdmin();
    assert.equal((await req("/admin/bookings", { cookie })).status, 200);
  });

  test("approve, mark paid, and rewards follow", async () => {
    const customer = await signup();
    await req("/api/bookings", { json: booking, cookie: customer });
    const admin = await makeAdmin();

    const approve = await req("/admin/bookings/1/approve", { form: {}, cookie: admin });
    assert.equal(approve.headers.get("location"), "/admin/bookings/1?notice=approved-manual");
    const page = await (await req("/admin/bookings/1", { cookie: admin })).text();
    assert.match(page, /Email from your inbox/);

    assert.equal(parseAmount("CI$6,000"), 6_000_00);
    const paid = await req("/admin/bookings/1/paid", { form: { amount: "6,000" }, cookie: admin });
    assert.equal(paid.headers.get("location"), "/admin/bookings/1?notice=paid");
    let rewards = (await (await req("/api/rewards", { cookie: customer })).json()).rewards;
    assert.equal(rewards.tier, "Silver");
    assert.equal(rewards.discountPercent, 5);
    assert.equal(rewards.points, 6000);

    // Next booking records the Silver tier server-side.
    await req("/api/bookings", { json: booking, cookie: customer });
    assert.equal((await prisma.booking.findUniqueOrThrow({ where: { id: 2 } })).discountPercent, 5);

    // Undoing the payment takes the points back.
    await req("/admin/bookings/1/reopen", { form: {}, cookie: admin });
    rewards = (await (await req("/api/rewards", { cookie: customer })).json()).rewards;
    assert.equal(rewards.tier, "Member");

    // Admin credit counts toward the tier.
    await req("/admin/customers/1/credit", { form: { credit: "15000" }, cookie: admin });
    rewards = (await (await req("/api/rewards", { cookie: customer })).json()).rewards;
    assert.equal(rewards.tier, "Gold");
  });

  test("invalid status changes are refused", async () => {
    await req("/api/bookings", { json: booking });
    const admin = await makeAdmin();
    const res = await req("/admin/bookings/1/paid", { form: { amount: "100" }, cookie: admin });
    assert.equal(res.headers.get("location"), "/admin/bookings/1?notice=bad-transition");
    assert.equal((await prisma.booking.findUniqueOrThrow({ where: { id: 1 } })).status, "PENDING");
  });

  test("admin reset link works once and logs out other sessions", async () => {
    const oldCookie = await signup();
    const admin = await makeAdmin();
    const page = await (await req("/admin/customers/1/reset-link", { form: {}, cookie: admin })).text();
    const token = page.match(/\/account\/reset\?token=([\w-]+)/)?.[1];
    assert.ok(token);
    assert.equal((await req(`/account/reset?token=${token}`)).status, 200);
    const reset = await req("/account/reset", { form: { token: token!, password: "brand-new-pass" } });
    assert.equal(reset.status, 302);
    assert.equal((await req("/api/rewards", { cookie: oldCookie })).status, 401);
    assert.equal((await req("/api/rewards", { cookie: sessionCookie(reset) })).status, 200);
    assert.equal((await req("/account/reset", { form: { token: token!, password: "another-pass" } })).status, 400);
    const login = await req("/account/login", { form: { email: "kim@example.com", password: "brand-new-pass" } });
    assert.equal(login.status, 302);
  });

  test("with email set up, approval emails the contract and bookings alert the company", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Cayman Crane <bookings@example.com>";
    const sent: { to: string[]; subject: string; text: string }[] = [];
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      sent.push(JSON.parse(String(init.body)));
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    const created = await req("/api/bookings", { json: booking });
    assert.equal(created.status, 201);
    assert.equal(sent[0].to[0], "caymancrane@gmail.com");

    const admin = await makeAdmin();
    const approve = await req("/admin/bookings/1/approve", { form: {}, cookie: admin });
    assert.equal(approve.headers.get("location"), "/admin/bookings/1?notice=approved-sent");
    const contract = sent.at(-1)!;
    assert.equal(contract.to[0], "kim@example.com");
    assert.match(contract.subject, /CCC-00001 is approved/);
    assert.match(contract.text, /Rental terms/);
    assert.ok((await prisma.booking.findUniqueOrThrow({ where: { id: 1 } })).contractSentAt);
  });

  test("forgot password without customer email shows how to get help", async () => {
    const page = await (await req("/account/forgot")).text();
    assert.match(page, /We&#39;ll reset it for you|We'll reset it for you/);
  });

  test("pages render", async () => {
    for (const path of ["/account", "/account/forgot", "/admin/login", "/admin/setup"]) {
      const res = await req(path);
      assert.equal(res.status, 200, path);
      assert.match(await res.text(), /^<!doctype html>/);
    }
    const customer = await signup();
    assert.equal((await req("/account/profile", { cookie: customer })).status, 200);
    const admin = await makeAdmin();
    await req("/api/bookings", { json: booking, cookie: customer });
    for (const path of ["/admin/bookings", "/admin/bookings?status=all", "/admin/bookings/1", "/admin/customers", "/admin/customers?q=kim", "/admin/customers/1"]) {
      assert.equal((await req(path, { cookie: admin })).status, 200, path);
    }
  });
});
