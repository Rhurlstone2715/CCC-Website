import { Hono, type Context } from "hono";
import type { FC } from "hono/jsx";
import { type AppEnv, createResetLink, currentUser, marketingChange, requireAdmin, safeNext } from "../auth.js";
import { bookingRef, contractSubject, contractText, parseDate, sendContract } from "../bookings.js";
import { TERM_LABELS, type PricedLine } from "../catalog.js";
import { prisma } from "../db.js";
import { customerEmailsEnabled } from "../email.js";
import type { Booking, BookingStatus, User } from "../generated/prisma/client.js";
import { rewardsForSpend, rewardsForUser } from "../rewards.js";
import { AdminPage, centsToInput, parseAmount, pendingCount } from "../views/admin-page.js";
import { Field, Notice, STATUS_LABELS, StatusBadge, caymanDate, money } from "../views/layout.js";
import { parseProfile, text } from "./account.js";

export const admin = new Hono<AppEnv>();


const NOTICES: Record<string, { tone: "success" | "error" | "info"; text: string }> = {
  "approved-sent": { tone: "success", text: "Booking approved. The customer has been emailed their confirmation and contract." },
  "approved-manual": { tone: "info", text: "Booking approved. Customer emails aren't set up yet, so send the contract below from your own inbox." },
  "approved-failed": { tone: "error", text: "Booking approved, but the contract email didn't send. Send it below from your own inbox." },
  "contract-sent": { tone: "success", text: "Contract emailed to the customer." },
  "contract-failed": { tone: "error", text: "The contract email didn't send. Try again, or send it from your own inbox." },
  declined: { tone: "success", text: "Booking declined." },
  cancelled: { tone: "success", text: "Booking cancelled." },
  paid: { tone: "success", text: "Payment recorded. The customer's rewards are updated." },
  reopened: { tone: "success", text: "Booking reopened." },
  unpaid: { tone: "success", text: "Payment removed. The booking is back to approved." },
  "note-saved": { tone: "success", text: "Note saved." },
  linked: { tone: "success", text: "Booking linked to the customer's account." },
  deleted: { tone: "success", text: "Booking deleted." },
  "bad-amount": { tone: "error", text: "Enter the amount paid in CI$, for example 1250 or 1250.50." },
  "bad-transition": { tone: "error", text: "That action doesn't apply to this booking any more. The page has been refreshed." },
  "credit-saved": { tone: "success", text: "Rewards credit saved." },
  "bad-credit": { tone: "error", text: "Enter the credit in CI$, for example 2500. Use 0 to remove it." },
  "profile-saved": { tone: "success", text: "Customer details saved." },
  "schedule-saved": { tone: "success", text: "Rental dates saved. The booking shows on those days in the calendar." },
  "schedule-cleared": { tone: "success", text: "Rental dates cleared." },
  "bad-schedule": { tone: "error", text: "Enter a first and last day, with the last day on or after the first, within a year." },
  "customer-deleted": { tone: "success", text: "Customer account deleted." },
  "cant-delete-self": { tone: "error", text: "You can't delete the account you're logged in with." },
  "last-admin": { tone: "error", text: "This is the only admin account, so it can't be deleted." },
  "made-admin": { tone: "success", text: "Admin access given. They can now log in through the normal login and use the admin area." },
  "removed-admin": { tone: "success", text: "Admin access removed. Their customer account is unchanged." },
  "cant-change-self": { tone: "error", text: "You can't remove your own admin access." },
  "admin-needed": { tone: "error", text: "There has to be at least one admin, so this account keeps admin access." },
  "email-confirmed": { tone: "success", text: "Email marked as confirmed. They can book now." },
  "marketing-off": { tone: "success", text: "Marketing emails stopped. Leave them off the next marketing list you download." },
};

function noticeFrom(c: Context): { tone: "success" | "error" | "info"; text: string } | undefined {
  const key = c.req.query("notice");
  return key ? NOTICES[key] : undefined;
}

// @db.Date values come back as UTC midnights.
const calendarDate = (d: Date) => d.toLocaleDateString("en-US", { timeZone: "UTC", dateStyle: "medium" });
const isoDate = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");

// ---------- Login ----------

// Admins log in through the normal account page; old admin login links land there.
admin.get("/login", c => c.redirect(`/account?next=${encodeURIComponent(safeNext(c.req.query("next"), "/admin"))}`));

// Everything below needs an admin session.
admin.use("/*", async (c, next) => {
  if (c.req.path === "/admin/login") return next();
  return requireAdmin(c, next);
});

admin.get("/", c => c.redirect("/admin/bookings"));

// ---------- Bookings ----------

const STATUSES: BookingStatus[] = ["PENDING", "APPROVED", "PAID", "DECLINED", "CANCELLED"];

