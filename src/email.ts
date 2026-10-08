// Email goes through Resend's HTTP API (Railway blocks SMTP on Hobby plans).
//
// Without EMAIL_FROM, mail is sent from Resend's shared test sender, which can
// only deliver to the address the Resend account was opened with. That covers
// alerts to Cayman Crane but not mail to customers, so customer emails stay
// off until EMAIL_FROM is set to an address on a domain verified in Resend.

const TEST_SENDER = "Cayman Crane Bookings <onboarding@resend.dev>";

export const COMPANY_EMAIL = process.env.BOOKING_ALERT_TO || "caymancrane@gmail.com";

export function customerEmailsEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

type Email = { to: string; subject: string; text: string; replyTo?: string };

export async function sendEmail({ to, subject, text, replyTo }: Email): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || TEST_SENDER,
        to: [to],
        reply_to: replyTo,
        subject: subject.replace(/[\r\n]+/g, " "),
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) console.error(`Email "${subject}" failed: ${response.status} ${await response.text()}`);
    return response.ok;
  } catch (error) {
    console.error(`Email "${subject}" failed`, error);
    return false;
  }
}
