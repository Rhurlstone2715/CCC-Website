CREATE TABLE "PaymentReceipt" (
 "id" SERIAL PRIMARY KEY, "bookingId" INTEGER NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
 "key" TEXT NOT NULL UNIQUE, "amountPaidCents" INTEGER NOT NULL, "paidAt" TIMESTAMP(3) NOT NULL,
 "snapshot" JSONB NOT NULL, "pdf" BYTEA NOT NULL, "emailRecipient" TEXT NOT NULL,
 "emailSentAt" TIMESTAMP(3), "emailAttempts" INTEGER NOT NULL DEFAULT 0,
 "nextEmailAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "supersededAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "PaymentReceipt_emailSentAt_nextEmailAttemptAt_idx" ON "PaymentReceipt"("emailSentAt","nextEmailAttemptAt");
CREATE INDEX "PaymentReceipt_bookingId_idx" ON "PaymentReceipt"("bookingId");
