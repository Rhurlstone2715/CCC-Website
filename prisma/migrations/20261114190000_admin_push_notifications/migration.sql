CREATE TABLE "AdminPushSubscription" (
 "id" TEXT PRIMARY KEY, "adminId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "endpoint" TEXT NOT NULL UNIQUE, "p256dh" TEXT NOT NULL, "auth" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AdminPushSubscription_adminId_idx" ON "AdminPushSubscription"("adminId");
CREATE TABLE "AdminBookingNotice" (
 "id" SERIAL PRIMARY KEY, "adminId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "bookingId" INTEGER NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
 "readAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE("adminId","bookingId")
);
CREATE INDEX "AdminBookingNotice_adminId_readAt_idx" ON "AdminBookingNotice"("adminId","readAt");
CREATE TABLE "AdminPushDelivery" (
 "noticeId" INTEGER NOT NULL REFERENCES "AdminBookingNotice"("id") ON DELETE CASCADE,
 "subscriptionId" TEXT NOT NULL REFERENCES "AdminPushSubscription"("id") ON DELETE CASCADE,
 "attempts" INTEGER NOT NULL DEFAULT 0, "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "sentAt" TIMESTAMP(3), PRIMARY KEY("noticeId","subscriptionId")
);
CREATE INDEX "AdminPushDelivery_sentAt_nextAttemptAt_idx" ON "AdminPushDelivery"("sentAt","nextAttemptAt");
