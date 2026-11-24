CREATE TABLE "RentalReminder" (
 "id" TEXT NOT NULL, "key" TEXT NOT NULL, "bookingId" INTEGER NOT NULL,
 "kind" TEXT NOT NULL, "endDate" DATE NOT NULL, "recipient" TEXT NOT NULL,
 "dueAt" TIMESTAMP(3) NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
 "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "attempts" INTEGER NOT NULL DEFAULT 0, "sentAt" TIMESTAMP(3), "cancelledAt" TIMESTAMP(3),
 "subject" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "RentalReminder_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "RentalReminder_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "RentalReminder_key_key" ON "RentalReminder"("key");
CREATE INDEX "RentalReminder_sentAt_cancelledAt_dueAt_idx" ON "RentalReminder"("sentAt","cancelledAt","dueAt");
CREATE INDEX "RentalReminder_bookingId_idx" ON "RentalReminder"("bookingId");
ALTER TABLE "Booking" ADD COLUMN "rentalReturnedAt" TIMESTAMP(3);