admin.get("/bookings", async c => {
  const user = (await currentUser(c))!;
  const requested = (c.req.query("status") ?? "PENDING").toUpperCase();
  const status = STATUSES.includes(requested as BookingStatus) ? (requested as BookingStatus) : null;

  const [groups, bookings] = await Promise.all([
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);
  const counts = Object.fromEntries(groups.map(g => [g.status, g._count._all])) as Partial<Record<BookingStatus, number>>;
  const total = groups.reduce((sum, g) => sum + g._count._all, 0);
  const notice = noticeFrom(c);

  return c.html(
    <AdminPage title="Bookings" user={user} pending={counts.PENDING ?? 0} active="bookings">
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <div class="page-head">
        <p class="eyebrow">Admin</p>
        <h1>Bookings</h1>
      </div>
      <nav class="tabs" aria-label="Filter bookings by status">
        {STATUSES.map(s => (
          <a href={`/admin/bookings?status=${s.toLowerCase()}`} aria-current={status === s ? "page" : undefined}>
            {STATUS_LABELS[s].admin} <span>{counts[s] ?? 0}</span>
          </a>
        ))}
        <a href="/admin/bookings?status=all" aria-current={status === null ? "page" : undefined}>
          All <span>{total}</span>
        </a>
      </nav>
      <details class="export">
        <summary>Export to a spreadsheet</summary>
        <form class="amount-form mt-3" method="get" action="/admin/bookings/export.csv">
          <input type="hidden" name="status" value={status ? status.toLowerCase() : "all"} />
          <div class="field">
            <label for="from">
              Received from <span class="optional">(optional)</span>
            </label>
            <input id="from" name="from" type="date" />
          </div>
          <div class="field">
            <label for="to">
              Received up to <span class="optional">(optional)</span>
            </label>
            <input id="to" name="to" type="date" />
          </div>
          <button class="button secondary" type="submit">
            Download CSV
          </button>
        </form>
        <p class="hint mt-3">
          Exports {status ? `${STATUS_LABELS[status].admin.toLowerCase()} bookings` : "all bookings"} with customer details, equipment, estimates and payments. Opens in Excel, Numbers or Google Sheets.
        </p>
      </details>
      <section class="card table-card">
        {bookings.length ? (
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Booking</th>
                <th scope="col">Customer</th>
                <th scope="col">Account</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr>
                  <td data-label="Booking">
                    <a href={`/admin/bookings/${b.id}`}>{bookingRef(b.id)}</a>
                    <span class="sub">Received {caymanDate(b.createdAt)}</span>
                    {b.scheduleStart ?? b.startDate ? <span class="sub">Starts {calendarDate((b.scheduleStart ?? b.startDate)!)}</span> : null}
                  </td>
                  <td data-label="Customer">
                    {b.customerName}
                    <span class="sub">{b.customerEmail}</span>
                  </td>
                  <td data-label="Account">
                    {b.user ? <a href={`/admin/customers/${b.user.id}`}>{b.user.name}</a> : <span class="muted">Guest</span>}
                    {b.discountPercent ? <span class="sub">{`${b.rewardTier}, ${b.discountPercent}% off`}</span> : null}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={b.status} audience="admin" />
                    {b.amountPaidCents ? <span class="sub">{money(b.amountPaidCents)}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div class="empty">
            <p>{status ? `No ${STATUS_LABELS[status].admin.toLowerCase()} bookings.` : "No bookings yet."}</p>
          </div>
        )}
      </section>
      {bookings.length === 200 ? <p class="muted">Showing the 200 most recent.</p> : null}
    </AdminPage>,
  );
});

const JobDetails: FC<{ booking: Booking }> = ({ booking: b }) => {
  const lines = (b.items ?? []) as unknown as PricedLine[];
  const hasDetails = lines.length || b.startDate || b.area || b.siteAddress || b.phone || b.company;
  return (
    <section class="card">
      <h2>Job details</h2>
      {hasDetails ? (
        <>
          <dl class="facts mt-3">
            <dt>Requested start</dt>
            <dd>{b.startDate ? `${calendarDate(b.startDate)}${b.startTime ? ` at ${b.startTime}` : ""}` : "Not asked (no crane, boom truck or telehandler)"}</dd>
            {b.area ? (
              <>
                <dt>Area</dt>
                <dd>{b.area}</dd>
              </>
            ) : null}
            {b.siteAddress ? (
              <>
                <dt>Site address</dt>
                <dd>{b.siteAddress}</dd>
              </>
            ) : null}
            {b.phone ? (
              <>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`}>{b.phone}</a>
                </dd>
              </>
            ) : null}
            {b.company ? (
              <>
                <dt>Company</dt>
                <dd>{b.company}</dd>
              </>
            ) : null}
          </dl>
          {lines.length ? (
            <table class="data-table lines mt-3">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Term</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lines.map(l => (
                  <tr>
                    <td data-label="Item">{l.name}</td>
                    <td data-label="Term">
                      {TERM_LABELS[l.term] ?? l.term} × {l.qty}
                    </td>
                    <td data-label="Amount">{l.amount === null ? <span class="muted">To be quoted</span> : money(Math.round(l.amount * 100))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {b.estimateCents !== null ? (
            <p class="mt-3">
              <b>Estimate {money(b.estimateCents)}</b>{" "}
              <span class="muted">
                {b.discountPercent ? `after the ${b.rewardTier} ${b.discountPercent}% discount, ` : ""}before delivery. Priced from the catalog when the booking was made.
              </span>
            </p>
          ) : null}
        </>
      ) : (
        <p class="muted">This booking was made before job details were recorded separately. Everything is in the request below.</p>
      )}
    </section>
  );
};

// ---------- Spreadsheet export ----------

// Spreadsheet apps run cells that start with these as formulas, so they're
// prefixed with an apostrophe to keep them as text.
export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

const caymanStamp = (d: Date | null) => (d ? new Date(d.getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ") : null);
const dollars = (cents: number | null) => (cents === null ? null : cents / 100);

const CSV_HEADER = [
  "Reference",
  "Received (Cayman time)",
  "Status",
  "Customer",
  "Email",
  "Phone",
  "Company",
  "Account email",
  "Tier at booking",
  "Discount %",
  "Requested start",
  "Start time",
  "Area",
  "Site address",
  "Rental first day",
  "Rental last day",
  "Equipment",
  "Estimate (CI$)",
  "Amount paid (CI$)",
  "Paid on",
  "Approved on",
  "Contract emailed on",
  "Note",
];

admin.get("/bookings/export.csv", async c => {
  const requested = (c.req.query("status") ?? "all").toUpperCase();
  const status = STATUSES.includes(requested as BookingStatus) ? (requested as BookingStatus) : null;
  const from = parseDate(c.req.query("from"));
  const to = parseDate(c.req.query("to"));
  // A Cayman day (UTC-5) runs from 05:00 to 05:00 UTC.
  const fiveHours = 5 * 60 * 60 * 1000;
  const createdAt = { ...(from ? { gte: new Date(from.getTime() + fiveHours) } : {}), ...(to ? { lt: new Date(to.getTime() + 24 * 60 * 60 * 1000 + fiveHours) } : {}) };
  const bookings = await prisma.booking.findMany({
    where: { ...(status ? { status } : {}), ...(from || to ? { createdAt } : {}) },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { email: true } } },
  });

  const rows = bookings.map(b => [
    bookingRef(b.id),
    caymanStamp(b.createdAt),
    STATUS_LABELS[b.status].admin,
    b.customerName,
    b.customerEmail,
    b.phone,
    b.company,
    b.user?.email ?? null,
    b.rewardTier,
    b.discountPercent,
    isoDate(b.startDate) || null,
    b.startTime,
    b.area,
    b.siteAddress,
    isoDate(b.scheduleStart) || null,
    isoDate(b.scheduleEnd) || null,
    ((b.items ?? []) as unknown as PricedLine[]).map(l => `${l.name} (${TERM_LABELS[l.term] ?? l.term} × ${l.qty})`).join("; ") || null,
    dollars(b.estimateCents),
    dollars(b.amountPaidCents),
    caymanStamp(b.paidAt),
    caymanStamp(b.approvedAt),
    caymanStamp(b.contractSentAt),
    b.adminNote,
  ]);
  const csv = "\uFEFF" + [CSV_HEADER, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
  const stamp = new Date(Date.now() - fiveHours).toISOString().slice(0, 10);
  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", `attachment; filename="ccc-bookings-${status ? status.toLowerCase() + "-" : ""}${stamp}.csv"`);
  return c.body(csv);
});

const ContractFallback: FC<{ booking: Booking }> = ({ booking }) => {
  const mailto = `mailto:${booking.customerEmail}?subject=${encodeURIComponent(contractSubject(booking))}&body=${encodeURIComponent(contractText(booking))}`;
  return (
    <div class="stack mt-3">
      <div class="actions-row">
        <a class="button secondary small" href={mailto}>
          Email from your inbox
        </a>
        <button class="button secondary small" type="button" data-copy="contract-text">
          Copy contract
        </button>
      </div>
      <details>
        <summary>Show contract text</summary>
        <textarea id="contract-text" readonly rows={12} aria-label="Contract email text">
          {contractText(booking)}
        </textarea>
      </details>
    </div>
  );
};

const BookingActions: FC<{ booking: Booking }> = ({ booking }) => {
  const action = (name: string) => `/admin/bookings/${booking.id}/${name}`;
  const emails = customerEmailsEnabled();
  switch (booking.status) {
    case "PENDING":
      return (
        <>
          <p class="muted">
            {emails
              ? `Approving emails ${booking.customerEmail} a confirmation with their booking summary and the agreement they signed. Save the rental dates first to include them.`
              : "Customer emails aren't set up yet, so after approving you'll send the contract from your own inbox."}
          </p>
          <div class="actions-row">
            <form method="post" action={action("approve")}>
              <button class="button primary" type="submit">
                {emails ? "Approve and email confirmation" : "Approve"}
              </button>
            </form>
            <form method="post" action={action("decline")} data-confirm="Decline this booking?">
              <button class="button secondary" type="submit">
                Decline
              </button>
            </form>
          </div>
        </>
      );
    case "APPROVED":
      return (
        <>
          <form class="amount-form" method="post" action={action("paid")}>
            <Field label="Amount paid (CI$)" name="amount" inputmode="decimal" required hint="Earns the customer one rewards point per CI$1." />
            <button class="button primary" type="submit">
              Mark as paid
            </button>
          </form>
          <hr class="divider" />
          <h3>Contract</h3>
          {booking.contractSentAt ? (
            <p class="muted">Emailed to the customer {caymanDate(booking.contractSentAt)}.</p>
          ) : (
            <p class="muted">Not emailed yet.</p>
          )}
          {emails ? (
            <form method="post" action={action("send-contract")}>
              <button class="button secondary small" type="submit">
                {booking.contractSentAt ? "Email it again" : "Email contract"}
              </button>
            </form>
          ) : null}
          {!booking.contractSentAt ? <ContractFallback booking={booking} /> : null}
          <hr class="divider" />
          <form method="post" action={action("cancel")} data-confirm="Cancel this booking?">
            <button class="button secondary small" type="submit">
              Cancel booking
            </button>
          </form>
        </>
      );
    case "PAID":
      return (
        <>
          <p>
            Paid <b>{money(booking.amountPaidCents ?? 0)}</b>
            {booking.paidAt ? ` on ${caymanDate(booking.paidAt, false)}` : null}.
          </p>
          <form class="amount-form" method="post" action={action("paid")}>
            <Field label="Correct the amount (CI$)" name="amount" inputmode="decimal" value={centsToInput(booking.amountPaidCents)} required />
            <button class="button secondary" type="submit">
              Update amount
            </button>
          </form>
          <form class="mt-3" method="post" action={action("reopen")} data-confirm="Remove the payment and move this booking back to approved? The customer loses the points it earned.">
            <button class="button secondary small" type="submit">
              Mark as unpaid
            </button>
          </form>
        </>
      );
    default:
      return (
        <form method="post" action={action("reopen")}>
          <button class="button secondary" type="submit">
            Reopen booking
          </button>
        </form>
      );
  }
};

admin.get("/bookings/:id{[0-9]+}", async c => {
  const user = (await currentUser(c))!;
  const booking = await prisma.booking.findUnique({ where: { id: Number(c.req.param("id")) }, include: { user: true } });
  if (!booking) return c.notFound();
  const [pending, matchingAccount] = await Promise.all([
    pendingCount(),
    booking.userId ? null : prisma.user.findUnique({ where: { email: booking.customerEmail.toLowerCase() }, select: { id: true, name: true } }),
  ]);
  const notice = noticeFrom(c);
  const ref = bookingRef(booking.id);

  return c.html(
    <AdminPage title={ref} user={user} pending={pending} active="bookings">
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <p class="back-link">
        <a class="text-link" href="/admin/bookings">
          ← All bookings
        </a>
      </p>
      <div class="page-head">
        <p class="eyebrow">Booking</p>
        <h1>{ref}</h1>
        <p class="lede">
          <StatusBadge status={booking.status} audience="admin" /> Received {caymanDate(booking.createdAt)}
        </p>
      </div>
      <div class="grid-2">
        <div class="stack">
          <JobDetails booking={booking} />
          <section class="card">
            <h2>Request</h2>
            <pre class="request">{booking.requestText}</pre>
          </section>
          <section class="card">
            <h2>Signed agreement</h2>
            <dl class="facts mt-3">
              <dt>Signed by</dt>
              <dd>{booking.signature}</dd>
              <dt>Initials</dt>
              <dd>{booking.initials}</dd>
              <dt>Agreement</dt>
              <dd>{booking.agreedToTerms ? "Accepted" : "Not accepted"}</dd>
              <dt>Payment terms</dt>
              <dd>{booking.paymentAck ? "Acknowledged" : "Not acknowledged"}</dd>
            </dl>
            <details>
              <summary>Show the rental terms they signed</summary>
              <pre class="request">{booking.termsText}</pre>
            </details>
          </section>
        </div>
        <div class="stack">
          <section class="card">
            <h2>Customer</h2>
            <dl class="facts mt-3">
              <dt>Name</dt>
              <dd>{booking.customerName}</dd>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${booking.customerEmail}`}>{booking.customerEmail}</a>
              </dd>
              <dt>Account</dt>
              <dd>{booking.user ? <a href={`/admin/customers/${booking.user.id}`}>{booking.user.name}</a> : "Guest booking"}</dd>
              <dt>Tier at booking</dt>
              <dd>{booking.discountPercent ? `${booking.rewardTier}, ${booking.discountPercent}% off equipment` : booking.rewardTier ?? "None"}</dd>
              <dt>Alert email</dt>
              <dd>{booking.alertSentAt ? `Sent ${caymanDate(booking.alertSentAt)}` : "Not sent (customer was offered the email fallback)"}</dd>
            </dl>
            {matchingAccount ? (
              <form class="mt-3" method="post" action={`/admin/bookings/${booking.id}/link`}>
                <p class="muted flush mb-2">
                  {matchingAccount.name} has an account with this email. Linking counts this booking toward their rewards once paid.
                </p>
                <button class="button secondary small" type="submit">
                  Link to {matchingAccount.name}'s account
                </button>
              </form>
            ) : null}
          </section>
          <section class="card">
            <h2>Rental dates</h2>
            <p class="muted">
              {booking.scheduleStart
                ? "Confirmed dates, shown on the calendar."
                : booking.startDate
                  ? "Not confirmed yet. The calendar shows the requested start date until you save dates here."
                  : "Set dates to place this booking on the calendar."}
            </p>
            <form class="form" method="post" action={`/admin/bookings/${booking.id}/schedule`}>
              <div class="rate-grid">
                <div class="field">
                  <label for="scheduleStart">First day</label>
                  <input id="scheduleStart" name="scheduleStart" type="date" value={isoDate(booking.scheduleStart ?? booking.startDate)} required />
                </div>
                <div class="field">
                  <label for="scheduleEnd">Last day</label>
                  <input id="scheduleEnd" name="scheduleEnd" type="date" value={isoDate(booking.scheduleEnd ?? booking.scheduleStart ?? booking.startDate)} />
                </div>
              </div>
              <div class="form-actions">
                <button class="button secondary small" type="submit">
                  Save dates
                </button>
              </div>
            </form>
            {booking.scheduleStart ? (
              <form class="mt-3" method="post" action={`/admin/bookings/${booking.id}/schedule`}>
                <input type="hidden" name="clear" value="1" />
                <button class="link-button text-link" type="submit">
                  Clear dates
                </button>
              </form>
            ) : null}
          </section>
          <section class="card">
            <h2>Actions</h2>
            <div class="mt-3">
              <BookingActions booking={booking} />
            </div>
          </section>
          <section class="card">
            <h2>Notes</h2>
            <form class="form" method="post" action={`/admin/bookings/${booking.id}/note`}>
              <div class="field">
                <label for="note">Private note</label>
                <textarea id="note" name="note" maxlength={5000} aria-describedby="note-hint">
                  {booking.adminNote ?? ""}
                </textarea>
                <small id="note-hint" class="hint">
                  Only admins see this.
                </small>
              </div>
              <div class="form-actions">
                <button class="button secondary small" type="submit">
                  Save note
                </button>
              </div>
            </form>
          </section>
          <section class="card danger-zone">
            <h2>Delete booking</h2>
            <p class="muted">For test or duplicate requests. This can't be undone.</p>
            <form method="post" action={`/admin/bookings/${booking.id}/delete`} data-confirm={`Delete ${ref} permanently?`}>
              <button class="button danger small" type="submit">
                Delete {ref}
              </button>
            </form>
          </section>
        </div>
      </div>
    </AdminPage>,
  );
});

admin.post("/bookings/:id{[0-9]+}/:action", async c => {
  const id = Number(c.req.param("id"));
  const action = c.req.param("action");
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return c.notFound();
  const back = (notice: string) => c.redirect(`/admin/bookings/${id}?notice=${notice}`);
  const body = await c.req.parseBody();
  const update = (data: Parameters<typeof prisma.booking.update>[0]["data"]) => prisma.booking.update({ where: { id }, data });

  switch (action) {
    case "approve": {
      if (booking.status !== "PENDING") return back("bad-transition");
      const approved = await update({ status: "APPROVED", approvedAt: new Date() });
      if (!customerEmailsEnabled()) return back("approved-manual");
      if (await sendContract(approved)) {
        await update({ contractSentAt: new Date() });
        return back("approved-sent");
      }
      return back("approved-failed");
    }
    case "send-contract": {
      if (!["APPROVED", "PAID"].includes(booking.status) || !customerEmailsEnabled()) return back("bad-transition");
      if (!(await sendContract(booking))) return back("contract-failed");
      await update({ contractSentAt: new Date() });
      return back("contract-sent");
    }
    case "decline":
      if (booking.status !== "PENDING") return back("bad-transition");
      await update({ status: "DECLINED" });
      return back("declined");
    case "cancel":
      if (!["PENDING", "APPROVED"].includes(booking.status)) return back("bad-transition");
      await update({ status: "CANCELLED" });
      return back("cancelled");
    case "paid": {
      if (!["APPROVED", "PAID"].includes(booking.status)) return back("bad-transition");
      const cents = parseAmount(body.amount);
      if (cents === null) return back("bad-amount");
      await update({ status: "PAID", amountPaidCents: cents, paidAt: booking.paidAt ?? new Date() });
      return back("paid");
    }
    case "reopen":
      if (booking.status === "PAID") {
        await update({ status: "APPROVED", amountPaidCents: null, paidAt: null });
        return back("unpaid");
      }
      if (!["DECLINED", "CANCELLED"].includes(booking.status)) return back("bad-transition");
      await update({ status: "PENDING", approvedAt: null });
      return back("reopened");
    case "schedule": {
      if (body.clear === "1") {
        await update({ scheduleStart: null, scheduleEnd: null });
        return back("schedule-cleared");
      }
      const start = parseDate(body.scheduleStart);
      const end = parseDate(body.scheduleEnd) ?? start;
      if (!start || !end || end < start || end.getTime() - start.getTime() > 366 * 24 * 60 * 60 * 1000) return back("bad-schedule");
      await update({ scheduleStart: start, scheduleEnd: end });
      return back("schedule-saved");
    }
    case "note":
      await update({ adminNote: text(body.note).slice(0, 5000) || null });
      return back("note-saved");
    case "link": {
      if (booking.userId) return back("bad-transition");
      const account = await prisma.user.findUnique({ where: { email: booking.customerEmail.toLowerCase() } });
      if (!account) return back("bad-transition");
      await update({ userId: account.id });
      return back("linked");
    }
    case "delete":
      await prisma.booking.delete({ where: { id } });
      return c.redirect("/admin/bookings?status=all&notice=deleted");
    default:
      return c.notFound();
  }
});

// ---------- Customers ----------

async function paidByUser(userIds: number[]): Promise<Map<number, number>> {
  if (!userIds.length) return new Map();
  const sums = await prisma.booking.groupBy({ by: ["userId"], where: { status: "PAID", userId: { in: userIds } }, _sum: { amountPaidCents: true } });
  return new Map(sums.map(s => [s.userId!, s._sum.amountPaidCents ?? 0]));
}

admin.get("/customers", async c => {
  const user = (await currentUser(c))!;
  const q = text(c.req.query("q")).slice(0, 100);
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { company: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q } },
        ],
      }
    : {};
  const [pending, customers, optedIn] = await Promise.all([
    pendingCount(),
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { _count: { select: { bookings: true } } } }),
    prisma.user.count({ where: { marketingOptIn: true } }),
  ]);
  const paid = await paidByUser(customers.map(u => u.id));
  const notice = noticeFrom(c);

  return c.html(
    <AdminPage title="Customers" user={user} pending={pending} active="customers">
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <div class="page-head">
        <p class="eyebrow">Admin</p>
        <h1>Customers</h1>
      </div>
      <form class="search-form" method="get" action="/admin/customers" role="search">
        <input type="search" name="q" value={q} placeholder="Name, email, company or phone" aria-label="Search customers" />
        <button class="button secondary" type="submit">
          Search
        </button>
      </form>
      <p class="muted">
        {optedIn === 1 ? "1 customer has" : `${optedIn} customers have`} agreed to offers and news.{" "}
        {optedIn ? (
          <a class="text-link" href="/admin/customers/marketing.csv">
            Download the marketing list (CSV)
          </a>
        ) : null}
      </p>
      <section class="card table-card">
        {customers.length ? (
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Contact</th>
                <th scope="col">Rewards</th>
                <th scope="col">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(u => {
                const rewards = rewardsForSpend((paid.get(u.id) ?? 0) + u.rewardCreditCents);
                return (
                  <tr>
                    <td data-label="Customer">
                      <a href={`/admin/customers/${u.id}`}>{u.name}</a>
                      {u.role === "ADMIN" ? <span class="sub">Admin</span> : null}
                      <span class="sub">Joined {caymanDate(u.createdAt, false)}</span>
                    </td>
                    <td data-label="Contact">
                      {u.email}
                      {u.phone ? <span class="sub">{u.phone}</span> : null}
                      {u.company ? <span class="sub">{u.company}</span> : null}
                      {u.emailVerifiedAt ? null : <span class="sub">Email not confirmed</span>}
                      {u.marketingOptIn ? <span class="sub">Agreed to offers</span> : null}
                    </td>
                    <td data-label="Rewards">
                      {rewards.tier}
                      <span class="sub">{money(rewards.spendCents)} paid</span>
                    </td>
                    <td data-label="Bookings">{u._count.bookings}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div class="empty">
            <p>{q ? `No customers match "${q}".` : "No customer accounts yet."}</p>
          </div>
        )}
      </section>
    </AdminPage>,
  );
});

// Only customers who ticked "offers and news" are listed, with the date they agreed.
admin.get("/customers/marketing.csv", async c => {
  const people = await prisma.user.findMany({ where: { marketingOptIn: true }, orderBy: { marketingOptInAt: "asc" } });
  const rows = [
    ["Name", "Email", "Phone", "Company", "Agreed on"],
    ...people.map(u => [u.name, u.email, u.phone, u.company, u.marketingOptInAt ? caymanStamp(u.marketingOptInAt)!.slice(0, 10) : null]),
  ];
  const csv = "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", `attachment; filename="ccc-marketing-list-${caymanStamp(new Date())!.slice(0, 10)}.csv"`);
  return c.body(csv);
});

async function renderCustomer(c: Context<AppEnv>, customer: User, extra: { resetLink?: string; profileError?: string } = {}) {
  const user = (await currentUser(c))!;
  const [pending, rewards, bookings] = await Promise.all([
    pendingCount(),
    rewardsForUser(customer.id),
    prisma.booking.findMany({ where: { userId: customer.id }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  const notice = noticeFrom(c);

  return c.html(
    <AdminPage title={customer.name} user={user} pending={pending} active="customers">
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <p class="back-link">
        <a class="text-link" href="/admin/customers">
          ← All customers
        </a>
      </p>
      <div class="page-head">
        <p class="eyebrow">{customer.role === "ADMIN" ? "Admin account" : "Customer"}</p>
        <h1>{customer.name}</h1>
        <p class="lede">Joined {caymanDate(customer.createdAt, false)}</p>
      </div>
      <div class="grid-2">
        <div class="stack">
          <section class="card">
            <h2>Details</h2>
            <form class="form" method="post" action={`/admin/customers/${customer.id}/profile`}>
              {extra.profileError ? <Notice tone="error">{extra.profileError}</Notice> : null}
              <Field label="Full name" name="name" value={customer.name} required maxlength={120} />
              <Field label="Email" name="email" type="email" value={customer.email} required maxlength={254} />
              <Field label="Phone" name="phone" type="tel" value={customer.phone} maxlength={40} />
              <Field label="Company" name="company" value={customer.company} maxlength={120} />
              <div class="form-actions">
                <button class="button secondary small" type="submit">
                  Save details
                </button>
              </div>
            </form>
          </section>
          <section class="card">
            <h2>Email and marketing</h2>
            <dl class="facts mt-3">
              <dt>Email</dt>
              <dd>{customer.emailVerifiedAt ? `Confirmed ${caymanDate(customer.emailVerifiedAt, false)}` : "Not confirmed yet, so they can't book"}</dd>
              <dt>Offers and news</dt>
              <dd>{customer.marketingOptIn ? `Agreed ${customer.marketingOptInAt ? caymanDate(customer.marketingOptInAt, false) : ""}` : "Not agreed"}</dd>
            </dl>
            <div class="actions-row mt-3">
              {customer.emailVerifiedAt ? null : (
                <form method="post" action={`/admin/customers/${customer.id}/confirm-email`} data-confirm={`Confirm ${customer.email} without the emailed link? Only do this if you've checked it's theirs.`}>
                  <button class="button secondary small" type="submit">
                    Mark email as confirmed
                  </button>
                </form>
              )}
              {customer.marketingOptIn ? (
                <form method="post" action={`/admin/customers/${customer.id}/marketing-off`} data-confirm={`Stop marketing emails to ${customer.name}?`}>
                  <button class="button secondary small" type="submit">
                    Stop marketing emails
                  </button>
                </form>
              ) : null}
            </div>
            <p class="hint">Only customers can agree to marketing, from sign-up or their account page. If one asks you to stop, use the button here.</p>
          </section>
          <section class="card">
            <h2>Password reset link</h2>
            <p class="muted">Create a link and send it to the customer by WhatsApp or email. It works once, for 72 hours.</p>
            {extra.resetLink ? (
              <div class="copy-box">
                <input id="reset-link" type="text" readonly value={extra.resetLink} aria-label="Password reset link" />
                <button class="button secondary small" type="button" data-copy="reset-link">
                  Copy link
                </button>
              </div>
            ) : (
              <form class="mt-3" method="post" action={`/admin/customers/${customer.id}/reset-link`}>
                <button class="button secondary small" type="submit">
                  Create reset link
                </button>
              </form>
            )}
          </section>
        </div>
        <div class="stack">
          <section class="card">
            <h2>Rewards</h2>
            <dl class="facts mt-3">
              <dt>Tier</dt>
              <dd>{rewards.discountPercent ? `${rewards.tier}, ${rewards.discountPercent}% off equipment` : rewards.tier}</dd>
              <dt>Points</dt>
              <dd>{rewards.points.toLocaleString("en-US")}</dd>
              <dt>Counted spend</dt>
              <dd>{money(rewards.spendCents)}</dd>
              <dt>Next tier</dt>
              <dd>{rewards.nextTier ? `${rewards.nextTier} in ${money(rewards.amountToNextCents)}` : "Already at the top"}</dd>
            </dl>
            <form class="amount-form mt-4" method="post" action={`/admin/customers/${customer.id}/credit`}>
              <Field
                label="Rewards credit (CI$)"
                name="credit"
                inputmode="decimal"
                value={centsToInput(customer.rewardCreditCents) || "0"}
                required
                hint="Spend from before their account existed, or a correction. Counts toward their tier."
              />
              <button class="button secondary" type="submit">
                Save credit
              </button>
            </form>
          </section>
          <section class="card">
            <div class="card-head">
              <h2>Bookings</h2>
              <span class="muted">{bookings.length ? `${bookings.length} total` : null}</span>
            </div>
            {bookings.length ? (
              <ul class="booking-list">
                {bookings.map(b => (
                  <li>
                    <div class="booking-row">
                      <div>
                        <a class="text-link" href={`/admin/bookings/${b.id}`}>
                          {bookingRef(b.id)}
                        </a>{" "}
                        <span class="muted">· {caymanDate(b.createdAt, false)}</span>
                      </div>
                      <span>
                        <StatusBadge status={b.status} audience="admin" />
                        {b.amountPaidCents ? <span class="muted"> {money(b.amountPaidCents)}</span> : null}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p class="muted">No bookings on this account yet.</p>
            )}
          </section>
          <section class="card">
            <h2>Admin access</h2>
            {customer.role === "ADMIN" ? (
              <>
                <p class="muted">
                  {customer.id === user.id
                    ? "This is your account. You can't remove your own admin access."
                    : `${customer.name} can use the admin area: bookings, customers, the calendar and the catalog.`}
                </p>
                {customer.id !== user.id ? (
                  <form method="post" action={`/admin/customers/${customer.id}/role`} data-confirm={`Remove ${customer.name}'s admin access?`}>
                    <input type="hidden" name="role" value="CUSTOMER" />
                    <button class="button secondary small" type="submit">
                      Remove admin access
                    </button>
                  </form>
                ) : null}
              </>
            ) : (
              <>
                <p class="muted">
                  Admins log in through the normal login and can see every booking and customer, and change prices. Only give access to Cayman Crane
                  staff.
                </p>
                <form
                  method="post"
                  action={`/admin/customers/${customer.id}/role`}
                  data-confirm={`Give ${customer.name} admin access? They'll see every booking and customer and can change prices.`}
                >
                  <input type="hidden" name="role" value="ADMIN" />
                  <button class="button secondary small" type="submit">
                    Give admin access
                  </button>
                </form>
              </>
            )}
          </section>
          {customer.id !== user.id ? (
            <section class="card danger-zone">
              <h2>Delete account</h2>
              <p class="muted">
                Deletes their login, details and rewards credit. Use this when a customer asks to be removed. This can't be undone.
              </p>
              <form
                class="form"
                method="post"
                action={`/admin/customers/${customer.id}/delete`}
                data-confirm={`Delete ${customer.name}'s account permanently?`}
              >
                {bookings.length ? (
                  <label class="check">
                    <input type="checkbox" name="deleteBookings" value="1" />
                    <span>
                      {bookings.length === 1
                        ? "Also delete their booking. Leave this unticked to keep it as a guest booking for your records."
                        : `Also delete their ${bookings.length} bookings. Leave this unticked to keep them as guest bookings for your records.`}
                    </span>
                  </label>
                ) : null}
                <div class="form-actions">
                  <button class="button danger small" type="submit">
                    Delete {customer.name}'s account
                  </button>
                </div>
              </form>
            </section>
          ) : null}
        </div>
      </div>
    </AdminPage>,
  );
}

admin.get("/customers/:id{[0-9]+}", async c => {
  const customer = await prisma.user.findUnique({ where: { id: Number(c.req.param("id")) } });
  return customer ? renderCustomer(c, customer) : c.notFound();
});

admin.post("/customers/:id{[0-9]+}/:action", async c => {
  const id = Number(c.req.param("id"));
  const customer = await prisma.user.findUnique({ where: { id } });
  if (!customer) return c.notFound();
  const body = await c.req.parseBody();
  const back = (notice: string) => c.redirect(`/admin/customers/${id}?notice=${notice}`);

  switch (c.req.param("action")) {
    case "credit": {
      const cents = parseAmount(body.credit);
      if (cents === null) return back("bad-credit");
      await prisma.user.update({ where: { id }, data: { rewardCreditCents: cents } });
      return back("credit-saved");
    }
    case "profile": {
      const profile = parseProfile(body);
      if ("error" in profile) return renderCustomer(c, customer, { profileError: profile.error });
      if (profile.email !== customer.email && (await prisma.user.findUnique({ where: { email: profile.email } }))) {
        return renderCustomer(c, customer, { profileError: "Another account already uses that email." });
      }
      // A changed address has to be confirmed again, by the customer's link or the button on this page.
      await prisma.user.update({ where: { id }, data: { ...profile, ...(profile.email !== customer.email ? { emailVerifiedAt: null } : {}) } });
      return back("profile-saved");
    }
    case "confirm-email":
      await prisma.user.update({ where: { id }, data: { emailVerifiedAt: customer.emailVerifiedAt ?? new Date() } });
      return back("email-confirmed");
    case "marketing-off":
      await prisma.user.update({ where: { id }, data: marketingChange(customer.marketingOptIn, false) });
      return back("marketing-off");
    case "role": {
      const role = body.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
      if (role === "CUSTOMER") {
        if (id === (await currentUser(c))!.id) return back("cant-change-self");
        if (customer.role === "ADMIN" && (await prisma.user.count({ where: { role: "ADMIN" } })) <= 1) return back("admin-needed");
      }
      await prisma.user.update({ where: { id }, data: { role } });
      return back(role === "ADMIN" ? "made-admin" : "removed-admin");
    }
    case "reset-link":
      return renderCustomer(c, customer, { resetLink: await createResetLink(c, id, 72) });
    case "delete": {
      if (id === (await currentUser(c))!.id) return back("cant-delete-self");
      if (customer.role === "ADMIN" && (await prisma.user.count({ where: { role: "ADMIN" } })) <= 1) return back("last-admin");
      // Sessions and reset links go with the user; kept bookings are unlinked (onDelete: SetNull).
      await prisma.$transaction([
        ...(body.deleteBookings === "1" ? [prisma.booking.deleteMany({ where: { userId: id } })] : []),
        prisma.user.delete({ where: { id } }),
      ]);
      return c.redirect("/admin/customers?notice=customer-deleted");
    }
    default:
      return c.notFound();
  }
});
