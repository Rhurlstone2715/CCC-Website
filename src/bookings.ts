import type { Booking, User } from "./generated/prisma/client.js";
import { COMPANY_EMAIL, sendEmail } from "./email.js";

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
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
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

  return { customerName, customerEmail, requestText, termsText, signature, initials, agreedToTerms: true, paymentAck: true };
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
