ALTER TABLE "Product" ADD COLUMN "fuelType" TEXT;
ALTER TABLE "Product" ADD CONSTRAINT "Product_fuelType_check" CHECK ("fuelType" IS NULL OR "fuelType" IN ('diesel','gasoline'));
ALTER TABLE "Booking" ADD COLUMN "rentalCollection" TEXT;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_rentalCollection_check" CHECK ("rentalCollection" IS NULL OR "rentalCollection" IN ('delivery','pickup'));
UPDATE "Product" SET "fuelType"='diesel' WHERE "id" IN ('rt890e','rt175','rt40','rt635c','national1400','altec2595','gth1056','gth844','gth636','diesel-mixer-9-cu-ft','g100','g25');
UPDATE "Product" SET "fuelType"='gasoline' WHERE "id"='compressor';
UPDATE "Product" SET "delivery"=true WHERE "category" IN ('Tools','Power Generation','Attachments','Construction Plant / Equipment','Ground Protection') AND "setPart" IS NULL AND NOT "operatorService";
