ALTER TABLE "User" ADD COLUMN "phoneKey" TEXT;
CREATE FUNCTION ccc_phone_key(phone TEXT) RETURNS TEXT LANGUAGE SQL IMMUTABLE AS $$
  WITH raw AS (SELECT regexp_replace(phone, '[^0-9]', '', 'g') AS d),
  normalized AS (SELECT CASE WHEN d LIKE '00%' THEN substr(d,3) ELSE d END AS d FROM raw)
  SELECT CASE WHEN length(d)=7 THEN '1345'||d WHEN length(d)=10 THEN '1'||d ELSE NULLIF(d,'') END FROM normalized
$$;
-- Preserve historical duplicate accounts without deleting customer or booking data.
-- New registrations and phone edits cannot reuse any existing number.
UPDATE "User" u SET "phoneKey"=ccc_phone_key(u."phone")
WHERE ccc_phone_key(u."phone") IS NOT NULL
AND (SELECT count(*) FROM "User" other WHERE ccc_phone_key(other."phone")=ccc_phone_key(u."phone"))=1;
CREATE UNIQUE INDEX "User_phoneKey_key" ON "User"("phoneKey");
CREATE FUNCTION ccc_check_user_phone() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW."phoneKey" := ccc_phone_key(NEW."phone");
  IF NEW."phoneKey" IS NOT NULL AND EXISTS(SELECT 1 FROM "User" u WHERE u."id"<>NEW."id" AND ccc_phone_key(u."phone")=NEW."phoneKey") THEN
    RAISE EXCEPTION 'phone_already_registered' USING ERRCODE='23505', CONSTRAINT='User_phoneKey_key';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER ccc_unique_user_phone BEFORE INSERT OR UPDATE OF "phone" ON "User" FOR EACH ROW EXECUTE FUNCTION ccc_check_user_phone();
-- Old pending sessions must also prove mailbox ownership before accessing the site.
DELETE FROM "Session" WHERE "userId" IN (SELECT id FROM "User" WHERE "role"='CUSTOMER' AND "emailVerifiedAt" IS NULL);
DELETE FROM "AccountEmail" WHERE "kind"='SIGNUP' AND "sentAt" IS NULL AND "userId" IN (SELECT id FROM "User" WHERE "emailVerifiedAt" IS NULL);
