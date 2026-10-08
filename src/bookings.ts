import type { CartItem } from "./catalog.js";
import { COMPANY_EMAIL, sendEmail } from "./email.js";
import type { Booking, User } from "./generated/prisma/client.js";

// Shape of the JSON the checkout form in public/app.js posts to /api/bookings.
export type BookingInput = {
  customerName: string;
  customerEmail: string;
  requestText: string;
  termsText: string;
  signature: string;
  initials: string;
  agreedToTerms: boolean;
  paymentAck: boolean;
  details: BookingDetails;
};

// Structured copy of the checkout. Each field is optional and anything
// malformed is dropped rather than failing the booking.
export type BookingDetails = {
  phone: string | null;
  company: string | null;
  startDate: Date | null;
  startTime: string | null;
  area: string | null;
  siteAddress: string | null;
  items: CartItem[];
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
}

// "2026-10-11" as a calendar date (stored at UTC midnight), or null.
export function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

const TERM_PATTERN = /^(hourly|fourhour|daily|weekly|monthly|quote)$/;

export function parseDetails(value: unknown): BookingDetails {
  const d = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const startTime = typeof d.startTime === "string" && /^\d{2}:\d{2}$/.test(d.startTime) ? d.startTime : null;
  const items = Array.isArray(d.items)
    ? d.items
        .slice(0, 100)
        .flatMap(i => {
          const item = i && typeof i === "object" ? (i as Record<string, unknown>) : {};
          const id = typeof item.id === "string" && item.id.length <= 80 ? item.id : null;
          const term = typeof item.term === "string" && TERM_PATTERN.test(item.term) ? item.term : null;
          const qty = typeof item.qty === "number" && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 10_000 ? item.qty : null;
          return id && term && qty ? [{ id, term, qty }] : [];
        })
    : [];
  return {
    phone: text(d.phone, 40),
    company: text(d.company, 120),
    startDate: parseDate(d.startDate),
    startTime,
    area: text(d.area, 60),
    siteAddress: text(d.siteAddress, 300),
    items,
  };
}

export function parseBooking(body: unknown): BookingInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid booking request." };
  const b = body as Record<string, unknown>;

  const customerName = text(b.customerName, 200);
  const customerEmail = text(b.customerEmail, 254);
  const requestText = text(b.requestText, 20_000);
  const termsText = text(b.termsText, 100_000);
  const signature = text(b.signature, 254);
  const initials = text(b.initials, 20);

  if (!customerName) return { error: "Name is required." };
  if (!customerEmail || !EMAIL.test(customerEmail)) return { error: "A valid email is required." };
  if (!requestText) return { error: "Booking details are missing." };
  if (!termsText) return { error: "Rental terms are missing." };
  if (!signature || !initials) return { error: "Signature and initials are required." };
  if (b.agreement !== true) return { error: "The rental agreement must be accepted." };
  if (b.paymentAck !== true) return { error: "The payment terms must be acknowledged." };

  return {
    customerName,
    customerEmail,
    requestText,
    termsText,
    signature,
    initials,
    agreedToTerms: true,
    paymentAck: true,
    details: parseDetails(b.details),
  };
}

export function bookingRef(id: number): string {
  return `CCC-${String(id).padStart(5, "0")}`;
}

function caymanTime(date: Date): string {
  return date.toLocaleString("en-US", { timeZone: "America/Cayman", dateStyle: "medium", timeStyle: "short" });
}

// Emails a new booking to Cayman Crane. Returns false when alerts aren't
// configured or the send fails, so the caller can fall back to email.
export async function sendBookingAlert(booking: Booking, account: Pick<User, "name" | "email"> | null): Promise<boolean> {
  const ref = bookingRef(booking.id);
  const accountLine = account
    ? `Account: ${account.name} <${account.email}>${booking.discountPercent ? ` · ${booking.rewardTier} tier, ${booking.discountPercent}% off equipment` : ""}`
    : "Account: none (guest booking)";
  const body = [
    `New booking request ${ref}`,
    `Received ${caymanTime(booking.createdAt)} (Cayman time)`,
    accountLine,
    "",
    `Signed by: ${booking.signature} (initials ${booking.initials})`,
    "Rental agreement accepted: yes",
    "Payment terms acknowledged: yes",
    "",
    booking.requestText,
    "",
    "Reply to this email to respond to the customer directly, or open the booking in the admin area to approve it.",
  ].join("\n");

  return sendEmail({
    to: COMPANY_EMAIL,
    replyTo: booking.customerEmail,
    subject: `Booking request ${ref} from ${booking.customerName}`,
    text: body,
  });
}

export function contractSubject(booking: Booking): string {
  return `Your Cayman Crane booking ${bookingRef(booking.id)} is approved`;
}

// The approval email: what they booked and the agreement they signed.
export function contractText(booking: Booking): string {
  const firstName = booking.customerName.split(/\s+/)[0];
  return [
    `Hi ${firstName},`,
    "",
    `Your booking request ${bookingRef(booking.id)} with Cayman Crane Company has been approved.`,
    "Below is your booking summary and the rental agreement you signed. Please keep this email for your records.",
    "",
    "BOOKING SUMMARY",
    "",
    booking.requestText,
    "",
    "RENTAL AGREEMENT",
    "",
    booking.termsText,
    "",
    `Signed: ${booking.signature}`,
    `Initials: ${booking.initials}`,
    `Signed on: ${caymanTime(booking.createdAt)} (Cayman time)`,
    "",
    "Questions? Reply to this email or call (345) 916-0816.",
    "",
    "Cayman Crane Company",
  ].join("\n");
}

export async function sendContract(booking: Booking): Promise<boolean> {
  return sendEmail({ to: booking.customerEmail, replyTo: COMPANY_EMAIL, subject: contractSubject(booking), text: contractText(booking) });
}
