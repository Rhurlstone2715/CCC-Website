ALTER TABLE "Estimate" ADD COLUMN "emailSuppressed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PaymentReceipt" ADD COLUMN "emailSuppressed" BOOLEAN NOT NULL DEFAULT false;
