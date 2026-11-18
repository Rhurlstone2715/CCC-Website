-- Future catalog pricing only; existing bookings and estimates are preserved.
UPDATE "Product" SET "rates"="rates" || '{"daily":900}'::jsonb, "updatedAt"=CURRENT_TIMESTAMP WHERE "id"='flatbed';
INSERT INTO "Product" ("id","name","category","spec","description","image","rates","availableQuantity","delivery","fuelType","sortOrder","updatedAt")
SELECT 'simpson-alh3425', 'Simpson ALH3425 3600 PSI Pressure Washer', 'Tools', '3600 PSI • 2.5 GPM • Honda GX200 • Gasoline', 'Simpson Aluminum Series gasoline pressure washer for pressure cleaning.', 'assets/catalog/simpson-alh3425-cutout.png', '{"daily": 55, "weekly": 275, "monthly": 875}'::jsonb, 1, TRUE, 'gasoline', COALESCE(MAX("sortOrder"),0)+10, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
UNION ALL
SELECT 'simpson-cm61083', 'Simpson Clean Machine CM61083 3400 PSI Pressure Washer', 'Tools', '3400 PSI • 2.5 GPM • CRX engine • Gasoline', 'Simpson Clean Machine gasoline pressure washer for pressure cleaning.', 'assets/catalog/simpson-cm61083-cutout.png', '{"daily": 45, "weekly": 200, "monthly": 750}'::jsonb, 1, TRUE, 'gasoline', COALESCE(MAX("sortOrder"),0)+20, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
