CREATE TABLE "EnRouteNotification" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "bookingId" INTEGER NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "operator" TEXT, "rigger" TEXT, "recipient" TEXT NOT NULL,
 "etaStart" TIMESTAMP(3) NOT NULL, "etaEnd" TIMESTAMP(3) NOT NULL,
 "sentAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "EnRouteNotification_bookingId_createdAt_idx" ON "EnRouteNotification"("bookingId", "createdAt");
