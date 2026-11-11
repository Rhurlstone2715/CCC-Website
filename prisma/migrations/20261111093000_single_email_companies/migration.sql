ALTER TABLE "Company" ALTER COLUMN "domain" DROP NOT NULL;
ALTER TABLE "Company" ADD COLUMN "ownerEmail" TEXT;
CREATE UNIQUE INDEX "Company_ownerEmail_key" ON "Company"("ownerEmail");
ALTER TABLE "Company" ADD CONSTRAINT "Company_membership_type_check" CHECK (("domain" IS NOT NULL AND "ownerEmail" IS NULL) OR ("domain" IS NULL AND "ownerEmail" IS NOT NULL));
