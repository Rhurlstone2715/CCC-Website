ALTER TABLE "Booking" ADD COLUMN "billingAddress" TEXT, ADD COLUMN "jobDetails" TEXT;
CREATE TABLE "EstimateCounter" ("id" INTEGER PRIMARY KEY DEFAULT 1, "lastNumber" INTEGER NOT NULL DEFAULT 523, CONSTRAINT "EstimateCounter_singleton" CHECK ("id"=1));
INSERT INTO "EstimateCounter" ("id","lastNumber") VALUES (1,523);
CREATE TABLE "Estimate" (
 "number" INTEGER PRIMARY KEY,
 "bookingId" INTEGER NOT NULL UNIQUE,
 "snapshot" JSONB NOT NULL,
 "totalCents" INTEGER,
 "pdf" BYTEA NOT NULL,
 "emailRecipient" TEXT NOT NULL,
 "emailSentAt" TIMESTAMP(3),
 "emailAttempts" INTEGER NOT NULL DEFAULT 0,
 "nextEmailAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Estimate_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Estimate_emailSentAt_nextEmailAttemptAt_idx" ON "Estimate"("emailSentAt","nextEmailAttemptAt");
