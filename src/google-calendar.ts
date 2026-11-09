import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { prisma } from "./db.js";
import { bookingRef } from "./bookings.js";
import type { Booking } from "./generated/prisma/client.js";
import type { PricedLine } from "./catalog.js";

export const GOOGLE_CALENDAR_EMAIL = "caymancrane@gmail.com";
export const googleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.PUBLIC_URL);
export const googleRedirectUri = () => `${process.env.PUBLIC_URL!.replace(/\/$/, "")}/admin/google-calendar/callback`;
export function encryptRefreshToken(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", createHash("sha256").update(process.env.GOOGLE_CLIENT_SECRET!).digest(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map(b => b.toString("base64url")).join(".");
}
function decryptRefreshToken(value: string): string {
  const [iv, tag, data] = value.split(".").map(v => Buffer.from(v, "base64url"));
  const cipher = createDecipheriv("aes-256-gcm", createHash("sha256").update(process.env.GOOGLE_CLIENT_SECRET!).digest(), iv);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(data), cipher.final()]).toString("utf8");
}
export async function googleToken(params: Record<string, string>): Promise<{ access_token: string; refresh_token?: string }> {
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ ...params, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET! }), signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error("Google authorization needs to be reconnected.");
  const data = await r.json() as { access_token: string; refresh_token?: string };
  if (!data.access_token) throw new Error("Google did not return an access token.");
  return data;
}
const date = (d: Date) => d.toISOString().slice(0, 10);
export function bookingGoogleEvent(b: Booking, baseUrl: string) {
  if (["CANCELLED", "DECLINED"].includes(b.status)) return null;
  const start = b.scheduleStart ?? b.startDate;
  if (!start) return null; // No invented dates for bookings awaiting scheduling.
  const last = b.scheduleStart ? (b.scheduleEnd ?? start) : start;
  const end = new Date(Math.max(start.getTime(), last.getTime()) + 86400000);
  const items = Array.isArray(b.items) ? b.items as unknown as PricedLine[] : [];
  return {
    summary: `${bookingRef(b.id)} · ${b.customerName} · ${b.status === "PENDING" ? "Pending" : "Confirmed"}`,
    description: [
      b.scheduleStart ? "Confirmed rental dates." : "Requested date — rental dates not confirmed.",
      `Status: ${b.status}`, `Customer: ${b.customerName}`, `Email: ${b.customerEmail}`,
      ...(b.phone ? [`Phone: ${b.phone}`] : []), ...(b.startTime ? [`Requested start time: ${b.startTime} (Cayman)`] : []),
      ...items.map(i => `${i.name} · ${i.term} × ${i.qty}`),
      `Booking details: ${baseUrl.replace(/\/$/, "")}/admin/bookings/${b.id}`,
    ].join("\n"),
    location: [b.siteAddress, b.area].filter(Boolean).join(", "),
    start: { date: date(start) }, end: { date: date(end) },
    status: b.status === "PENDING" ? "tentative" : "confirmed",
    extendedProperties: { private: { cccBookingId: String(b.id), cccSource: baseUrl } },
  };
}
export const googleBookingEventId = (id: number, baseUrl: string) => "ccc" + createHash("sha256").update(`${baseUrl}|${id}`).digest("hex");
type Synced = Record<string, { id: string; hash: string }>;
let syncing = false;
export async function syncGoogleCalendar(): Promise<void> {
  if (syncing || !googleConfigured()) return;
  syncing = true;
  try {
    const link = await prisma.googleCalendarLink.findUnique({ where: { id: 1 } });
    if (!link?.encryptedToken) return;
    const token = await googleToken({ grant_type: "refresh_token", refresh_token: decryptRefreshToken(link.encryptedToken) });
    const base = process.env.PUBLIC_URL!.replace(/\/$/, "");
    const endpoint = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_EMAIL)}/events`;
    const request = (url: string, method: string, body?: unknown) => fetch(url + "?sendUpdates=none", { method, headers: { authorization: `Bearer ${token.access_token}`, "content-type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
    const previous = link.events as Synced;
    const next: Synced = { ...previous };
    const bookings = await prisma.booking.findMany();
    const active = new Set<string>();
    for (const b of bookings) {
      const event = bookingGoogleEvent(b, base);
      if (!event) continue;
      const key = String(b.id); active.add(key);
      const hash = createHash("sha256").update(JSON.stringify(event)).digest("hex");
      if (previous[key]?.hash === hash) continue;
      const id = googleBookingEventId(b.id, base);
      let r = await request(`${endpoint}/${id}`, "PUT", event);
      if ([404, 410].includes(r.status)) {
        r = await request(endpoint, "POST", { id, ...event });
        if (r.status === 409) r = await request(`${endpoint}/${id}`, "PUT", event);
      }
      if (!r.ok) throw new Error(`Google Calendar sync failed (HTTP ${r.status}).`);
      next[key] = { id, hash };
      // Persist progress so retries do not recreate events after partial failures.
      await prisma.googleCalendarLink.update({ where: { id: 1 }, data: { events: next } });
    }
    for (const [key, old] of Object.entries(previous)) {
      if (active.has(key)) continue;
      const r = await request(`${endpoint}/${old.id}`, "DELETE");
      if (!r.ok && ![404, 410].includes(r.status)) throw new Error(`Google Calendar removal failed (HTTP ${r.status}).`);
      delete next[key];
      await prisma.googleCalendarLink.update({ where: { id: 1 }, data: { events: next } });
    }
    await prisma.googleCalendarLink.update({ where: { id: 1 }, data: { lastSyncedAt: new Date(), lastError: null } });
  } catch (error) {
    const message = error instanceof Error && error.message.startsWith("Google ") ? error.message : "Calendar sync could not finish. Try syncing again or reconnect Google.";
    await prisma.googleCalendarLink.updateMany({ where: { id: 1 }, data: { lastError: message } }).catch(() => {});
    console.error(message);
  } finally { syncing = false; }
}
export function startGoogleCalendarSync() {
  void syncGoogleCalendar();
  return setInterval(() => { void syncGoogleCalendar(); }, 60000).unref();
}
