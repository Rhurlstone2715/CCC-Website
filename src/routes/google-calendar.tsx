import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { randomBytes } from "node:crypto";
import { type AppEnv, currentUser, requireAdmin } from "../auth.js";
import { prisma } from "../db.js";
import { GOOGLE_CALENDAR_EMAIL, googleConfigured, googleRedirectUri, googleToken, encryptRefreshToken, syncGoogleCalendar } from "../google-calendar.js";
import { AdminPage, pendingCount } from "../views/admin-page.js";

export const googleCalendar = new Hono<AppEnv>();
googleCalendar.use("*", requireAdmin);
const path = "/admin/google-calendar";
const COOKIE = "ccc_google_oauth_state";
const options = { path, httpOnly: true, secure: true, sameSite: "Lax" as const, maxAge: 600 };

googleCalendar.get("/", async c => {
  const link = await prisma.googleCalendarLink.findUnique({ where: { id: 1 } });
  return c.html(<AdminPage title="Google Calendar" user={(await currentUser(c))!} pending={await pendingCount()} active="calendar">
    <div class="page-head"><h1>Google Calendar</h1><p class="lede">Sync bookings to the main {GOOGLE_CALENDAR_EMAIL} calendar.</p></div>
    <section class="card">
      {c.req.query("notice") === "failed" ? <p role="alert">Google could not be connected. Use caymancrane@gmail.com and allow calendar access, then try again.</p> : null}
      {link?.encryptedToken ? <>
        <p>Connected to {link.email}.</p>
        <p>{link.lastSyncedAt ? `Last synced: ${link.lastSyncedAt.toLocaleString("en-US", { timeZone: "America/Cayman" })} (Cayman time).` : "The first sync is starting."}</p>
        {link.lastError ? <p role="alert">{link.lastError}</p> : null}
        <form method="post" action={`${path}/sync`}><button class="button primary" type="submit">Sync now</button></form>
        <form method="post" action={`${path}/disconnect`} class="mt-3"><button class="button secondary" type="submit">Disconnect Google Calendar</button></form>
      </> : googleConfigured() ? <form method="post" action={`${path}/connect`}><button class="button primary" type="submit">Connect caymancrane@gmail.com</button></form> : <>
        <h2>One-time Google setup needed</h2>
        <p>The website needs its own Google authorization before it can sync automatically.</p>
        <p>Enable the Google Calendar API in Google Cloud and create a Web application OAuth client. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the Railway service variables. Keep the client secret in Railway, not in chat.</p>
        <p>Authorized redirect URI: <code>https://www.caymancrane.com/admin/google-calendar/callback</code></p>
        <p>Add {GOOGLE_CALENDAR_EMAIL} as a test user if needed. For lasting automatic sync, put the OAuth app in production; Google's testing mode expires authorizations after seven days.</p>
        <p>Then return here and select Connect.</p>
      </>}
      <p>Existing and new dated bookings sync automatically about once a minute. Pending bookings are marked tentative. Changes to dates and details update the same event; cancelled, declined and deleted bookings are removed. Bookings without a date appear once scheduled.</p>
      <p>Rentals appear as all-day entries covering their booking dates. Any requested start time is included in the event details. Other events in your calendar are left alone.</p>
      <a class="text-link" href="/admin/calendar">Back to booking calendar</a>
    </section>
  </AdminPage>);
});
googleCalendar.post("/connect", c => {
  if (!googleConfigured()) return c.redirect(path);
  const state = randomBytes(32).toString("base64url");
  setCookie(c, COOKIE, state, options);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: googleRedirectUri(), response_type: "code", scope: "openid email https://www.googleapis.com/auth/calendar.events.owned", access_type: "offline", prompt: "consent", login_hint: GOOGLE_CALENDAR_EMAIL, state }).toString();
  return c.redirect(url.toString());
});
googleCalendar.get("/callback", async c => {
  const expected = getCookie(c, COOKIE);
  deleteCookie(c, COOKIE, options);
  if (!googleConfigured() || !expected || c.req.query("state") !== expected || !c.req.query("code")) return c.text("Invalid or expired Google authorization. Start again from the calendar connection page.", 400);
  try {
    const token = await googleToken({ grant_type: "authorization_code", code: c.req.query("code")!, redirect_uri: googleRedirectUri() });
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("User lookup failed");
    const profile = await response.json() as { email?: string; email_verified?: boolean };
    if (profile.email?.toLowerCase() !== GOOGLE_CALENDAR_EMAIL || !profile.email_verified || !token.refresh_token) throw new Error("Wrong Google account or missing offline authorization");
    const encryptedToken = encryptRefreshToken(token.refresh_token);
    await prisma.googleCalendarLink.upsert({ where: { id: 1 }, create: { id: 1, email: GOOGLE_CALENDAR_EMAIL, encryptedToken }, update: { email: GOOGLE_CALENDAR_EMAIL, encryptedToken, lastError: null } });
    void syncGoogleCalendar();
    return c.redirect(path);
  } catch { return c.redirect(`${path}?notice=failed`); }
});
googleCalendar.post("/sync", c => { void syncGoogleCalendar(); return c.redirect(path); });
googleCalendar.post("/disconnect", async c => {
  await prisma.googleCalendarLink.updateMany({ where: { id: 1 }, data: { encryptedToken: "", lastError: null } });
  return c.redirect(path);
});
