ALTER TABLE "Booking" ADD COLUMN "adminEditedAt" TIMESTAMP(3);
CREATE TABLE "BookingRevision" (
 "id" SERIAL PRIMARY KEY,"bookingId" INTEGER NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
 "actorId" INTEGER NOT NULL,"actorName" TEXT NOT NULL,"reason" TEXT NOT NULL,"before" JSONB NOT NULL,"after" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "BookingRevision_bookingId_createdAt_idx" ON "BookingRevision"("bookingId","createdAt");
CREATE TABLE "EstimateArchive" (
 "number" INTEGER PRIMARY KEY,"bookingId" INTEGER NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
 "snapshot" JSONB NOT NULL,"totalCents" INTEGER,"pdf" BYTEA NOT NULL,"emailRecipient" TEXT NOT NULL,
 "originalCreatedAt" TIMESTAMP(3) NOT NULL,"archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "EstimateArchive_bookingId_idx" ON "EstimateArchive"("bookingId");
