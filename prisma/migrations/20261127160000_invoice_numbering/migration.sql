ALTER TABLE "FinalInvoice" ADD COLUMN "number" INTEGER;
WITH numbered AS (SELECT "id", 6906 + ROW_NUMBER() OVER (ORDER BY "id") AS n FROM "FinalInvoice")
UPDATE "FinalInvoice" i SET "number"=numbered.n FROM numbered WHERE i."id"=numbered."id";
ALTER TABLE "FinalInvoice" ALTER COLUMN "number" SET NOT NULL;
CREATE UNIQUE INDEX "FinalInvoice_number_key" ON "FinalInvoice"("number");
CREATE TABLE "InvoiceCounter" ("id" INTEGER PRIMARY KEY, "lastNumber" INTEGER NOT NULL);
INSERT INTO "InvoiceCounter" ("id","lastNumber") SELECT 1,COALESCE(MAX("number"),6906) FROM "FinalInvoice";
