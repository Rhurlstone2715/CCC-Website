import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono, type Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { fileURLToPath } from "node:url";
import { prisma } from "./db.js";
import { bookingRef, parseBooking, sendBookingAlert } from "./bookings.js";

const publicDir = fileURLToPath(new URL("../public", import.meta.url));
const app = new Hono();

app.use(secureHeaders());
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

// Photos and load charts rarely change; pages, code and API responses always revalidate.
app.use("/*", async (c, next) => {
  await next();
  if (c.res.status === 200 || c.res.status === 206) {
    c.header("Cache-Control", c.req.path.startsWith("/assets/") ? "public, max-age=86400" : "no-cache");
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

// Customer accounts and the admin area haven't been rebuilt yet.
for (const path of ["/account", "/account/*", "/admin", "/admin/*"]) {
  app.get(path, serveStatic({ root: publicDir, path: "account.html" }));
}

// Rewards need customer accounts. Until those exist everyone is signed out,
// which the page already handles by hiding rewards pricing.
app.get("/api/rewards", c => c.json({ error: "Sign in to view rewards." }, 401));

// Simple per-IP limit on booking submissions. Rejected requests fall back to
// the page's prepared email, so nobody loses a booking to this.
const recentBookings = new Map<string, number[]>();
const BOOKING_WINDOW_MS = 15 * 60 * 1000;
const BOOKINGS_PER_WINDOW = 5;

function clientIp(c: Context): string {
  return c.req.header("x-real-ip") || c.req.header("x-forwarded-for")?.split(",")[0].trim() || getConnInfo(c).remote.address || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recentBookings.get(ip) ?? []).filter(t => now - t < BOOKING_WINDOW_MS);
  if (hits.length >= BOOKINGS_PER_WINDOW) return true;
  hits.push(now);
  recentBookings.set(ip, hits);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of recentBookings) if (hits.every(t => now - t >= BOOKING_WINDOW_MS)) recentBookings.delete(ip);
}, BOOKING_WINDOW_MS).unref();

app.post("/api/bookings", bodyLimit({ maxSize: 256 * 1024, onError: c => c.json({ error: "Booking request is too large." }, 413) }), async c => {
  if (rateLimited(clientIp(c))) return c.json({ error: "Too many booking requests. Please try again later." }, 429);

  const input = parseBooking(await c.req.json().catch(() => null));
  if ("error" in input) return c.json(input, 400);

  const booking = await prisma.booking.create({ data: input });
  const ref = bookingRef(booking.id);

  // The page only shows "booking sent" on a 2xx. If Cayman Crane can't be
  // alerted, answer 503 so the customer is offered the prepared email instead.
  if (!(await sendBookingAlert(booking))) {
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

const port = Number(process.env.PORT) || 3000;
const server = serve({ fetch: app.fetch, port }, info => console.log(`Listening on port ${info.port}`));

function shutdown() {
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
