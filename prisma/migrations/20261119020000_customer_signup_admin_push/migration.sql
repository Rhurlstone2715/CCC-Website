ALTER TABLE "AdminBookingNotice" ALTER COLUMN "bookingId" DROP NOT NULL;
ALTER TABLE "AdminBookingNotice" ADD COLUMN "customerId" INTEGER;
ALTER TABLE "AdminBookingNotice" ADD CONSTRAINT "AdminBookingNotice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminBookingNotice" ADD CONSTRAINT "AdminBookingNotice_one_event" CHECK (("bookingId" IS NOT NULL)::int + ("customerId" IS NOT NULL)::int = 1);
CREATE UNIQUE INDEX "AdminBookingNotice_adminId_customerId_key" ON "AdminBookingNotice"("adminId","customerId");
