-- Reuse each customer's most recently supplied billing address, never another staff member's.
UPDATE "User" AS u SET "billingAddress" = previous."billingAddress"
FROM (
  SELECT DISTINCT ON ("userId") "userId", "billingAddress"
  FROM "Booking"
  WHERE "userId" IS NOT NULL AND "billingAddress" IS NOT NULL AND btrim("billingAddress") <> ''
  ORDER BY "userId", "createdAt" DESC, id DESC
) AS previous
WHERE u.id = previous."userId" AND u."billingAddress" IS NULL;
