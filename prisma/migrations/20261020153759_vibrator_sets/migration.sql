-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "setPart" TEXT;

-- Concrete vibrator shafts and heads only work with the motor, so each motor is rented as a set.
UPDATE "Product" SET "setPart" = 'Shaft' WHERE "id" IN ('wyco-8914', 'wyco-8920');
UPDATE "Product" SET "setPart" = 'Head' WHERE "id" IN ('wyco-750d', 'wyco-750eh');
UPDATE "Product" SET "description" = replace("description", 'Shaft and head rented separately.', 'Rented as a set with one shaft and one head.') WHERE "id" = 'wyco-995';
