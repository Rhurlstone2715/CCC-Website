import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { FC } from "hono/jsx";
import { type AppEnv, currentUser, mustConfirmEmail, requireCustomer } from "./auth.js";
import { bookingRef } from "./bookings.js";
import { prisma } from "./db.js";
import { caymanDate } from "./views/layout.js";

export const paymentProofMetadata = { id: true, fileName: true, size: true, contentType: true, createdAt: true } as const;
type ProofMetadata = { id: string; fileName: string; size: number; contentType: string; createdAt: Date };
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 5;

export const PaymentProofSection: FC<{ bookingId: number; proofs: ProofMetadata[]; customer?: boolean }> = ({ bookingId, proofs, customer = false }) => (
  <div class="payment-proofs">
    <p class="hint">{customer ? "Upload your electronic transfer receipt or payment screenshot here. Proof is private to you and Cayman Crane admins. An admin must verify the payment before your booking is marked paid." : "Customer payment documents are private. Review the proof and confirm funds were received before marking this booking paid."}</p>
    {proofs.length ? <ul class="proof-list">{proofs.map(proof => <li><a class="text-link" href={`/account/bookings/${bookingId}/payment-proofs/${proof.id}`}>Download {proof.fileName}</a><small class="sub">{caymanDate(proof.createdAt)} · {Math.ceil(proof.size / 1024)} KB</small></li>)}</ul> : <p class="muted">No proof of payment uploaded yet.</p>}
    {customer && proofs.length < MAX_FILES ? <form class="form proof-upload" method="post" action={`/account/bookings/${bookingId}/payment-proofs`} enctype="multipart/form-data">
      <div class="field"><label for={`proof-${bookingId}`}>Payment receipt or screenshot</label><input id={`proof-${bookingId}`} name="proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" required aria-describedby={`proof-help-${bookingId}`} /><small class="hint" id={`proof-help-${bookingId}`}>JPEG, PNG, WebP or PDF. Maximum 5 MB per file; up to 5 files per booking.</small></div>
      <button class="button secondary small" type="submit">Upload proof of payment</button>
    </form> : customer ? <p class="hint">This booking has reached the 5-file limit. Contact Cayman Crane if you need to submit further documents.</p> : null}
  </div>
);

function contentType(bytes: Uint8Array): string | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts(0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a)) return "image/png";
  if (starts(0xff,0xd8,0xff)) return "image/jpeg";
  if (starts(0x52,0x49,0x46,0x46) && bytes[8]===0x57 && bytes[9]===0x45 && bytes[10]===0x42 && bytes[11]===0x50) return "image/webp";
  if (starts(0x25,0x50,0x44,0x46,0x2d)) return "application/pdf";
  return null;
}
export const paymentProofs = new Hono<AppEnv>();
paymentProofs.use("*", requireCustomer);
paymentProofs.post("/:id{[0-9]+}/payment-proofs", bodyLimit({ maxSize: MAX_BYTES + 256 * 1024, onError: c => c.redirect(`/account/profile?notice=proof-too-large&booking=${c.req.param("id")}#booking-${c.req.param("id")}`) }), async c => {
  const user = (await currentUser(c))!;
  const id = Number(c.req.param("id"));
  const back = (notice: string) => c.redirect(`/account/profile?notice=${notice}&booking=${id}#booking-${id}`);
  if (mustConfirmEmail(user)) return back("proof-confirm-email");
  const booking = await prisma.booking.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!booking) return c.notFound();
  let body;
  try { body = await c.req.parseBody(); } catch { return back("proof-invalid"); }
  const file = body.proof;
  if (!(file instanceof File) || file.size === 0) return back("proof-invalid");
  if (file.size > MAX_BYTES) return back("proof-too-large");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = contentType(bytes);
  if (!type) return back("proof-invalid");
  const fileName = file.name.replace(/.*[\\/]/, "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0,120) || "Payment receipt";
  const result = await prisma.$transaction(async tx => {
    // Serialize uploads per booking so simultaneous submissions cannot exceed the cap.
    await tx.$queryRaw`SELECT "id" FROM "Booking" WHERE "id"=${id} FOR UPDATE`;
    if (!(await tx.booking.findFirst({ where: { id, userId: user.id }, select: { id: true } }))) return "missing";
    if (await tx.paymentProof.count({ where: { bookingId: id } }) >= MAX_FILES) return "proof-limit";
    await tx.paymentProof.create({ data: { bookingId: id, uploadedById: user.id, fileName, contentType: type, size: bytes.length, data: bytes } });
    return "proof-uploaded";
  });
  return result === "missing" ? c.notFound() : back(result);
});
paymentProofs.get("/:id{[0-9]+}/payment-proofs/:proofId{[a-z0-9]+}", async c => {
  const user = (await currentUser(c))!;
  if (mustConfirmEmail(user)) return c.text("Confirm your email before viewing payment documents.",403);
  const proof = await prisma.paymentProof.findFirst({ where: { id: c.req.param("proofId"), bookingId: Number(c.req.param("id")), ...(user.role === "ADMIN" ? {} : { booking: { userId: user.id } }) } });
  if (!proof) return c.notFound();
  const extension = {"image/jpeg":"jpg","image/png":"png","image/webp":"webp","application/pdf":"pdf"}[proof.contentType] || "bin";
  c.header("Content-Type",proof.contentType);
  c.header("Content-Length",String(proof.size));
  c.header("Cache-Control","private, no-store");
  c.header("X-Content-Type-Options","nosniff");
  c.header("Content-Security-Policy","sandbox; default-src 'none'");
  c.header("Content-Disposition",`attachment; filename="${bookingRef(proof.bookingId)}-payment-proof-${proof.id}.${extension}"`);
  return c.body(new Uint8Array(proof.data));
});
