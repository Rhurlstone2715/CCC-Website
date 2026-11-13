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
import { parseBooking, parseDetails } from "./bookings.js";
import { buildCatalog, ensureCatalogSeeded, setProblem } from "./catalog.js";
import { prisma } from "./db.js";
import { deliverAccountEmails, queueWelcomeEmail } from "./account-emails.js";
import { companyEmailDomain, syncCompanyMembership } from "./companies.js";
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

  test("new checkout requests accept Grand Cayman areas only", () => {
    const valid={customerName:"Test",customerEmail:"test@example.com",requestText:"Rental",termsText:"Terms",signature:"Test",initials:"T",agreement:true,paymentAck:true};
    for(const area of ["George Town","7 Mile Beach","West Bay","Red Bay","Prospect","Spotts","Savannah","Bodden Town","East End","North Side"])assert.equal("error" in parseBooking({...valid,details:{area}}),false);
    for(const area of ["Other","Cayman Brac","Little Cayman","Other / Cayman Brac / Little Cayman"])assert.equal("error" in parseBooking({...valid,details:{area}}),true);
    assert.equal("error" in parseBooking({...valid,details:{rentalCollection:"pickup"}}),false);
  });

  test("checkout accepts whole-hour start times and rejects minutes or invalid hours", () => {
    const valid={customerName:"Test",customerEmail:"test@example.com",requestText:"Rental",termsText:"Terms",signature:"Test",initials:"T",agreement:true,paymentAck:true};
    for(let h=0;h<24;h++) assert.equal("error" in parseBooking({...valid,details:{startTime:`${String(h).padStart(2,"0")}:00`}}),false);
    for(const startTime of ["08:30","08:01","24:00","99:00","8:00","08:00:00",123]) assert.equal("error" in parseBooking({...valid,details:{startTime}}),true);
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

  test("vibrator motors are rented as sets of motor, shaft and head", () => {
    const products = [
      { id: "motor", name: "Vibrator Motor", hidden: false, addOns: ["shaft14", "shaft20", "head1", "head2", "strap"], setPart: null },
      { id: "shaft14", name: "14 ft shaft", hidden: false, addOns: [], setPart: "Shaft" },
      { id: "shaft20", name: "20 ft shaft", hidden: false, addOns: [], setPart: "Shaft" },
      { id: "head1", name: "Head 1", hidden: false, addOns: [], setPart: "Head" },
      { id: "head2", name: "Head 2", hidden: false, addOns: [], setPart: "Head" },
      { id: "strap", name: "Strap", hidden: false, addOns: [], setPart: null },
      { id: "loose", name: "Unoffered part", hidden: false, addOns: [], setPart: "Head" },
    ];
    const line = (id: string, qty = 1, term = "daily") => ({ id, term, qty });
    assert.equal(setProblem([line("motor"), line("shaft14"), line("head1")], products), null);
    assert.equal(setProblem([line("motor", 2), line("shaft14"), line("shaft20"), line("head2", 2), line("strap")], products), null);
    assert.match(setProblem([line("motor")], products)!, /Vibrator Motor has to be rented as a set, with one shaft and one head/);
    assert.ok(setProblem([line("shaft14")], products), "a part on its own");
    assert.ok(setProblem([line("motor", 2), line("shaft14"), line("head1")], products), "two motors, one set of parts");
    assert.ok(setProblem([line("motor", 1, "weekly"), line("shaft14"), line("head1")], products), "parts on a different term");
    assert.equal(setProblem([line("loose")], products), null, "a part nothing offers is an ordinary item");
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
    await prisma.$executeRawUnsafe('TRUNCATE "AccountEmail", "Booking", "Session", "PasswordReset", "EmailVerification", "User", "Company", "Product", "RiggingOption", "Upload" RESTART IDENTITY CASCADE');
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
    const res = await req("/account/signup", { form: { name: "Kim Ebanks", email, phone: "345 555 0100", company: "", password } });
    assert.equal(res.status, 302);
    // Most tests use an already-verified fixture; verification flows test raw signup directly.
    await prisma.user.update({ where: { email: email.trim().toLowerCase() }, data: { emailVerifiedAt: new Date() } });
    return sessionCookie(res);
  }

  // Admins log in through the normal login, which sends them to the admin area.
  async function makeAdmin() {
    await prisma.user.create({ data: { name: "Ric Admin", email: "admin@example.com", role: "ADMIN", passwordHash: await hashPassword("adminpass123") } });
    const res = await req("/account/login", { form: { email: "admin@example.com", password: "adminpass123" } });
    assert.equal(res.headers.get("location"), "/admin");
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

  test("page visits to the Railway address go to the public domain", async () => {
    process.env.PUBLIC_URL = "https://www.caymancrane.com";
    try {
      const railway = { "x-forwarded-host": "web-production-470031.up.railway.app" };
      const page = await app.request("/rentals?ref=ad", { headers: railway });
      assert.equal(page.status, 301);
      assert.equal(page.headers.get("location"), "https://www.caymancrane.com/rentals?ref=ad");
      assert.equal((await app.request("/healthz", { headers: railway })).status, 200);
      const post = await app.request("/api/bookings", { method: "POST", headers: { ...railway, "content-type": "application/json" }, body: "{}" });
      assert.equal(post.status, 401, "form posts are served, not redirected");
      const own = await app.request("/rentals", { headers: { "x-forwarded-host": "www.caymancrane.com" } });
      assert.equal(own.status, 200);
    } finally {
      delete process.env.PUBLIC_URL;
    }
  });

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
    assert.equal(data.profile.company, null);
    assert.equal(res.headers.get("cache-control"), "private, no-store");
  });

  test("sign up rejects duplicates and short passwords", async () => {
    await signup("Kim@Example.com");
    const dup = await req("/account/signup", { form: { name: "Kim", email: "kim@example.com", phone: "345 555 0100", password: "longenough1" } });
    assert.equal(dup.status, 409);
    const short = await req("/account/signup", { form: { name: "Lee", email: "lee@example.com", phone: "345 555 0101", password: "short" } });
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

  test("successful logins don't count toward the login limit", async () => {
    await signup();
    for (let i = 0; i < 12; i++) {
      const ok = await req("/account/login", { form: { email: "kim@example.com", password: "longenough1" } });
      assert.equal(ok.status, 302, `login ${i + 1}`);
    }
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

  test("account greeting shows live points, tier and next-tier points including the highest tier", async () => {
    const cookie=await signup();
    const user=await prisma.user.findUniqueOrThrow({where:{email:"kim@example.com"}});
    await prisma.user.update({where:{id:user.id},data:{name:"Ric Hurlstone",rewardCreditCents:990000}});
    let page=await (await req("/account/profile",{cookie})).text();
    let welcome=page.match(/<section[^>]*account-welcome[\s\S]*?<\/section>/)![0];
    assert.match(welcome,/Welcome back, Ric/);assert.match(welcome,/9,900/);assert.match(welcome,/Silver/);assert.match(welcome,/Points until Gold/);assert.match(welcome,/5,100/);
    await prisma.user.update({where:{id:user.id},data:{rewardCreditCents:2500000}});
    page=await (await req("/account/profile",{cookie})).text();welcome=page.match(/<section[^>]*account-welcome[\s\S]*?<\/section>/)![0];
    assert.match(welcome,/25,000/);assert.match(welcome,/Platinum/);assert.match(welcome,/Highest tier reached/);assert.doesNotMatch(welcome,/Points until/);
  });

  test("profile page needs a session", async () => {
    const res = await req("/account/profile");
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), "/account?next=%2Faccount%2Fprofile");
  });

  test("booking needs an account, and uses the account's email", async () => {
    const guest = await req("/api/bookings", { json: booking });
    assert.equal(guest.status, 401);
    assert.equal((await guest.json()).signIn, true);
    assert.equal(await prisma.booking.count(), 0);

    const cookie = await signup();
    const res = await req("/api/bookings", { json: { ...booking, customerEmail: "someone-else@example.com" }, cookie });
    // No Resend key in tests, so the alert can't send and the page falls back to email.
    assert.equal(res.status, 503);
    const saved = await prisma.booking.findFirstOrThrow();
    assert.equal(saved.userId, 1);
    assert.equal(saved.customerEmail, "kim@example.com");
    assert.equal(saved.rewardTier, "Member");
  });

  test("sign up needs a phone number, and older accounts get theirs from checkout", async () => {
    const noPhone = await req("/account/signup", { form: { name: "Lee Bodden", email: "lee@example.com", password: "longenough1" } });
    assert.equal(noPhone.status, 400);
    assert.match(await noPhone.text(), /Enter your phone number/);

    await prisma.user.create({ data: { name: "Old Account", email: "old@example.com", emailVerifiedAt: new Date(), passwordHash: await hashPassword("longenough1") } });
    const login = await req("/account/login", { form: { email: "old@example.com", password: "longenough1" } });
    await req("/api/bookings", { json: { ...booking, details: { phone: "345 555 0199", company: "Old Co", items: [] } }, cookie: sessionCookie(login) });
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "old@example.com" } });
    assert.equal(user.phone, "345 555 0199");
    assert.equal(user.company, null, "checkout company text must not establish company membership");
  });

  // Turns customer emails on and records what would have been sent.
  function captureEmails() {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Cayman Crane <bookings@example.com>";
    const sent: { to: string[]; subject: string; text: string; html?: string }[] = [];
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      sent.push(JSON.parse(String(init.body)));
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    return sent;
  }
  const confirmPath = (text: string) => {
    const link = text.match(/https?:\/\/\S+\/account\/verify\?token=\S+/)?.[0];
    assert.ok(link, "expected a confirmation link");
    const url = new URL(link);
    return url.pathname + url.search;
  };

  test("new customers confirm their email before booking", async () => {
    const sent = captureEmails();
    const res = await req("/account/signup", {
      form: { name: "Kim Ebanks", email: "kim@example.com", phone: "345 555 0100", password: "longenough1", next: "/rentals?checkout=1" },
    });
    assert.equal(res.headers.get("location"), "/account/verify?next=%2Frentals%3Fcheckout%3D1");
    const cookie = sessionCookie(res);
    assert.equal(sent[0].to[0], "kim@example.com");
    assert.match(sent[0].subject, /Confirm your email/);
    const link = confirmPath(sent[0].text);
    assert.match(link, /next=%2Frentals%3Fcheckout%3D1/);

    assert.equal((await (await req("/api/rewards", { cookie })).json()).profile.emailConfirmed, false);
    const blocked = await req("/api/bookings", { json: booking, cookie });
    assert.equal(blocked.status, 403);
    assert.equal((await blocked.json()).confirmEmail, true);
    assert.match(await (await req("/account/verify?next=%2Frentals%3Fcheckout%3D1", { cookie })).text(), /Check the inbox for <b>kim@example.com<\/b>/);

    const confirmed = await req(link, { cookie });
    assert.equal(confirmed.headers.get("location"), "/rentals?checkout=1");
    assert.equal((await (await req("/api/rewards", { cookie })).json()).profile.emailConfirmed, true);
    assert.equal((await req("/api/bookings", { json: booking, cookie })).status, 201);
    assert.equal((await req(link)).status, 400, "links work once");
  });

  test("a new email address has to be confirmed again", async () => {
    const sent = captureEmails();
    const signupRes = await req("/account/signup", { form: { name: "Kim Ebanks", email: "kim@example.com", phone: "345 555 0100", password: "longenough1" } });
    assert.equal(signupRes.headers.get("location"), "/account/verify");
    const cookie = sessionCookie(signupRes);
    const oldLink = confirmPath(sent[0].text);
    const changed = await req("/account/profile", { form: { name: "Kim Ebanks", email: "kim.new@example.com", phone: "345 555 0100" }, cookie });
    assert.equal(changed.headers.get("location"), "/account/profile?notice=email-changed");
    assert.equal(sent.at(-1)!.to[0], "kim.new@example.com");
    // The first link was for the old address, so it no longer confirms anything.
    assert.equal((await req(oldLink)).status, 400);
    const opened = await req(confirmPath(sent.at(-1)!.text));
    assert.equal(opened.status, 200, "opened without being logged in");
    assert.match(await opened.text(), /Email confirmed/);
    assert.ok((await prisma.user.findUniqueOrThrow({ where: { id: 1 } })).emailVerifiedAt);
  });

  test("marketing needs the customer's say-so, and admins can list and stop it", async () => {
    await signup();
    const lee = await req("/account/signup", { form: { name: "Lee Bodden", email: "lee@example.com", phone: "345 555 0101", password: "longenough1", marketing: "on" } });
    const leeCookie = sessionCookie(lee);
    const leeUser = await prisma.user.findUniqueOrThrow({ where: { email: "lee@example.com" } });
    assert.equal(leeUser.marketingOptIn, true);
    assert.ok(leeUser.marketingOptInAt);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { email: "kim@example.com" } })).marketingOptIn, false);
    assert.equal((await req("/admin/customers/marketing.csv", { cookie: leeCookie })).status, 302, "customers can't download it");

    const admin = await makeAdmin();
    const csv = await (await req("/admin/customers/marketing.csv", { cookie: admin })).text();
    assert.match(csv, /"Lee Bodden","lee@example.com","'?345 555 0101"/);
    assert.doesNotMatch(csv, /kim@example.com/);
    const exported = await prisma.user.findUniqueOrThrow({ where: { id: leeUser.id } });
    assert.ok(exported.marketingUnsubscribeToken);
    const unsubscribeUrl = `/account/unsubscribe?token=${exported.marketingUnsubscribeToken}`;
    assert.match(csv, /Unsubscribe URL/);
    assert.ok(csv.includes(unsubscribeUrl));
    assert.equal((await req(unsubscribeUrl)).status, 200);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: leeUser.id } })).marketingOptIn, true, "link scanners cannot opt out");
    assert.equal((await req("/account/unsubscribe", { form: { token: "invalid" } })).status, 400);
    const unsubscribe = await req("/account/unsubscribe", { form: { token: exported.marketingUnsubscribeToken } });
    assert.equal(unsubscribe.status, 200);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: leeUser.id } })).marketingOptIn, false);
    assert.doesNotMatch(await (await req("/admin/customers/marketing.csv", { cookie: admin })).text(), /lee@example.com/);


    // Unticking on the profile opts out.
    await req("/account/profile", { form: { name: "Lee Bodden", email: "lee@example.com", phone: "345 555 0101" }, cookie: leeCookie });
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: leeUser.id } })).marketingOptIn, false);
    await req("/account/profile", { form: { name: "Lee Bodden", email: "lee@example.com", phone: "345 555 0101", marketing: "on" }, cookie: leeCookie });
    const stop = await req(`/admin/customers/${leeUser.id}/marketing-off`, { form: {}, cookie: admin });
    assert.equal(stop.headers.get("location"), `/admin/customers/${leeUser.id}?notice=marketing-off`);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: leeUser.id } });
    assert.equal(after.marketingOptIn, false);
    assert.equal(after.marketingOptInAt, null);
  });

  test("customers must confirm their own email and admins cannot bypass it", async () => {
    captureEmails();
    const res = await req("/account/signup", { form: { name: "Kim Ebanks", email: "kim@example.com", phone: "345 555 0100", password: "longenough1" } });
    const cookie = sessionCookie(res);
    assert.equal((await req("/api/bookings", { json: booking, cookie })).status, 403);
    const admin = await makeAdmin();
    const page = await (await req("/admin/customers/1", { cookie: admin })).text();
    assert.doesNotMatch(page, /action="[^"]*confirm-email/);
    assert.equal((await req("/admin/customers/1/confirm-email", { form: {}, cookie: admin })).status, 403);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: 1 } })).emailVerifiedAt, null);
  });

  test("the login page explains why when sent from checkout", async () => {
    const page = await (await req("/account?next=%2Frentals%3Fcheckout%3D1")).text();
    assert.match(page, /Log in or create an account to send your booking request/);
    assert.match(page, /name="next" value="\/rentals\?checkout=1"/);
    assert.doesNotMatch(await (await req("/account")).text(), /send your booking request/);
  });

  test("customers can't reach admin pages", async () => {
    const cookie = await signup();
    const res = await req("/admin/bookings", { cookie });
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), "/account/profile?notice=not-admin");
    assert.equal((await req("/admin/bookings")).headers.get("location"), "/account?next=%2Fadmin%2Fbookings");
    assert.equal((await (await req("/api/rewards", { cookie })).json()).admin, false);
  });

  test("admins log in through the normal login; there's no setup page", async () => {
    assert.equal((await req("/admin/login")).headers.get("location"), "/account?next=%2Fadmin");
    const cookie = await makeAdmin();
    assert.equal((await req("/admin/setup", { cookie })).status, 404);
    assert.equal((await req("/admin/bookings", { cookie })).status, 200);
    assert.equal((await req("/account", { cookie })).headers.get("location"), "/admin");
    assert.equal((await (await req("/api/rewards", { cookie })).json()).admin, true);
    // A page asked for before logging in still wins.
    const deep = await req("/account/login", { form: { email: "admin@example.com", password: "adminpass123", next: "/admin/catalog" } });
    assert.equal(deep.headers.get("location"), "/admin/catalog");
  });

  test("customer promotion is hidden and refused, while admin removal remains available", async () => {
    const kim = await signup();
    const admin = await makeAdmin();
    const page = await (await req("/admin/customers/1", { cookie: admin })).text();
    assert.doesNotMatch(page, /Give admin access|name="role" value="ADMIN"/);
    const made = await req("/admin/customers/1/role", { form: { role: "ADMIN" }, cookie: admin });
    assert.equal(made.status, 403);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: 1 } })).role, "CUSTOMER");
    assert.equal((await req("/admin/bookings", { cookie: kim })).headers.get("location"), "/account/profile?notice=not-admin");
    const self = await req("/admin/customers/2/role", { form: { role: "CUSTOMER" }, cookie: admin });
    assert.equal(self.headers.get("location"), "/admin/customers/2?notice=cant-change-self");
    const other = await prisma.user.create({ data: { name: "Other Admin", email: "other-admin@example.com", role: "ADMIN", passwordHash: await hashPassword("adminpass123") } });
    const removed = await req(`/admin/customers/${other.id}/role`, { form: { role: "CUSTOMER" }, cookie: admin });
    assert.equal(removed.headers.get("location"), `/admin/customers/${other.id}?notice=removed-admin`);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: other.id } })).role, "CUSTOMER");
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
    await req("/api/bookings", { json: booking, cookie: await signup() });
    const admin = await makeAdmin();
    const res = await req("/admin/bookings/1/paid", { form: { amount: "100" }, cookie: admin });
    assert.equal(res.headers.get("location"), "/admin/bookings/1?notice=bad-transition");
    assert.equal((await prisma.booking.findUniqueOrThrow({ where: { id: 1 } })).status, "PENDING");
  });

  test("customer recovery emails their username and one-use reset link, revokes sessions and blocks admin links", async () => {
    const oldCookie = await signup();
    const sent = captureEmails();
    const admin = await makeAdmin();
    assert.equal((await req("/admin/customers/1/reset-link", { form: {}, cookie: admin })).status, 403);
    const forgot = await req("/account/forgot", { form: { email: "kim@example.com" } });
    assert.equal(forgot.status, 200);
    const message = sent.find(m => m.to.includes("kim@example.com"))!;
    assert.match(message.text, /Your username \(login email\): kim@example.com/);
    const token = message.text.match(/\/account\/reset\?token=([\w-]+)/)?.[1];assert.ok(token);
    assert.equal((await req(`/account/reset?token=${token}`)).status, 200);
    const reset = await req("/account/reset", { form: { token: token!, password: "brand-new-pass" } });
    assert.equal(reset.status, 302);
    assert.equal((await req("/api/rewards", { cookie: oldCookie })).status, 401);
    assert.equal((await req("/account/reset", { form: { token: token!, password: "another-new-pass" } })).status, 400);
    const login = await req("/account/login", { form: { email: "kim@example.com", password: "brand-new-pass" } });
    assert.equal(login.status, 302);
    const unknown = await req("/account/forgot", { form: { email: "nobody@example.com" } });
    assert.equal(await unknown.text(), await forgot.text(), "recovery must not disclose registered accounts");
  });

  test("with email set up, approval emails the contract and bookings alert the company", async () => {
    const kim = await signup();
    await prisma.user.update({ where: { id: 1 }, data: { emailVerifiedAt: new Date() } });
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Cayman Crane <bookings@example.com>";
    const sent: { to: string[]; subject: string; text: string; html?: string }[] = [];
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      sent.push(JSON.parse(String(init.body)));
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    const created = await req("/api/bookings", { json: booking, cookie: kim });
    assert.equal(created.status, 201);
    assert.equal(sent[0].to[0], "caymancrane@gmail.com");

    const admin = await makeAdmin();
    await req("/admin/bookings/1/schedule", { form: { scheduleStart: "2026-11-02", scheduleEnd: "2026-11-04" }, cookie: admin });
    const approve = await req("/admin/bookings/1/approve", { form: {}, cookie: admin });
    assert.equal(approve.headers.get("location"), "/admin/bookings/1?notice=approved-sent");
    const contract = sent.at(-1)!;
    assert.equal(contract.to[0], "kim@example.com");
    assert.match(contract.subject, /CCC-00001 is confirmed/);
    assert.match(contract.text, /Rental dates: Nov 2, 2026 to Nov 4, 2026/);
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

  test("mixer migration leaves an empty database ready for the complete catalog seed", async () => {
    await prisma.$executeRawUnsafe('TRUNCATE "Product" CASCADE');
    const sql=readFileSync("prisma/migrations/20261112140000_diesel_towable_cement_mixer/migration.sql","utf8");
    await prisma.$executeRawUnsafe(sql);assert.equal(await prisma.product.count(),0);
    await ensureCatalogSeeded();
    const seed=JSON.parse(readFileSync("prisma/catalog-seed.json","utf8"));assert.equal(await prisma.product.count(),seed.products.length);
    assert.ok(await prisma.product.findUnique({where:{id:"rt40"}}));
    assert.equal((await prisma.product.findUniqueOrThrow({where:{id:"diesel-mixer-9-cu-ft"}})).availableQuantity,2);
  });
  test("diesel mixer reaches existing catalogs and server bookings use all three approved rates", async () => {
    const id="diesel-mixer-9-cu-ft",sql=readFileSync("prisma/migrations/20261112140000_diesel_towable_cement_mixer/migration.sql","utf8");
    await prisma.product.delete({where:{id}});const before=await prisma.product.count();
    await prisma.$executeRawUnsafe(sql);await prisma.$executeRawUnsafe(sql);assert.equal(await prisma.product.count(),before+1);
    const product=await prisma.product.findUniqueOrThrow({where:{id}});assert.equal(product.category,"Tools");assert.equal(product.availableQuantity,2);assert.equal(product.needsPower,false);assert.match(product.spec,/Pintle hitch/);
    assert.deepEqual(product.rates,{daily:40,weekly:175,monthly:600});
    const cookie=await signup();
    for(const[term,rate]of Object.entries({daily:40,weekly:175,monthly:600})){
      await req("/api/bookings",{cookie,json:{...booking,details:{items:[{id,term,qty:1,price:0}]}}});
      const saved=await prisma.booking.findFirstOrThrow({orderBy:{id:"desc"}});assert.equal(saved.estimateCents,rate*100,term);
    }
    await prisma.product.update({where:{id},data:{availableQuantity:1,rates:{daily:41,weekly:175,monthly:600}}});
    await prisma.$executeRawUnsafe(sql);const edited=await prisma.product.findUniqueOrThrow({where:{id}});assert.equal(edited.availableQuantity,1);assert.equal((edited.rates as {daily:number}).daily,41);
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

  test("fuel-return conditions come from catalog engines and remain in the signed booking", async () => {
    const cookie=await signup();
    await req("/api/bookings",{cookie,json:{...booking,details:{rentalCollection:"pickup",items:[{id:"compressor",term:"daily",qty:1,fuelType:"diesel"},{id:"diesel-mixer-9-cu-ft",term:"daily",qty:2},{id:"g25",term:"weekly",qty:1},{id:"palletjacks",term:"daily",qty:1},{id:"rt40",term:"daily",qty:1},{id:"national1400",term:"daily",qty:1}]}}});
    const saved=await prisma.booking.findFirstOrThrow();assert.equal(saved.rentalCollection,"pickup");
    assert.match(saved.termsText,/40 Gal Gas Air Compressor: Return with a full tank of gasoline/);
    assert.match(saved.termsText,/9 cu ft Towable Cement Mixer.*Return with a full tank of diesel fuel/);
    assert.match(saved.termsText,/Wacker Neuson G25: Return with a full tank of diesel fuel/);
    assert.doesNotMatch(saved.termsText.split("FUEL RETURN REQUIREMENTS")[1],/Pallet Jacks|Terex|National/);
    for(const id of ["rt40","national1400"]) assert.equal((saved.items as {id:string;fuelType?:string}[]).find(i=>i.id===id)?.fuelType,undefined);
    const lines=saved.items as {id:string;fuelType?:string}[];assert.equal(lines.find(i=>i.id==="compressor")?.fuelType,"gasoline");assert.equal(lines.find(i=>i.id==="diesel-mixer-9-cu-ft")?.fuelType,"diesel");
    await req("/api/bookings",{cookie,json:{...booking,details:{items:[{id:"mini-welder",term:"daily",qty:1},{id:"cord100",term:"daily",qty:1}]}}});
    const electric=await prisma.booking.findFirstOrThrow({orderBy:{id:"desc"}});assert.equal(electric.termsText,booking.termsText);assert.equal(electric.rentalCollection,null);
  });
  test("admins maintain engine fuel without losing it on unrelated edits", async () => {
    const admin=await makeAdmin();const form={name:"40 Gal Gas Air Compressor",spec:"Gasoline compressor",description:"Jobsite compressor",rate_daily:"75",sortOrder:"20",listed:"on",delivery:"on"};
    assert.equal((await req("/admin/catalog/compressor",{cookie:admin,form})).status,302);
    assert.equal((await prisma.product.findUniqueOrThrow({where:{id:"compressor"}})).fuelType,"gasoline");
    const bad=await req("/admin/catalog/compressor",{cookie:admin,form:{...form,fuelType:"kerosene"}});assert.equal(bad.status,400);
    assert.equal((await req("/admin/catalog/compressor",{cookie:admin,form:{...form,fuelType:"diesel"}})).status,302);
    assert.equal((await prisma.product.findUniqueOrThrow({where:{id:"compressor"}})).fuelType,"diesel");
    const changed=(await buildCatalog()).products.find(p=>p.id==="compressor")!;assert.equal(changed.fuelType,"diesel");assert.equal(changed.delivery,true);
  });

  test("admin price changes reach the site and new bookings, not old ones", async () => {
    const admin = await makeAdmin();
    const items = [{ id: "rt40", term: "hourly", qty: 4 }];
    await req("/api/bookings", { json: { ...booking, details: { items } }, cookie: admin });
    const form = { name: "Terex RT40", spec: "40 ton", description: "Compact crane.", rate_hourly: "150", rate_daily: "1,215", sortOrder: "30", listed: "on" };
    const saved = await req("/admin/catalog/rt40", { form, cookie: admin });
    assert.equal(saved.headers.get("location"), "/admin/catalog/rt40?notice=saved");
    assert.match(await (await req("/catalog.js")).text(), /"id":"rt40"[^}]*"rates":\{"hourly":150,"daily":1215\}/);
    await req("/api/bookings", { json: { ...booking, details: { items } }, cookie: admin });
    const [first, second] = await prisma.booking.findMany({ orderBy: { id: "asc" } });
    assert.equal(first.estimateCents, 580_00);
    assert.equal(second.estimateCents, 600_00);
  });

  test("bookings refuse an incomplete vibrator set, and set parts are edited in the catalog", async () => {
    const cookie = await signup();
    const motorOnly = await req("/api/bookings", { json: { ...booking, details: { items: [{ id: "wyco-995", term: "daily", qty: 1 }] } }, cookie });
    assert.equal(motorOnly.status, 400);
    assert.match((await motorOnly.json()).error, /Wyco Concrete Vibrator — Complete Rental has to be rented as a set, with one shaft and one head/);
    assert.equal(await prisma.booking.count(), 0);
    const set = [
      { id: "wyco-995", term: "daily", qty: 1 },
      { id: "wyco-8920", term: "daily", qty: 1 },
      { id: "wyco-750d", term: "daily", qty: 1 },
    ];
    assert.equal((await req("/api/bookings", { json: { ...booking, details: { items: set } }, cookie })).status, 503, "saved (the alert can't send in tests)");
    assert.equal((await buildCatalog()).products.find(p => p.id === "wyco-8920")?.setPart, "Shaft");

    // Clearing a head's set part in the editor makes it an ordinary item again.
    const admin = await makeAdmin();
    const form = { name: "Wyco 750-D Pencil Square Head", spec: "13/16″ square head", description: "Square head.", rate_daily: "5", rate_weekly: "20", sortOrder: "500", listed: "on", setPart: "" };
    const saved = await req("/admin/catalog/wyco-750d", { form, cookie: admin });
    assert.equal(saved.headers.get("location"), "/admin/catalog/wyco-750d?notice=saved");
    assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: "wyco-750d" } })).setPart, null);
    assert.equal((await req("/api/bookings", { json: { ...booking, details: { items: [{ id: "wyco-750d", term: "daily", qty: 1 }] } }, cookie })).status, 503);
  });

  test("add-ons and generator suggestions come from the catalog", async () => {
    const catalog = await buildCatalog();
    const byId = new Map(catalog.products.map(p => [p.id as string, p]));
    assert.deepEqual(byId.get("rt40")!.addOns, ["bin", "liftingbeams", "spreaderbars", "spreaderbeams", "concrete-bottom", "concrete-side", "blockforks"]);
    assert.deepEqual(byId.get("gth844")!.addOns, ["jib", "bucket", "manbasket", "telehandler-blockfork"]);
    assert.equal(byId.get("rt40")!.needsPower, undefined);
    assert.equal(byId.get("mini-welder")!.needsPower, true);
    assert.equal(byId.get("compressor")!.needsPower, undefined); // petrol
  });

  test("admins choose which add-ons go with each item", async () => {
    const admin = await makeAdmin();
    const base = { name: "Terex RT40", spec: "40 ton", description: "Compact crane.", rate_hourly: "145", sortOrder: "30", listed: "on" };
    const post = (extra: string) =>
      app.request("/admin/catalog/rt40", {
        method: "POST",
        headers: { cookie: admin, "content-type": "application/x-www-form-urlencoded", "x-real-ip": randomUUID() },
        body: `${new URLSearchParams(base)}&${extra}`,
      });
    // Keep three of the seven, tick the power box.
    const saved = await post("addOns=blockforks&addOns=bin&addOns=liftingbeams&needsPower=on");
    assert.equal(saved.headers.get("location"), "/admin/catalog/rt40?notice=saved");
    let rt40 = await prisma.product.findUniqueOrThrow({ where: { id: "rt40" } });
    assert.deepEqual(rt40.addOns, ["bin", "liftingbeams", "blockforks"], "existing order is kept");
    assert.equal(rt40.needsPower, true);
    // The man basket only fits the National 1400H, and unknown ids are refused.
    assert.equal((await post("addOns=national-manbasket")).status, 400);
    assert.equal((await post("addOns=not-a-product")).status, 400);
    // Unticking everything means no prompt.
    await post("");
    rt40 = await prisma.product.findUniqueOrThrow({ where: { id: "rt40" } });
    assert.deepEqual(rt40.addOns, []);
    const page = await (await req("/admin/catalog/national1400", { cookie: admin })).text();
    assert.match(page, /National 1400H Man Basket/);
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
    await req("/api/bookings", { json: { ...booking, details: { ...crane, startDate: "2030-05-15" } }, cookie: admin });
    await req("/api/bookings", { json: { ...booking, customerName: "Lee Bodden", details: { ...crane, startDate: "2030-05-14" } }, cookie: admin });
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
    assert.match(page, /Account recovery email is temporarily unavailable/);
  });

  test("pages render", async () => {
    for (const path of ["/account", "/account/forgot", "/privacy"]) {
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
  test("company staff are suggested only their matching verified work domain and pool loyalty", async () => {
    const sent = captureEmails();
    const first = await req("/account/signup", { form: { name: "First Staff", email: "first@acme.ky", phone: "345 555 0100", company: "Acme Ltd", password: "longenough1" } });
    assert.equal(first.status, 302);
    let firstUser = await prisma.user.findUniqueOrThrow({ where: { email: "first@acme.ky" } });
    assert.equal(firstUser.companyAccountId, null);
    assert.equal(await prisma.company.count(), 0);
    await req(confirmPath(sent.find(m => m.to.includes("first@acme.ky"))!.text));
    firstUser = await prisma.user.findUniqueOrThrow({ where: { id: firstUser.id } });
    assert.ok(firstUser.companyAccountId);
    const suggestion = await (await req("/account/company-suggestion?email=second%40acme.ky")).json();
    assert.equal(suggestion.company, "Acme Ltd");
    const other = await (await req("/account/company-suggestion?email=intruder%40other.ky")).json();
    assert.equal(other.company, null);
    const second = await req("/account/signup", { form: { name: "Second Staff", email: "second@acme.ky", phone: "345 555 0101", company: "Acme Ltd", password: "longenough1" } });
    await req(confirmPath(sent.find(m => m.to.includes("second@acme.ky"))!.text));
    const secondUser = await prisma.user.findUniqueOrThrow({ where: { email: "second@acme.ky" } });
    assert.equal(secondUser.companyAccountId, firstUser.companyAccountId);
    const booked = await req("/api/bookings", { json: { ...booking, details: { items: [{ id: "rt40", term: "daily", qty: 1 }] } }, cookie: sessionCookie(first) });
    assert.equal(booked.status, 201);
    const saved = await prisma.booking.findFirstOrThrow();
    assert.equal(saved.companyAccountId, firstUser.companyAccountId);
    await prisma.booking.update({ where: { id: saved.id }, data: { status: "PAID", amountPaidCents: 600000 } });
    for (const cookie of [sessionCookie(first), sessionCookie(second)]) {
      const data = await (await req("/api/rewards", { cookie })).json();
      assert.equal(data.rewards.tier, "Silver");assert.equal(data.rewards.points, 6000);
    }
    const secondPage = await (await req("/account/profile", { cookie: sessionCookie(second) })).text();
    assert.doesNotMatch(secondPage, new RegExp("CCC-" + String(saved.id).padStart(5, "0")), "staff do not gain access to each other's bookings");
    const changed = await req("/account/profile", { cookie: sessionCookie(first), form: { name: "First Staff", email: "first@other.ky", company: "Other", phone: "345 555 0100" } });
    assert.equal(changed.status, 302);
    const moved = await prisma.user.findUniqueOrThrow({ where: { id: firstUser.id } });
    assert.equal(moved.companyAccountId, null);assert.equal(moved.emailVerifiedAt, null);
    assert.equal((await req("/api/bookings", { cookie: sessionCookie(first), json: booking })).status, 403, "changed work email must be verified before booking");
    const remaining = await (await req("/api/rewards", { cookie: sessionCookie(second) })).json();
    assert.equal(remaining.rewards.points, 6000, "company spend remains with the original company when staff leave");
  });

  test("existing shared companies reject unrelated emails and checkout/profile bypasses", async () => {
    await prisma.company.create({ data: { name: "Acme Ltd", nameKey: "acme", domain: "acme.ky" } });
    for (const email of ["fake@gmail.com", "fake@yahoo.com", "fake@other.ky", "fake@acme.ky.attacker.com"]) {
      const response = await req("/account/signup", { form: { name: "Intruder", email, phone: "345 555 0100", company: "Acme Ltd", password: "longenough1" } });
      assert.equal(response.status, 400, email);
    }
    const cookie = await signup();
    const profile = await req("/account/profile", { cookie, form: { name: "Kim Ebanks", email: "kim@example.com", company: "Acme Ltd", phone: "345 555 0100" } });
    assert.equal(profile.status, 400);
    await req("/api/bookings", { cookie, json: { ...booking, details: { company: "Acme Ltd", items: [] } } });
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "kim@example.com" } });
    assert.equal(user.companyAccountId, null);
    assert.equal((await prisma.booking.findFirstOrThrow()).companyAccountId, null);
  });

  test("admin company-domain mappings support trading names and company credits", async () => {
    const adminCookie = await makeAdmin();
    assert.equal((await req("/admin/companies", { cookie: adminCookie, form: { name: "Island Construction", domain: "ic.ky" } })).status, 302);
    const company = await prisma.company.findUniqueOrThrow({ where: { domain: "ic.ky" } });
    const user = await prisma.user.create({ data: { email: "staff@ic.ky", name: "Staff", company: "Island Construction", emailVerifiedAt: new Date(), passwordHash: await hashPassword("longenough1") } });
    await syncCompanyMembership(user.id);
    await req(`/admin/customers/${user.id}/credit`, { cookie: adminCookie, form: { credit: "6000" } });
    assert.equal((await prisma.company.findUniqueOrThrow({ where: { id: company.id } })).rewardCreditCents, 600000);
    assert.equal((await req("/admin/companies", { cookie: adminCookie })).status, 200);
    assert.equal((await req("/admin/companies", { form: { name: "Bad", domain: "gmail.com" }, cookie: adminCookie })).headers.get("location"), "/admin/companies?error=invalid");
  });

  test("company registration accepts @domain and displays a saved company with its email domain", async () => {
    const adminCookie = await makeAdmin();
    const response = await req("/admin/companies", { cookie: adminCookie, form: { name: "Paragon Builders", domain: "@paragon.ky" } });
    assert.equal(response.headers.get("location"), "/admin/companies?saved=1");
    assert.equal((await prisma.company.findUniqueOrThrow({ where: { domain: "paragon.ky" } })).name, "Paragon Builders");
    const page = await (await req("/admin/companies?saved=1", { cookie: adminCookie })).text();
    assert.match(page, /Company registered successfully/);assert.match(page, /Paragon Builders/);assert.match(page, /@paragon.ky/);
    const suggestion = await (await req("/account/company-suggestion?email=staff%40paragon.ky")).json();assert.equal(suggestion.company, "Paragon Builders");
    const duplicate = await req("/admin/companies", { cookie: adminCookie, form: { name: "Paragon Builders", domain: "paragon.ky" } });
    assert.equal(duplicate.headers.get("location"), "/admin/companies?error=duplicate");
    const email = await req("/admin/companies", { cookie: adminCookie, form: { name: "Other Builders", domain: "staff@otherbuilders.ky" } });assert.equal(email.headers.get("location"), "/admin/companies?saved=1");
  });

  test("unverified personal accounts cannot bypass confirmation when email delivery is unavailable", async () => {
    const response = await req("/account/signup", { form: { name: "New Customer", email: "new@gmail.com", phone: "345 555 0100", password: "longenough1" } });
    assert.equal(response.headers.get("location"), "/account/verify?notice=send-failed");
    assert.equal((await req("/api/bookings", { json: booking, cookie: sessionCookie(response) })).status, 403);
    const page = await (await req("/account")).text();assert.match(page, /Forgot username or password/);assert.match(page, /email address is your username/);
  });

  test("expired recovery links fail and concurrent reset requests cannot reuse the same token", async () => {
    await signup();const sent = captureEmails();
    await req("/account/forgot", { form: { email: "kim@example.com" } });
    const oldToken = sent.at(-1)!.text.match(/\/account\/reset\?token=([\w-]+)/)![1];
    await prisma.passwordReset.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await req(`/account/reset?token=${oldToken}`)).status, 400);
    await req("/account/forgot", { form: { email: "kim@example.com" } });
    const token = sent.at(-1)!.text.match(/\/account\/reset\?token=([\w-]+)/)![1];
    const responses = await Promise.all(["first-new-pass", "second-new-pass"].map(password => req("/account/reset", { form: { token, password } })));
    assert.deepEqual(responses.map(r => r.status).sort(), [302, 400]);
  });

  test("full trading names register shared work domains without allowing duplicate company names for that domain", async () => {
    const sent = captureEmails();
    const response = await req("/account/signup", {form:{name:"First Staff",email:"first@paragon.ky",phone:"345 555 0100",company:"Paragon Builders",password:"longenough1"}});
    assert.equal(response.status,302);assert.equal(await prisma.company.count(),0);
    const pending=await req("/account/signup", {form:{name:"Pending Staff",email:"pending@paragon.ky",phone:"345 555 0104",company:"Paragon Civil",password:"longenough1"}});
    assert.equal(pending.status,302);
    await req(confirmPath(sent.find(m=>m.to.includes("first@paragon.ky"))!.text));
    await req(confirmPath(sent.find(m=>m.to.includes("pending@paragon.ky"))!.text));
    const company=await prisma.company.findUniqueOrThrow({where:{domain:"paragon.ky"}});
    assert.equal(company.name,"Paragon Builders");assert.equal(company.ownerEmail,null);
    const second=await req("/account/signup", {form:{name:"Second Staff",email:"second@paragon.ky",phone:"345 555 0101",company:"Paragon Builders",password:"longenough1"}});
    assert.equal(second.status,302);
    await req(confirmPath(sent.find(m=>m.to.includes("second@paragon.ky"))!.text));
    const staff=await prisma.user.findMany({where:{companyAccountId:company.id}});assert.equal(staff.length,3);
    const duplicate=await req("/account/signup",{form:{name:"Third Staff",email:"third@paragon.ky",phone:"345 555 0102",company:"Duplicate Paragon",password:"longenough1"}});
    assert.equal(duplicate.status,400);assert.equal(await prisma.company.count(),1);
    for(const email of ["other@gmail.com","other@unrelated.ky"]){
      const rejected=await req("/account/signup",{form:{name:"Other Staff",email,phone:"345 555 0103",company:"Paragon Builders",password:"longenough1"}});assert.equal(rejected.status,400);
    }
  });

  test("a company without a work domain is restricted to one verified email login", async () => {
    const sent = captureEmails();
    const response = await req("/account/signup", { form: { name: "Company Owner", email: "owner@gmail.com", phone: "345 555 0100", company: "Island Repairs", password: "longenough1" } });
    assert.equal(response.status, 302);
    assert.equal(await prisma.company.count(), 0, "unverified emails cannot reserve companies");
    await req(confirmPath(sent.find(m => m.to.includes("owner@gmail.com"))!.text));
    const company = await prisma.company.findUniqueOrThrow({ where: { nameKey: "islandrepairs" } });
    assert.equal(company.domain, null);assert.equal(company.ownerEmail, "owner@gmail.com");
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: "owner@gmail.com" } });assert.equal(owner.companyAccountId, company.id);
    const joined = await req("/account/signup", { form: { name: "Other Staff", email: "other@gmail.com", phone: "345 555 0101", company: "Island Repairs", password: "longenough1" } });
    assert.equal(joined.status, 400);assert.match(await joined.text(), /limited to its registered email login/);
    const recommendation = await (await req("/account/company-suggestion?email=new%40gmail.com")).json();assert.equal(recommendation.mode, "single-email");assert.equal(recommendation.company, null);
    const booked = await req("/api/bookings", { json: booking, cookie: sessionCookie(response) });assert.equal(booked.status, 201);
    const saved = await prisma.booking.findFirstOrThrow();assert.equal(saved.companyAccountId, company.id);
    await prisma.booking.update({ where: { id: saved.id }, data: { status: "PAID", amountPaidCents: 600000 } });
    const rewards = await (await req("/api/rewards", { cookie: sessionCookie(response) })).json();assert.equal(rewards.rewards.points, 6000);
    const adminCookie = await makeAdmin();const page = await (await req("/admin/companies", { cookie: adminCookie })).text();assert.match(page,/owner@gmail.com/);assert.match(page,/one email login only/);
  });

  test("signup alerts the admin and verification sends one loyalty welcome email", async () => {
    const sent = captureEmails();
    const signup = await req("/account/signup", { form: { name: "Alex Customer", email: "alex@gmail.com", phone: "345 555 0100", company: "Alex Repairs", password: "secret-pass123" } });
    assert.equal(signup.status, 302);
    const admin = sent.find(m => m.subject.startsWith("New customer signup"))!;assert.ok(admin);assert.equal(admin.to[0],"caymancrane@gmail.com");
    for (const detail of ["Alex Customer", "alex@gmail.com", "345 555 0100", "Alex Repairs", "pending"]) assert.ok(admin.text.includes(detail));
    assert.doesNotMatch(admin.text,/secret-pass123|token=/);
    assert.equal(sent.filter(m => m.subject.startsWith("Welcome")).length, 0);
    const verify = confirmPath(sent.find(m => m.to.includes("alex@gmail.com"))!.text);
    await req(verify);
    const welcome = sent.filter(m => m.subject.startsWith("Welcome"));assert.equal(welcome.length,1);
    assert.equal(welcome[0].to[0],"alex@gmail.com");assert.match(welcome[0].text,/1 loyalty point/);
    for (const tier of ["Silver", "Gold", "Platinum", "CI$5,000", "CI$15,000", "CI$25,000"]) assert.ok(welcome[0].html!.includes(tier));
    assert.match(welcome[0].text,/limited to your verified email login/);
    assert.equal((await req(verify)).status,400);await deliverAccountEmails();assert.equal(sent.filter(m => m.subject.startsWith("Welcome")).length,1);
  });

  test("failed welcome delivery remains queued and retries without duplicate successful sends", async () => {
    const sent = captureEmails();
    await req("/account/signup", { form: { name: "Retry Customer", email: "retry@example.com", phone: "345 555 0100", password: "longenough1" } });
    const verify = confirmPath(sent.find(m => m.to.includes("retry@example.com"))!.text);
    globalThis.fetch = (async()=>new Response("unavailable",{status:503})) as typeof fetch;
    await req(verify);
    const job = await prisma.accountEmail.findFirstOrThrow({ where: { kind: "WELCOME" } });assert.equal(job.sentAt,null);assert.equal(job.attempts,1);
    const delivered = captureEmails();await prisma.accountEmail.update({ where: { id: job.id }, data: { nextAttemptAt: new Date(0) } });
    await deliverAccountEmails();assert.equal(delivered.length,1);assert.ok((await prisma.accountEmail.findUniqueOrThrow({ where:{id:job.id} })).sentAt);
    await deliverAccountEmails();assert.equal(delivered.length,1);
  });

  test("admins edit company names/domains and preserve history while rechecking linked accounts", async () => {
    const adminCookie = await makeAdmin();
    const company = await prisma.company.create({ data: { name: "Old Builders", nameKey: "oldbuilders", domain: "oldbuilders.ky" } });
    const staff = await prisma.user.create({ data: { name: "Employee", email: "staff@oldbuilders.ky", company: company.name, companyAccountId: company.id, emailVerifiedAt: new Date(), passwordHash: await hashPassword("longenough1") } });
    const rename = await req(`/admin/companies/${company.id}/update`, { cookie: adminCookie, form: { name: "New Builders", address: "@oldbuilders.ky" } });
    assert.equal(rename.headers.get("location"), "/admin/companies?updated=1&detached=0");
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: staff.id } })).company, "New Builders");
    const change = await req(`/admin/companies/${company.id}/update`, { cookie: adminCookie, form: { name: "New Builders", address: "@newbuilders.ky" } });
    assert.equal(change.headers.get("location"), "/admin/companies?updated=1&detached=1");
    const updated = await prisma.user.findUniqueOrThrow({ where: { id: staff.id } });assert.equal(updated.companyAccountId,null);assert.equal(updated.company,null);
    const suggestion = await (await req("/account/company-suggestion?email=newstaff%40newbuilders.ky")).json();assert.equal(suggestion.company,"New Builders");
    const invalid = await req(`/admin/companies/${company.id}/update`, { cookie: adminCookie, form: { name: "New Builders", address: "@gmail.com" } });assert.equal(invalid.headers.get("location"), "/admin/companies?error=invalid");
    assert.equal((await req(`/admin/companies/${company.id}/update`, { cookie: await signup(), form: { name: "Hijack", address: "@evil.ky" } })).headers.get("location"), "/account/profile?notice=not-admin");
  });

  test("single-email company edits retain one-email restriction and archived companies stay hidden", async () => {
    const adminCookie = await makeAdmin();
    const company = await prisma.company.create({ data: { name: "Small Business", nameKey: "smallbusiness", ownerEmail: "owner@gmail.com" } });
    const update = await req(`/admin/companies/${company.id}/update`, { cookie: adminCookie, form: { name: "Renamed Business", address: "newowner@gmail.com" } });assert.equal(update.status,302);
    const saved = await prisma.company.findUniqueOrThrow({ where: { id: company.id } });assert.equal(saved.ownerEmail,"newowner@gmail.com");assert.equal(saved.domain,null);
    await prisma.company.create({ data: { name: "A", nameKey: "archived-a", ownerEmail: "archived@invalid.invalid", archivedAt: new Date() } });
    const page = await (await req("/admin/companies", { cookie: adminCookie })).text();assert.doesNotMatch(page, /<h3>A<\/h3>/);assert.match(page,/Save company changes/);
    const duplicate = await req(`/admin/companies/${company.id}/update`, { cookie: adminCookie, form: { name: "Renamed Business", address: "bad email" } });assert.equal(duplicate.headers.get("location"), "/admin/companies?error=invalid");
  });

  test("property and hospitality directory preserves accounts and recommends only verified company domains", async () => {
    const directory = JSON.parse(readFileSync("data/cayman-property-hospitality-companies.json", "utf8")) as {companies: {name:string;domain:string;publishedEmail:string;categories:string[];source:string}[]};
    const sql = readFileSync("prisma/migrations/20261113120000_property_hospitality_directory/migration.sql", "utf8");
    const existing = await prisma.company.create({data:{name:"Existing Strata Manager",nameKey:"existingstratamanager",domain:"dpms.ky",rewardCreditCents:12345}});
    await prisma.$executeRawUnsafe(sql);
    assert.equal(await prisma.company.count(), directory.companies.length);
    await prisma.$executeRawUnsafe(sql);
    assert.equal(await prisma.company.count(), directory.companies.length);
    const preserved=await prisma.company.findUniqueOrThrow({where:{id:existing.id}});
    assert.equal(preserved.name,existing.name);assert.equal(preserved.rewardCreditCents,12345);
    for(const entry of directory.companies){
      assert.equal(companyEmailDomain(entry.publishedEmail),entry.domain);
      assert.ok(entry.source.startsWith("https://"));
      const suggestion=await (await req(`/account/company-suggestion?email=staff%40${entry.domain}`)).json();
      assert.equal(suggestion.company,entry.domain===existing.domain?existing.name:entry.name);
      const spoof=await (await req(`/account/company-suggestion?email=staff%40${entry.domain}.example.com`)).json();
      assert.equal(spoof.company,null);
    }
    for(const domain of ["gmail.com","candw.ky","pyramidglobal.com","ritzcarlton.com","hotelindigo.com"]){
      const suggestion=await (await req(`/account/company-suggestion?email=staff%40${domain}`)).json();
      assert.equal(suggestion.company,null);
    }
    assert.equal(await prisma.user.count(),0);
    assert.equal(await prisma.accountEmail.count(),0);
  });

  test("researched Cayman directory imports idempotently and preserves existing companies", async () => {
    const existing = await prisma.company.create({ data: { name: "Existing Climate Account", nameKey: "existingclimateaccount", domain: "ccc.ky", rewardCreditCents: 12345 } });
    const directory = JSON.parse(readFileSync("data/cayman-company-directory.json", "utf8"));
    const sql = readFileSync("prisma/migrations/20261111133000_cayman_company_directory/migration.sql", "utf8");
    await prisma.$executeRawUnsafe(sql);
    const count = await prisma.company.count();
    await prisma.$executeRawUnsafe(sql);
    assert.equal(await prisma.company.count(), count);
    assert.equal(count, directory.companies.length);
    const preserved = await prisma.company.findUniqueOrThrow({ where: { id: existing.id } });
    assert.equal(preserved.name, "Existing Climate Account");assert.equal(preserved.rewardCreditCents,12345);
    for (const entry of directory.companies) {
      const suggestion = await (await req(`/account/company-suggestion?email=staff%40${entry.domain}`)).json();
      assert.equal(suggestion.company, entry.domain === "ccc.ky" ? existing.name : entry.name);
    }
    const unrelated = await (await req("/account/company-suggestion?email=staff%40gmail.com")).json();
    assert.equal(unrelated.company, null);
  });


  const governmentDirectory = JSON.parse(readFileSync("data/government-companies.json", "utf8")) as { subCompanies: { name: string; domain: string | null; group: string }[] };
  const governmentCount = governmentDirectory.subCompanies.length;
  const expansionSQL = readFileSync("prisma/migrations/20261112100000_verified_company_directory_expansion/migration.sql", "utf8");
  async function seedGovernment() {
    const sql=readFileSync("prisma/migrations/20261112040000_government_subcompanies/migration.sql","utf8");
    await prisma.$executeRawUnsafe(sql.match(/INSERT INTO "Company"[^;]+;/)![0]);
    for(const statement of sql.matchAll(/INSERT INTO "SubCompany"[^;]+;/g))await prisma.$executeRawUnsafe(statement[0]);
    for (const statement of expansionSQL.matchAll(/(?:INSERT INTO "SubCompany"|UPDATE "SubCompany")[^;]+;/g)) await prisma.$executeRawUnsafe(statement[0]);
    return prisma.company.findUniqueOrThrow({where:{domain:"gov.ky"},include:{subCompanies:true}});
  }
  test("government directory includes all researched grouped sub-companies and suggests only matching email domains", async () => {
    const root=await seedGovernment();await seedGovernment();assert.equal(root.subCompanies.length,governmentCount);assert.equal(await prisma.subCompany.count(),governmentCount);assert.equal(root.poolSubcompanyRewards,false);
    const groups=new Set(root.subCompanies.map(s=>s.group));assert.equal(groups.size,3);
    const gov=await(await req("/account/company-suggestion?email=staff%40gov.ky")).json();assert.equal(gov.company,"Cayman Islands Government");assert.equal(gov.subCompanies.length,governmentCount);assert.equal(gov.requiresSubCompany,true);
    const nra=await(await req("/account/company-suggestion?email=staff%40nra.ky")).json();assert.equal(nra.company,root.name);assert.equal(nra.subCompanies.length,1);assert.match(nra.subCompanies[0].name,/National Roads Authority/);
    const personal=await(await req("/account/company-suggestion?email=staff%40gmail.com")).json();assert.equal(personal.company,null);
    const pwd=root.subCompanies.find(s=>s.name==="Public Works Department (PWD)")!;
    const create=(email:string,subCompanyId?:number)=>req("/account/signup",{form:{name:"Gov Staff",email,phone:"345 555 0111",password:"longenough1",company:root.name,...(subCompanyId?{subCompanyId:String(subCompanyId)}:{})}});
    assert.equal((await create("staff@gov.ky")).status,400);
    assert.equal((await req("/account/signup",{form:{name:"Gov Staff",email:"duplicate@gov.ky",phone:"345 555 0111",password:"longenough1",company:"Another Government Company"}})).status,400);
    assert.equal((await create("staff@gmail.com",pwd.id)).status,400);
    assert.equal((await create("staff@nra.ky",pwd.id)).status,400);
    assert.equal((await create("staff@gov.ky",999999)).status,400);
    const signup=await create("staff@gov.ky",pwd.id);assert.equal(signup.status,302);
    const user=await prisma.user.findUniqueOrThrow({where:{email:"staff@gov.ky"}});assert.equal(user.companyAccountId,null);assert.equal(user.subCompanyId,pwd.id);
    await syncCompanyMembership(user.id);assert.equal((await prisma.user.findUniqueOrThrow({where:{id:user.id}})).companyAccountId,null);
    await prisma.user.update({where:{id:user.id},data:{emailVerifiedAt:new Date()}});await syncCompanyMembership(user.id);assert.equal((await prisma.user.findUniqueOrThrow({where:{id:user.id}})).companyAccountId,root.id);
  });
  test("verified government domains recommend only their own units and reject unrelated membership", async () => {
    const root = await seedGovernment();
    for (const domain of new Set(governmentDirectory.subCompanies.map(s => s.domain).filter(Boolean))) {
      const suggestion = await (await req(`/account/company-suggestion?email=staff%40${domain}`)).json();
      assert.equal(suggestion.company, root.name, String(domain));
      assert.deepEqual(suggestion.subCompanies.map((s: {name: string}) => s.name).sort(), governmentDirectory.subCompanies.filter(s => s.domain === domain).map(s => s.name).sort());
    }
    const rcips = root.subCompanies.find(s => s.domain === "rcips.ky")!;
    const pwd = root.subCompanies.find(s => s.name === "Public Works Department (PWD)")!;
    const signup = (email: string, id: number) => req("/account/signup", {form: {name:"Police Staff",email,phone:"345 555 0111",password:"longenough1",company:root.name,subCompanyId:String(id)}});
    assert.equal((await signup("staff@rcips.ky", pwd.id)).status,400);
    assert.equal((await signup("staff@rcips.ky.evil.com", rcips.id)).status,400);
    assert.equal((await signup("staff@gmail.com", rcips.id)).status,400);
    assert.equal((await signup("staff@rcips.ky", rcips.id)).status,302);
    const user = await prisma.user.update({where:{email:"staff@rcips.ky"},data:{emailVerifiedAt:new Date()}});
    await syncCompanyMembership(user.id);
    assert.equal((await prisma.user.findUniqueOrThrow({where:{id:user.id}})).companyAccountId,root.id);
    const foreign = await (await req("/account/company-suggestion?email=unrelated%40fcdo.gov.uk")).json();
    assert.equal(foreign.company,null);
  });
  test("Cayman business expansion preserves existing company ownership and matches each verified domain", async () => {
    const directory = JSON.parse(readFileSync("data/cayman-pool-logistics-transport-companies.json", "utf8")) as {companies: {name:string;domain:string;publishedEmail:string}[]};
    const sql = expansionSQL.match(/INSERT INTO "Company"[^;]+;/)![0];
    const first = directory.companies[0];
    const existing = await prisma.company.create({data:{name:"Existing Pool Account",nameKey:"existingpoolaccount",domain:first.domain,rewardCreditCents:9876}});
    await prisma.$executeRawUnsafe(sql);await prisma.$executeRawUnsafe(sql);
    assert.equal(await prisma.company.count(),directory.companies.length);
    const preserved = await prisma.company.findUniqueOrThrow({where:{id:existing.id}});
    assert.equal(preserved.name,existing.name);assert.equal(preserved.rewardCreditCents,9876);
    for (const entry of directory.companies) {
      assert.equal(companyEmailDomain(entry.publishedEmail),entry.domain);
      const suggestion = await (await req(`/account/company-suggestion?email=staff%40${entry.domain}`)).json();
      assert.equal(suggestion.company,entry.domain===first.domain?existing.name:entry.name);
    }
    assert.equal((await (await req("/account/company-suggestion?email=staff%40candw.ky")).json()).company,null);
  });
  test("government loyalty and credits stay with each sub-company and bookings keep their original department", async () => {
    const root=await seedGovernment();const pwd=root.subCompanies.find(s=>s.name==="Public Works Department (PWD)")!,planning=root.subCompanies.find(s=>s.name==="Department of Planning")!;
    const staff=async(email:string,id:number)=>{const response=await req("/account/signup",{form:{name:"Gov Staff",email,phone:"345 555 0111",password:"longenough1",company:root.name,subCompanyId:String(id)}});assert.equal(response.status,302);const user=await prisma.user.update({where:{email},data:{emailVerifiedAt:new Date()}});await syncCompanyMembership(user.id);return{user,cookie:sessionCookie(response)}};
    const one=await staff("one@gov.ky",pwd.id),two=await staff("two@gov.ky",pwd.id),other=await staff("other@gov.ky",planning.id);
    const historical=(userId:number,subCompanyId:number,amountPaidCents:number)=>prisma.booking.create({data:{customerName:"Gov Staff",customerEmail:"staff@gov.ky",requestText:"Old request",termsText:"Terms",signature:"Gov Staff",initials:"GS",agreedToTerms:true,paymentAck:true,userId,companyAccountId:root.id,subCompanyId,status:"PAID",amountPaidCents}});
    await queueWelcomeEmail(one.user.id,"http://localhost");const welcome=await prisma.accountEmail.findUniqueOrThrow({where:{key:`welcome-${one.user.id}`}});assert.equal((welcome.payload as {companyMode:string}).companyMode,"sub-company");assert.match((welcome.payload as {company:string}).company,/Public Works Department/);
    const old=await historical(one.user.id,pwd.id,600000);await historical(other.user.id,planning.id,200000);
    const points=async(cookie:string)=>(await(await req("/api/rewards",{cookie})).json()).rewards.points;
    assert.equal(await points(one.cookie),6000);assert.equal(await points(two.cookie),6000);assert.equal(await points(other.cookie),2000);
    const admin=await makeAdmin();await req(`/admin/customers/${one.user.id}/credit`,{cookie:admin,form:{credit:"100"}});
    assert.equal((await prisma.subCompany.findUniqueOrThrow({where:{id:pwd.id}})).rewardCreditCents,10000);assert.equal(await points(two.cookie),6100);assert.equal(await points(other.cookie),2000);
    await req("/api/bookings",{cookie:one.cookie,json:{...booking,details:{company:"Wrong client label",items:[{id:"rt40",term:"daily",qty:1}]}}});
    const latest=await prisma.booking.findFirstOrThrow({where:{userId:one.user.id,status:"PENDING"}});assert.equal(latest.subCompanyId,pwd.id);assert.equal(latest.companyAccountId,root.id);assert.match(latest.company!,/Public Works Department/);
    await req("/account/profile",{cookie:one.cookie,form:{name:"Gov Staff",email:"one@gov.ky",phone:"345 555 0111",company:root.name,subCompanyId:String(planning.id)}});
    assert.equal(await points(one.cookie),2000);assert.equal(await points(two.cookie),6100);assert.equal((await prisma.booking.findUniqueOrThrow({where:{id:old.id}})).subCompanyId,pwd.id);
    const parentPage=await(await req("/admin/companies",{cookie:admin})).text();assert.ok(parentPage.includes(`${governmentCount} sub-companies`));assert.match(parentPage,/Separate loyalty points/);
    const renamed=await req(`/admin/companies/${root.id}/sub-companies/${pwd.id}/update`,{cookie:admin,form:{name:"Public Works Department - Updated",domain:""}});assert.equal(renamed.status,302);assert.equal((await prisma.subCompany.findUniqueOrThrow({where:{id:pwd.id}})).name,"Public Works Department - Updated");
    assert.equal((await req(`/admin/companies/${root.id}/sub-companies/${pwd.id}/update`,{cookie:two.cookie,form:{name:"Hijack",domain:"gmail.com"}})).status,302);
  });

  test("company A removal preserves history and releases its domain", async () => {
    const company = await prisma.company.create({ data: { name: "A", nameKey: "a", domain: "a.ky", rewardCreditCents: 25000 } });
    const user = await prisma.user.create({ data: { name: "Account Owner", email: "owner@a.ky", company: "A", companyAccountId: company.id, emailVerifiedAt: new Date(), passwordHash: await hashPassword("longenough1") } });
    const historic = await prisma.booking.create({ data: { customerName: user.name, customerEmail: user.email, requestText: "Old booking", termsText: "Terms", signature: user.name, initials: "AO", agreedToTerms: true, paymentAck: true, userId: user.id, companyAccountId: company.id } });
    const sql = readFileSync("prisma/migrations/20261111103000_company_edit_and_remove_a/migration.sql", "utf8");
    for (const statement of sql.slice(sql.indexOf('UPDATE "User"')).split(';').map(s => s.trim()).filter(Boolean)) await prisma.$executeRawUnsafe(statement);
    const archived = await prisma.company.findUniqueOrThrow({ where: { id: company.id } });assert.ok(archived.archivedAt);assert.equal(archived.rewardCreditCents,25000);
    assert.equal((archived.archivedDetails as { domain: string }).domain,"a.ky");assert.equal(await prisma.company.findUnique({ where: { domain:"a.ky" } }),null);
    assert.equal((await prisma.booking.findUniqueOrThrow({ where: { id: historic.id } })).companyAccountId,company.id);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).companyAccountId,null);
  });

});
