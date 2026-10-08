import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { fileURLToPath } from "node:url";
import { type AppEnv, currentUser, sameOriginWrites } from "./auth.js";
import { bookingRef, parseBooking, sendBookingAlert } from "./bookings.js";
import { catalogScript, priceItems } from "./catalog.js";
import { prisma } from "./db.js";
import type { Prisma } from "./generated/prisma/client.js";
import { clientIp, createLimiter } from "./ratelimit.js";
import { rewardsForUser } from "./rewards.js";
import { account } from "./routes/account.js";
import { admin } from "./routes/admin.js";
import { adminCalendar } from "./routes/admin-calendar.js";
import { adminCatalog } from "./routes/admin-catalog.js";
import { PrivacyPage } from "./views/privacy.js";

const publicDir = fileURLToPath(new URL("../public", import.meta.url));
export const app = new Hono<AppEnv>();

// The default "no-referrer" makes browsers send "Origin: null" on form posts,
// which hides where a request came from; use the browsers' standard policy.
app.use(secureHeaders({ referrerPolicy: "strict-origin-when-cross-origin" }));
app.use(sameOriginWrites);

// "/rentals/" would break the page's relative asset paths, so send it to "/rentals".
// The Location is relative so it stays on https behind Railway's proxy, and
// leading slashes are collapsed so "//other.site/" can't become an off-site redirect.
app.use(async (c, next) => {
  await next();
  const { path, method } = c.req;
  if (c.res.status === 404 && (method === "GET" || method === "HEAD") && path !== "/" && path.endsWith("/")) {
    c.res = c.redirect(`/${path.replace(/^\/+|\/+$/g, "")}${new URL(c.req.url).search}`, 301);
  }
});

// Uploads never change (a new upload gets a new URL); photos and load charts
// rarely do; public pages and code always revalidate; anything personal
// (accounts, admin, API) is never stored by the browser or proxies.
app.use("/*", async (c, next) => {
  await next();
  const path = c.req.path;
  if (/^\/(account|admin|api)(\/|$)/.test(path)) c.header("Cache-Control", "private, no-store");
  else if (c.res.status === 200 || c.res.status === 206) {
    c.header(
      "Cache-Control",
      path.startsWith("/uploads/") ? "public, max-age=31536000, immutable" : path.startsWith("/assets/") ? "public, max-age=86400" : "no-cache",
    );
  }
});

app.get("/healthz", async c => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({ ok: true });
  } catch (error) {
    console.error("Health check failed", error);
    return c.json({ ok: false }, 503);
  }
});

// The rentals page lives at /rentals, matching the original site's URLs.
app.get("/", c => c.redirect(`/rentals${new URL(c.req.url).search}`));
app.get("/index.html", c => c.redirect("/", 301));
app.get("/rentals.html", c => c.redirect("/rentals", 301));
app.get("/rentals", serveStatic({ root: publicDir, path: "rentals.html" }));

app.get("/privacy", async c => c.html(<PrivacyPage user={await currentUser(c)} />));

// The rentals page loads this before app.js to get the current catalog.
app.get("/catalog.js", async c => {
  c.header("Content-Type", "text/javascript; charset=utf-8");
  return c.body(await catalogScript());
});

// Images and load charts uploaded in the admin catalog editor.
app.get("/uploads/:id{[a-z0-9]+}", async c => {
  const upload = await prisma.upload.findUnique({ where: { id: c.req.param("id") } });
  if (!upload) return c.notFound();
  c.header("Content-Type", upload.contentType);
  c.header("Content-Length", String(upload.size));
  return c.body(new Uint8Array(upload.data));
});

app.route("/account", account);
app.route("/admin/catalog", adminCatalog);
app.route("/admin/calendar", adminCalendar);
app.route("/admin", admin);

// The rentals page calls this on load. Signed-out visitors get a 401 and see
// standard pricing; signed-in customers get their tier, which the cart uses to
// apply their discount, plus their details to prefill the checkout.
app.get("/api/rewards", async c => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: "Sign in to view rewards." }, 401);
  const rewards = await rewardsForUser(user.id);
  return c.json({
    rewards: {
      tier: rewards.tier,
      discountPercent: rewards.discountPercent,
      nextTier: rewards.nextTier,
      amountToNextCents: rewards.amountToNextCents,
      points: rewards.points,
    },
    profile: { name: user.name, email: user.email, phone: user.phone, company: user.company },
  });
});

// Rejected requests fall back to the page's prepared email, so nobody loses a booking to this.
const bookingsByIp = createLimiter(5, 15 * 60_000);

app.post("/api/bookings", bodyLimit({ maxSize: 256 * 1024, onError: c => c.json({ error: "Booking request is too large." }, 413) }), async c => {
  if (bookingsByIp(clientIp(c))) return c.json({ error: "Too many booking requests. Please try again later." }, 429);

  const input = parseBooking(await c.req.json().catch(() => null));
  if ("error" in input) return c.json(input, 400);

  // Bookings made while logged in count toward rewards. The tier is recorded
  // from the server's own numbers so Cayman Crane can check any discount shown.
  const user = await currentUser(c);
  const rewards = user ? await rewardsForUser(user.id) : null;
  const discountPercent = rewards?.discountPercent ?? 0;
  // Lines are priced from the catalog here, not taken from the page, so the
  // stored estimate reflects the prices in effect when the booking was made.
  const { details, ...fields } = input;
  const priced = details.items.length ? await priceItems(details.items, discountPercent) : null;
  const booking = await prisma.booking.create({
    data: {
      ...fields,
      userId: user?.id,
      rewardTier: rewards?.tier,
      discountPercent,
      phone: details.phone,
      company: details.company,
      startDate: details.startDate,
      startTime: details.startTime,
      area: details.area,
      siteAddress: details.siteAddress,
      items: priced ? (priced.lines as unknown as Prisma.InputJsonValue) : undefined,
      estimateCents: priced?.estimateCents ?? null,
    },
  });
  const ref = bookingRef(booking.id);

  // The page only shows "booking sent" on a 2xx. If Cayman Crane can't be
  // alerted, answer 503 so the customer is offered the prepared email instead.
  if (!(await sendBookingAlert(booking, user))) {
    return c.json({ saved: true, bookingId: ref, error: "Booking saved, but the alert email could not be sent." }, 503);
  }
  await prisma.booking.update({ where: { id: booking.id }, data: { alertSentAt: new Date() } });
  return c.json({ ok: true, bookingId: ref }, 201);
});

app.use("/*", serveStatic({ root: publicDir }));

app.notFound(c => c.text("Not found", 404));
app.onError((error, c) => {
  console.error(error);
  return c.req.path.startsWith("/api/") ? c.json({ error: "Something went wrong." }, 500) : c.text("Something went wrong.", 500);
});
