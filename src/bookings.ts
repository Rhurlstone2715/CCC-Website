import type { Booking } from "./generated/prisma/client.js";

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

// Emails the booking to Cayman Crane through Resend. Returns false when alerts
// aren't configured or the send fails, so the caller can fall back to email.
export async function sendBookingAlert(booking: Booking): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const ref = bookingRef(booking.id);
  const name = booking.customerName.replace(/[\r\n]+/g, " ");
  const received = booking.createdAt.toLocaleString("en-US", { timeZone: "America/Cayman", dateStyle: "medium", timeStyle: "short" });
  const body = [
    `New booking request ${ref}`,
    `Received ${received} (Cayman time)`,
    "",
    `Signed by: ${booking.signature} (initials ${booking.initials})`,
    "Rental agreement accepted: yes",
    "Payment terms acknowledged: yes",
    "",
    booking.requestText,
    "",
    "Reply to this email to respond to the customer directly.",
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.BOOKING_ALERT_FROM || "Cayman Crane Bookings <onboarding@resend.dev>",
        to: [process.env.BOOKING_ALERT_TO || "caymancrane@gmail.com"],
        reply_to: booking.customerEmail,
        subject: `Booking request ${ref} from ${name}`,
        text: body,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) console.error(`Booking alert for ${ref} failed: ${response.status} ${await response.text()}`);
    return response.ok;
  } catch (error) {
    console.error(`Booking alert for ${ref} failed`, error);
    return false;
  }
}
