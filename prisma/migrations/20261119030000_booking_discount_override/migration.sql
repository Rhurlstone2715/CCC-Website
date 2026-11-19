ALTER TABLE "Booking" ADD COLUMN "loyaltyDiscountOverrideCents" INTEGER;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_loyaltyDiscountOverrideCents_check" CHECK ("loyaltyDiscountOverrideCents" IS NULL OR "loyaltyDiscountOverrideCents">=0);
