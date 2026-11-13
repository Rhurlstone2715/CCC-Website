CREATE TABLE "PaymentProof" (
  "id" TEXT NOT NULL,
  "bookingId" INTEGER NOT NULL,
  "uploadedById" INTEGER NOT NULL,
  "fileName" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "data" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentProof_size_check" CHECK ("size" > 0 AND "size" <= 5242880),
  CONSTRAINT "PaymentProof_contentType_check" CHECK ("contentType" IN ('image/jpeg','image/png','image/webp','application/pdf'))
);
CREATE INDEX "PaymentProof_bookingId_createdAt_idx" ON "PaymentProof"("bookingId", "createdAt");
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
