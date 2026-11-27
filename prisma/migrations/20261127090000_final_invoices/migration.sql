CREATE TABLE "FinalInvoice" (
 "id" SERIAL PRIMARY KEY, "bookingId" INTEGER NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "bookingVersion" TIMESTAMP(3) NOT NULL, "snapshot" JSONB NOT NULL, "pdf" BYTEA NOT NULL,
 "totalCents" INTEGER NOT NULL, "amountPaidCents" INTEGER NOT NULL, "emailRecipient" TEXT NOT NULL,
 "emailSentAt" TIMESTAMP(3), "emailAttempts" INTEGER NOT NULL DEFAULT 0, "nextEmailAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "supersededAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "FinalInvoice_bookingId_bookingVersion_key" ON "FinalInvoice"("bookingId","bookingVersion");
CREATE INDEX "FinalInvoice_emailSentAt_nextEmailAttemptAt_idx" ON "FinalInvoice"("emailSentAt","nextEmailAttemptAt");
