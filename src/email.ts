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

type Email = { attachments?: { filename: string; content: string }[]; to: string; subject: string; text: string; html?: string; idempotencyKey?: string; replyTo?: string };

const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function brandedEmailHtml(text:string,html?:string){
 const footer=`<table role="presentation" style="margin-top:24px;border-top:1px solid #ddd;padding-top:16px;font-family:Arial,sans-serif"><tr><td style="padding-right:14px"><img src="https://www.caymancrane.com/assets/ccc-icon-192.png" width="64" height="64" alt="Cayman Crane hook logo" style="display:block"></td><td><strong>Cayman Crane Company</strong><br>Services · Rentals · Rigging<br><a href="tel:+13459160816">(345) 916-0816</a><br><a href="https://www.caymancrane.com">www.caymancrane.com</a></td></tr></table>`;
 if(html)return /<\/body>/i.test(html)?html.replace(/<\/body>/i,footer+'</body>'):html+footer;
 const content=escapeHtml(text).replace(/https?:\/\/[^\s<>]+/g,url=>`<a href="${url}">${url}</a>`);
 return `<!doctype html><html><body style="font:15px/1.6 Arial,sans-serif;color:#222"><div style="white-space:pre-wrap">${content}</div>${footer}</body></html>`;
}

export async function sendEmail({ to, subject, text, html, idempotencyKey, replyTo, attachments }: Email): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || TEST_SENDER,
        to: [to],
        reply_to: replyTo,
        subject: subject.replace(/[\r\n]+/g, " "),
        text,
        ...(attachments ? { attachments } : {}),
        html: brandedEmailHtml(text,html),
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
