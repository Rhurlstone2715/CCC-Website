ALTER TABLE "Company" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN "archivedDetails" JSONB;
-- Remove the exact company A from active use while retaining its booking/loyalty history.
UPDATE "User" SET "companyAccountId" = NULL, "company" = NULL
WHERE "companyAccountId" IN (SELECT "id" FROM "Company" WHERE lower(trim("name")) = 'a');
UPDATE "Company" SET
  "archivedAt" = CURRENT_TIMESTAMP,
  "archivedDetails" = jsonb_build_object('nameKey', "nameKey", 'domain', "domain", 'ownerEmail', "ownerEmail"),
  "nameKey" = 'archived-company-' || "id"::text,
  "domain" = NULL,
  "ownerEmail" = 'archived-company-' || "id"::text || '@invalid.invalid'
WHERE lower(trim("name")) = 'a';
