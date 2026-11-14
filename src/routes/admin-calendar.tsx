import { allocations, peak, rentalHours } from "../availability.js";
import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { type AppEnv, currentUser, requireAdmin } from "../auth.js";
import { bookingRef } from "../bookings.js";
import type { PricedLine } from "../catalog.js";
import { prisma } from "../db.js";
import type { Booking, BookingStatus } from "../generated/prisma/client.js";
import { AdminPage, pendingCount } from "../views/admin-page.js";
import { STATUS_LABELS } from "../views/layout.js";

export const adminCalendar = new Hono<AppEnv>();
adminCalendar.use("*", requireAdmin);

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVE: BookingStatus[] = ["PENDING", "APPROVED", "PAID"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Calendar dates are handled as UTC midnights, matching how @db.Date columns come back.
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY_MS);

function caymanToday(): Date {
  // Cayman is UTC-5 all year.
  return new Date(`${new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10)}T00:00:00Z`);
}

function monthStart(param: string | undefined): Date {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const d = new Date(`${param}-01T00:00:00Z`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const today = caymanToday();
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
}

const monthParam = (d: Date) => d.toISOString().slice(0, 7);
const monthLabel = (d: Date) => d.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const shortDate = (d: Date) => d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

type Entry = { booking: Booking; confirmed: boolean; clash: string[] };

export function bookingSpan(b: Pick<Booking, "scheduleStart" | "scheduleEnd" | "startDate" | "startTime" | "items">): { start: Date; end: Date } | null {
  const start = b.scheduleStart ?? b.startDate;
  if (!start) return null;
  const lines=Array.isArray(b.items)?b.items as unknown as PricedLine[]:[];
  const durations=lines.filter(l=>!l.operator).map(l=>rentalHours(l.term,l.qty));
  const hours=durations.length?Math.max(...durations):24;
  const end = b.scheduleStart ? (b.scheduleEnd ?? b.scheduleStart) : new Date(start.getTime()+Math.floor((Number((b.startTime??'00:00').slice(0,2))+hours-0.001)/24)*DAY_MS);
  return { start, end: end < start ? start : end };
}

function equipmentIds(b: Booking): string[] {
  const lines = (b.items ?? []) as unknown as PricedLine[];
  return [...new Set(lines.filter(l => !l.operator).map(l => l.id))];
}

const EntryLink: FC<{ entry: Entry }> = ({ entry }) => {
  const b = entry.booking;
  const lines = (b.items ?? []) as unknown as PricedLine[];
  const title = [
    `${bookingRef(b.id)} · ${STATUS_LABELS[b.status].admin}${entry.confirmed ? "" : " · requested date, not confirmed"}`,
    ...lines.filter(l => !l.operator).map(l => l.name),
    ...entry.clash.map(c => `Clash: ${c}`),
  ].join("\n");
  return (
    <a
      href={`/admin/bookings/${b.id}`}
      class={`cal-entry cal-${b.status.toLowerCase()}${entry.confirmed ? "" : " cal-requested"}${entry.clash.length ? " cal-clash" : ""}`}
      title={title}
    >
      {entry.clash.length ? <span aria-label="Clash">⚠ </span> : null}
      <b>{bookingRef(b.id).replace("CCC-", "")}</b> {b.customerName}
    </a>
  );
};

adminCalendar.get("/", async c => {
  const user = (await currentUser(c))!;
  const month = monthStart(c.req.query("month"));
  const nextMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
  const prevMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1));
  const gridStart = addDays(month, -month.getUTCDay());
  const monthEnd = addDays(nextMonth, -1);
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getUTCDay());

  const [pending, bookings, undated] = await Promise.all([
    pendingCount(),
    prisma.booking.findMany({
      where: {
        status: { in: ACTIVE },
        OR: [
          { scheduleStart: { lte: gridEnd }, scheduleEnd: { gte: gridStart } },
          { scheduleStart: { gte: gridStart, lte: gridEnd }, scheduleEnd: null },
          { scheduleStart: null, startDate: { lte: gridEnd } },
        ],
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.booking.findMany({
      where: { status: { in: ["PENDING", "APPROVED"] }, scheduleStart: null, startDate: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  // Lay bookings out by day.
  const days = new Map<string, Entry[]>();
  for (const booking of bookings) {
    const span = bookingSpan(booking);
    if (!span) continue;
    for (let d = span.start < gridStart ? gridStart : span.start; d <= span.end && d <= gridEnd; d = addDays(d, 1)) {
      const key = dayKey(d);
      days.set(key, [...(days.get(key) ?? []), { booking, confirmed: Boolean(booking.scheduleStart), clash: [] }]);
    }
  }

  // A clash is more bookings on a day than there are units of a piece of equipment.
  const ids = [...new Set(bookings.flatMap(equipmentIds))];
  const products = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, availableQuantity: true, operatorService:true } });
  const allocationMap=new Map(products.map(p=>[p.id,p]));
  const units = new Map(products.map(p => [p.id, { name: p.name, qty: p.availableQuantity ?? 1 }]));
  const clashes: { day: string; name: string; count: number; qty: number }[] = [];
  for (const [day, entries] of days) {
    const counts = new Map<string, Entry[]>();
    for (const entry of entries) for (const id of equipmentIds(entry.booking)) counts.set(id, [...(counts.get(id) ?? []), entry]);
    for (const [id, using] of counts) {
      const unit = units.get(id);
      const dayStart=Date.parse(`${day}T00:00:00-05:00`),dayEnd=dayStart+DAY_MS;
      const count=peak(using.flatMap(e=>allocations((e.booking.items??[]) as unknown as PricedLine[],e.booking,allocationMap)).filter(r=>r.id===id&&r.start<dayEnd&&r.end>dayStart).map(r=>({...r,start:Math.max(dayStart,r.start),end:Math.min(dayEnd,r.end)})));
      if (!unit || count <= unit.qty) continue;
      const label = `${unit.name}: ${count} units requested, ${unit.qty} available`;
      for (const entry of using) if (!entry.clash.includes(label)) entry.clash.push(label);
      if (new Date(`${day}T00:00:00Z`) >= month && new Date(`${day}T00:00:00Z`) <= monthEnd) clashes.push({ day, name: unit.name, count, qty: unit.qty });
    }
  }

  const today = dayKey(caymanToday());
  const weeks: Date[][] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 7)) weeks.push(Array.from({ length: 7 }, (_, i) => addDays(d, i)));
  const monthDays = weeks.flat().filter(d => d >= month && d <= monthEnd && days.has(dayKey(d)));

  return c.html(
    <AdminPage title="Calendar" user={user} pending={pending} active="calendar">
      <p><a class="text-link" href="/admin/google-calendar">Connect Google Calendar</a></p>
      <div class="page-head">
        <p class="eyebrow">Admin</p>
        <h1>Calendar</h1>
        <p class="lede">
          Bookings on their confirmed rental dates, or on the requested start date (dashed) until you confirm dates on the booking.
        </p>
      </div>
      <nav class="cal-nav" aria-label="Month">
        <a class="button secondary small" href={`/admin/calendar?month=${monthParam(prevMonth)}`}>
          ← {monthLabel(prevMonth).split(" ")[0]}
        </a>
        <h2>{monthLabel(month)}</h2>
        <a class="button secondary small" href={`/admin/calendar?month=${monthParam(nextMonth)}`}>
          {monthLabel(nextMonth).split(" ")[0]} →
        </a>
        <a class="text-link" href="/admin/calendar">
          Today
        </a>
      </nav>
      {clashes.length ? (
        <div class="notice notice-error" role="status">
          <p>
            <b>Possible clashes this month</b>
          </p>
          <ul class="clash-list">
            {clashes.map(cl => (
              <li>
                {shortDate(new Date(`${cl.day}T00:00:00Z`))}: {cl.name}, {cl.count} units requested for {cl.qty} available
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ul class="cal-legend" aria-label="Key">
        <li>
          <span class="cal-entry cal-pending">Pending</span>
        </li>
        <li>
          <span class="cal-entry cal-approved">Approved</span>
        </li>
        <li>
          <span class="cal-entry cal-paid">Paid</span>
        </li>
        <li>
          <span class="cal-entry cal-approved cal-requested">Requested date</span>
        </li>
      </ul>
      <section class="card table-card cal-grid-card">
        <table class="cal-grid">
          <thead>
            <tr>
              {WEEKDAYS.map(d => (
                <th scope="col">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map(week => (
              <tr>
                {week.map(d => {
                  const key = dayKey(d);
                  const entries = days.get(key) ?? [];
                  const outside = d < month || d > monthEnd;
                  return (
                    <td class={`${outside ? "cal-outside" : ""}${key === today ? " cal-today" : ""}${entries.some(e => e.clash.length) ? " cal-day-clash" : ""}`}>
                      <span class="cal-date">{d.getUTCDate()}</span>
                      {entries.map(entry => (
                        <EntryLink entry={entry} />
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section class="card cal-agenda" aria-label={`Bookings in ${monthLabel(month)}`}>
        {monthDays.length ? (
          <ul class="booking-list">
            {monthDays.map(d => (
              <li>
                <b class={dayKey(d) === today ? "cal-agenda-today" : ""}>{shortDate(d)}</b>
                <div class="cal-agenda-entries">
                  {days.get(dayKey(d))!.map(entry => (
                    <EntryLink entry={entry} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p class="muted flush">No bookings with dates in {monthLabel(month)}.</p>
        )}
      </section>
      {undated.length ? (
        <section class="card mt-4">
          <h2>Bookings without a date</h2>
          <p class="muted">These requests didn't include a start date (tool-only bookings don't ask for one). Set dates on the booking to place it on the calendar.</p>
          <ul class="booking-list mt-3">
            {undated.map(b => (
              <li>
                <EntryLink entry={{ booking: b, confirmed: false, clash: [] }} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AdminPage>,
  );
});
