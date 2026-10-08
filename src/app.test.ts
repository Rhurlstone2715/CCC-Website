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
import { parseDetails } from "./bookings.js";
import { buildCatalog, ensureCatalogSeeded } from "./catalog.js";
import { prisma } from "./db.js";
import { rewardsForSpend } from "./rewards.js";
import { csvCell } from "./routes/admin.js";
import { parseAmount } from "./views/admin-page.js";
import { readFileSync } from "node:fs";

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

  test("csv cells are quoted and formulas neutralised", () => {
    assert.equal(csvCell('He said "hi"'), '"He said ""hi"""');
    assert.equal(csvCell("=HYPERLINK(1)"), `"'=HYPERLINK(1)"`);
    assert.equal(csvCell("+1 345 555 0100"), `"'+1 345 555 0100"`);
    assert.equal(csvCell(12.5), "12.5");
    assert.equal(csvCell(null), "");
  });

  test("booking details drop anything malformed", () => {
    const d = parseDetails({
      phone: "345 555 0100",
      startDate: "2030-02-30",
      startTime: "8am",
      items: [{ id: "rt40", term: "hourly", qty: 4 }, { id: "x", term: "yearly", qty: 1 }, { id: "y", term: "daily", qty: -1 }, "junk"],
    });
    assert.equal(d.phone, "345 555 0100");
    assert.equal(d.startDate, null);
    assert.equal(d.startTime, null);
    assert.deepEqual(d.items, [{ id: "rt40", term: "hourly", qty: 4 }]);
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
    await prisma.$executeRawUnsafe('TRUNCATE "Booking", "Session", "PasswordReset", "User", "Product", "RiggingOption", "Upload" RESTART IDENTITY CASCADE');
    await ensureCatalogSeeded();
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

  test("admins can delete a customer, keeping or removing their bookings", async () => {
    const kim = await signup();
    await req("/api/bookings", { json: booking, cookie: kim });
    const lee = await signup("lee@example.com");
    await req("/api/bookings", { json: { ...booking, customerEmail: "lee@example.com" }, cookie: lee });
    const admin = await makeAdmin();

    // Default keeps the booking as a guest booking.
    const kept = await req("/admin/customers/1/delete", { form: {}, cookie: admin });
    assert.equal(kept.headers.get("location"), "/admin/customers?notice=customer-deleted");
    assert.equal(await prisma.user.count({ where: { id: 1 } }), 0);
    assert.equal((await prisma.booking.findUniqueOrThrow({ where: { id: 1 } })).userId, null);
    assert.equal((await req("/api/rewards", { cookie: kim })).status, 401);

    // Ticking the box removes their bookings too.
    await req("/admin/customers/2/delete", { form: { deleteBookings: "1" }, cookie: admin });
    assert.equal(await prisma.booking.count({ where: { id: 2 } }), 0);

    // An admin can't delete themselves.
    const self = await req("/admin/customers/3/delete", { form: {}, cookie: admin });
    assert.equal(self.headers.get("location"), "/admin/customers/3?notice=cant-delete-self");
    assert.equal(await prisma.user.count(), 1);
  });

  test("the database catalog matches the one the site launched with", async () => {
    const seed = JSON.parse(readFileSync("prisma/catalog-seed.json", "utf8"));
    const catalog = await buildCatalog();
    assert.equal(catalog.products.length, seed.products.length);
    for (const original of seed.products) {
      const served = catalog.products.find(p => p.id === original.id);
      assert.deepStrictEqual(served, original, original.id);
      assert.deepEqual(Object.keys(served!.rates as object), Object.keys(original.rates), `${original.id} rate order`);
    }
    assert.deepStrictEqual(catalog.riggingSizes, seed.riggingSizes);
    // Seeding again changes nothing.
    await ensureCatalogSeeded();
    assert.equal(await prisma.product.count(), seed.products.length);
  });

  test("catalog.js is served for the rentals page", async () => {
    const res = await req("/catalog.js");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /javascript/);
    const body = await res.text();
    assert.match(body, /^window\.CCC_CATALOG=\{"products":\[/);
    assert.ok(!body.includes("</"), "angle brackets are escaped");
  });

  test("bookings are priced on the server, with the tier discount on equipment only", async () => {
    const customer = await signup();
    const admin = await makeAdmin();
    await prisma.user.update({ where: { id: 1 }, data: { rewardCreditCents: 5_000_00 } }); // Silver, 5%
    const items = [
      { id: "rt40", term: "hourly", qty: 4 }, // 145 × 4 = 580
      { id: "telehandler-operator", term: "hourly", qty: 4 }, // operator, 35 × 4 = 140, no discount
      { id: "lifting-10", term: "daily", qty: 1 }, // size option, 50
      { id: "retired-thing", term: "daily", qty: 1 }, // unknown, unpriced
    ];
    await req("/api/bookings", { json: { ...booking, details: { phone: "345 555 0100", startDate: "2030-05-15", startTime: "08:00", area: "George Town", siteAddress: "1 Test Rd", items } }, cookie: customer });
    const saved = await prisma.booking.findFirstOrThrow({ where: { userId: 1 } });
    const lines = saved.items as { id: string; amount: number | null; operator: boolean; name: string }[];
    assert.deepEqual(lines.map(l => l.amount), [580, 140, 50, null]);
    assert.equal(lines[2].name, "Lifting Beams — 10′ × 8″");
    assert.equal(saved.estimateCents, Math.round((580 + 50) * 100 * 0.95) + 140 * 100);
    assert.equal(saved.startDate?.toISOString().slice(0, 10), "2030-05-15");
    assert.equal(saved.area, "George Town");
    const page = await (await req(`/admin/bookings/${saved.id}`, { cookie: admin })).text();
    assert.match(page, /Job details/);
    assert.match(page, /To be quoted/);
  });

  test("admin price changes reach the site and new bookings, not old ones", async () => {
    const admin = await makeAdmin();
    const items = [{ id: "rt40", term: "hourly", qty: 4 }];
    await req("/api/bookings", { json: { ...booking, details: { items } } });
    const form = { name: "Terex RT40", spec: "40 ton", description: "Compact crane.", rate_hourly: "150", rate_daily: "1,215", sortOrder: "30", listed: "on" };
    const saved = await req("/admin/catalog/rt40", { form, cookie: admin });
    assert.equal(saved.headers.get("location"), "/admin/catalog/rt40?notice=saved");
    assert.match(await (await req("/catalog.js")).text(), /"id":"rt40"[^}]*"rates":\{"hourly":150,"daily":1215\}/);
    await req("/api/bookings", { json: { ...booking, details: { items } } });
    const [first, second] = await prisma.booking.findMany({ orderBy: { id: "asc" } });
    assert.equal(first.estimateCents, 580_00);
    assert.equal(second.estimateCents, 600_00);
  });

  test("catalog form validation", async () => {
    const admin = await makeAdmin();
    const base = { name: "Terex RT40", spec: "40 ton", description: "Compact crane.", rate_hourly: "150", sortOrder: "30" };
    for (const form of [
      { ...base, name: "<script>" },
      { ...base, rate_hourly: "" },
      { ...base, rate_hourly: "abc" },
      { ...base, sortOrder: "x" },
    ]) {
      assert.equal((await req("/admin/catalog/rt40", { form, cookie: admin })).status, 400, JSON.stringify(form));
    }
  });

  test("admins can add equipment with a photo, and delete it", async () => {
    const admin = await makeAdmin();
    const png = Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8ffff3f0005fe02fea7d6a4a00000000049454e44ae426082", "hex");
    const make = async (file: Blob) => {
      const fd = new FormData();
      Object.entries({ name: "Mini Excavator", category: "Construction Plant / Equipment", spec: "1.7 ton", description: "Compact digger.", rate_daily: "250", sortOrder: "999", listed: "on" }).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", file, "digger.png");
      return app.request("/admin/catalog/new", { method: "POST", body: fd, headers: { cookie: admin, "x-real-ip": randomUUID() } });
    };
    const fake = await make(new Blob(["<html>not an image</html>"], { type: "image/png" }));
    assert.equal(fake.status, 400);
    const res = await make(new Blob([png], { type: "image/png" }));
    assert.equal(res.status, 302);
    const product = await prisma.product.findFirstOrThrow({ where: { isCustom: true } });
    assert.match(product.id, /^mini-excavator-[0-9a-f]{4}$/);
    assert.match(product.image, /^\/uploads\/[a-z0-9]+$/);
    const image = await req(product.image);
    assert.equal(image.headers.get("content-type"), "image/png");
    assert.equal(image.headers.get("cache-control"), "public, max-age=31536000, immutable");
    assert.match(await (await req("/catalog.js")).text(), /"category":"Construction Plant \/ Equipment"/);

    // Original items can't be deleted; custom ones can, with their upload.
    await req("/admin/catalog/rt40/delete", { form: {}, cookie: admin });
    assert.equal(await prisma.product.count({ where: { id: "rt40" } }), 1);
    const del = await req(`/admin/catalog/${product.id}/delete`, { form: {}, cookie: admin });
    assert.equal(del.headers.get("location"), "/admin/catalog?notice=deleted");
    assert.equal(await prisma.upload.count(), 0);
  });

  test("size prices can be edited or set to priced on request", async () => {
    const admin = await makeAdmin();
    const options = await prisma.riggingOption.findMany({ where: { productId: "liftingbeams" }, orderBy: { sortOrder: "asc" } });
    const form: Record<string, string> = {};
    for (const o of options) {
      form[`size_${o.id}`] = o.size;
      form[`price_${o.id}`] = o.id === "lifting-10" ? "60" : o.id === "lifting-30" ? "" : String(o.price);
    }
    const res = await req("/admin/catalog/liftingbeams/sizes", { form, cookie: admin });
    assert.equal(res.headers.get("location"), "/admin/catalog/liftingbeams?notice=sizes-saved");
    const sizes = (await buildCatalog()).riggingSizes.liftingbeams;
    assert.equal(sizes.find(o => o.id === "lifting-10")?.price, 60);
    assert.equal("price" in sizes.find(o => o.id === "lifting-30")!, false);
  });

  test("calendar shows bookings on their dates and flags clashes", async () => {
    const admin = await makeAdmin();
    const crane = { items: [{ id: "rt890e", term: "daily", qty: 1 }] }; // one unit available
    await req("/api/bookings", { json: { ...booking, details: { ...crane, startDate: "2030-05-15" } } });
    await req("/api/bookings", { json: { ...booking, customerName: "Lee Bodden", details: { ...crane, startDate: "2030-05-14" } } });
    let page = await (await req("/admin/calendar?month=2030-05", { cookie: admin })).text();
    assert.match(page, /May 2030/);
    assert.match(page, /00001/);
    assert.doesNotMatch(page, /Possible clashes/);

    // Confirm booking 2 for the 14th to the 16th: it now overlaps booking 1 on the 15th.
    const bad = await req("/admin/bookings/2/schedule", { form: { scheduleStart: "2030-05-16", scheduleEnd: "2030-05-14" }, cookie: admin });
    assert.equal(bad.headers.get("location"), "/admin/bookings/2?notice=bad-schedule");
    await req("/admin/bookings/2/schedule", { form: { scheduleStart: "2030-05-14", scheduleEnd: "2030-05-16" }, cookie: admin });
    page = await (await req("/admin/calendar?month=2030-05", { cookie: admin })).text();
    assert.match(page, /Possible clashes/);
    assert.match(page, /Grove RT890E, 2 bookings for 1 available/);

    // Declined bookings drop off the calendar.
    await req("/admin/bookings/1/decline", { form: {}, cookie: admin });
    page = await (await req("/admin/calendar?month=2030-05", { cookie: admin })).text();
    assert.doesNotMatch(page, /Possible clashes/);
  });

  test("bookings export as CSV for admins only", async () => {
    const customer = await signup();
    await req("/api/bookings", { json: { ...booking, customerName: "=HYPERLINK(\"x\")", details: { phone: "+1 345 555 0100", items: [{ id: "rt40", term: "hourly", qty: 4 }] } }, cookie: customer });
    assert.equal((await req("/admin/bookings/export.csv", { cookie: customer })).status, 302);
    const admin = await makeAdmin();
    await req("/admin/bookings/1/approve", { form: {}, cookie: admin });
    await req("/admin/bookings/1/paid", { form: { amount: "551" }, cookie: admin });
    const res = await req("/admin/bookings/export.csv?status=paid", { cookie: admin });
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-disposition") ?? "", /attachment; filename="ccc-bookings-paid-\d{4}-\d{2}-\d{2}\.csv"/);
    const csv = await res.text();
    const [header, row] = csv.replace(/^\uFEFF/, "").trim().split("\r\n");
    assert.match(header, /^"Reference","Received \(Cayman time\)","Status"/);
    assert.match(row, /^"CCC-00001",/);
    assert.match(row, /"'=HYPERLINK\(""x""\)"/);
    assert.match(row, /"'\+1 345 555 0100"/);
    assert.match(row, /"Terex RT40 \(Hourly × 4\)",580,551,/);
    const none = await (await req("/admin/bookings/export.csv?status=declined", { cookie: admin })).text();
    assert.equal(none.replace(/^\uFEFF/, "").trim().split("\r\n").length, 1);
  });

  test("forgot password without customer email shows how to get help", async () => {
    const page = await (await req("/account/forgot")).text();
    assert.match(page, /We&#39;ll reset it for you|We'll reset it for you/);
  });

  test("pages render", async () => {
    for (const path of ["/account", "/account/forgot", "/admin/login", "/admin/setup", "/privacy"]) {
      const res = await req(path);
      assert.equal(res.status, 200, path);
      assert.match(await res.text(), /^<!doctype html>/);
    }
    const customer = await signup();
    assert.equal((await req("/account/profile", { cookie: customer })).status, 200);
    const admin = await makeAdmin();
    await req("/api/bookings", { json: booking, cookie: customer });
    for (const path of [
      "/admin/bookings",
      "/admin/bookings?status=all",
      "/admin/bookings/1",
      "/admin/customers",
      "/admin/customers?q=kim",
      "/admin/customers/1",
      "/admin/calendar",
      "/admin/calendar?month=2030-01",
      "/admin/catalog",
      "/admin/catalog/new",
      "/admin/catalog/rt40",
      "/admin/catalog/liftingbeams",
    ]) {
      assert.equal((await req(path, { cookie: admin })).status, 200, path);
    }
  });
});
