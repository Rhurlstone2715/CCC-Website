import { raw } from "hono/html";
import type { Child, FC } from "hono/jsx";
import type { BookingStatus } from "../generated/prisma/client.js";
import type { SessionUser } from "../auth.js";

export const PHONE_DISPLAY = "(345) 916-0816";
export const PHONE_LINK = "tel:+13459160816";
export const WHATSAPP_LINK = "https://wa.me/13459160816";

export function money(cents: number): string {
  const dollars = cents / 100;
  return `CI$${dollars.toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

export function caymanDate(date: Date, withTime = true): string {
  return date.toLocaleString("en-US", { timeZone: "America/Cayman", dateStyle: "medium", ...(withTime ? { timeStyle: "short" } : {}) });
}

export const STATUS_LABELS: Record<BookingStatus, { customer: string; admin: string }> = {
  PENDING: { customer: "Waiting for review", admin: "Pending" },
  APPROVED: { customer: "Approved", admin: "Approved" },
  PAID: { customer: "Paid", admin: "Paid" },
  DECLINED: { customer: "Declined", admin: "Declined" },
  CANCELLED: { customer: "Cancelled", admin: "Cancelled" },
};

export const StatusBadge: FC<{ status: BookingStatus; audience: "customer" | "admin" }> = ({ status, audience }) => (
  <span class={`badge badge-${status.toLowerCase()}`}>{STATUS_LABELS[status][audience]}</span>
);

export const Notice: FC<{ tone?: "success" | "error" | "info"; children: Child }> = ({ tone = "info", children }) => (
  <div class={`notice notice-${tone}`} role={tone === "error" ? "alert" : "status"}>
    {children}
  </div>
);

export const Field: FC<{
  label: string;
  name: string;
  type?: string;
  value?: string | null;
  required?: boolean;
  autocomplete?: string;
  hint?: string;
  minlength?: number;
  maxlength?: number;
  inputmode?: "decimal" | "email" | "numeric" | "tel" | "text";
  step?: string;
  min?: string;
}> = ({ label, name, type = "text", value, required, autocomplete, hint, minlength, maxlength, inputmode, step, min }) => {
  const id = `field-${name}`;
  return (
    <div class="field">
      <label for={id}>
        {label}
        {required ? null : <span class="optional"> (optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value ?? undefined}
        required={required}
        autocomplete={autocomplete}
        minlength={minlength}
        maxlength={maxlength}
        inputmode={inputmode}
        step={step}
        min={min}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint ? (
        <small id={`${id}-hint`} class="hint">
          {hint}
        </small>
      ) : null}
    </div>
  );
};

type LayoutProps = {
  title: string;
  area: "account" | "admin";
  user?: SessionUser | null;
  pendingCount?: number;
  active?: "bookings" | "customers";
  children: Child;
};

export const Layout: FC<LayoutProps> = ({ title, area, user, pendingCount, active, children }) => (
  <>
    {raw("<!doctype html>")}
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#a3070b" />
        <meta name="robots" content="noindex" />
        <title>{`${title} | Cayman Crane Company`}</title>
        <link rel="icon" href="/assets/cayman-crane-logo.png" />
        <link rel="stylesheet" href="/portal.css" />
        <script src="/portal.js" defer></script>
      </head>
      <body class={`area-${area}`}>
        <a class="skip-link" href="#main">
          Skip to content
        </a>
        <div class="utility">
          <div class="wrap utility-inner">
            <span>{area === "admin" ? "Cayman Crane admin" : "Serving Grand Cayman"}</span>
            <span>
              <a href={PHONE_LINK}>{PHONE_DISPLAY}</a>
              <i></i>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener">
                WhatsApp
              </a>
            </span>
          </div>
        </div>
        <header class="site-header">
          <div class="wrap nav-row">
            <a class="brand" href={area === "admin" ? "/admin" : "/rentals"}>
              <img src="/assets/cayman-crane-logo.png" alt="" width="58" height="52" />
              <span class="brand-copy">
                <b>Cayman Crane Company</b>
                <small>{area === "admin" ? "Admin" : "Services • Rentals • Rigging"}</small>
              </span>
            </a>
            <nav aria-label={area === "admin" ? "Admin" : "Account"}>
              {area === "admin" && user?.role === "ADMIN" ? (
                <>
                  <a href="/admin/bookings" aria-current={active === "bookings" ? "page" : undefined}>
                    Bookings{pendingCount ? <span class="count">{pendingCount}</span> : null}
                  </a>
                  <a href="/admin/customers" aria-current={active === "customers" ? "page" : undefined}>
                    Customers
                  </a>
                  <a href="/rentals">View site</a>
                </>
              ) : (
                <a href="/rentals">Browse equipment</a>
              )}
              {user ? (
                <form method="post" action="/account/logout" class="inline-form">
                  <input type="hidden" name="next" value={area === "admin" ? "/admin/login" : "/rentals"} />
                  <button type="submit" class="link-button">
                    Log out
                  </button>
                </form>
              ) : null}
            </nav>
          </div>
        </header>
        <main id="main" class="wrap portal-main">
          {children}
        </main>
        <footer class="portal-footer">
          <div class="wrap">
            <span>© {new Date().getFullYear()} Cayman Crane Company</span>
            <span>
              Questions? Call <a href={PHONE_LINK}>{PHONE_DISPLAY}</a> or{" "}
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener">
                message us on WhatsApp
              </a>
              .
            </span>
          </div>
        </footer>
      </body>
    </html>
  </>
);
