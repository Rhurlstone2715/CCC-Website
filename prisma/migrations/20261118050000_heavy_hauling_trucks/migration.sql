-- Add heavy hauling vehicles without replacing existing catalog records or admin edits.
-- Empty databases receive the complete seed catalog instead.
INSERT INTO "Product" ("id", "name", "category", "spec", "description", "image", "rates", "availableQuantity", "sortOrder", "updatedAt")
SELECT 'mack-trailer-head', 'Mack Trailer Head', 'Heavy Hauling', 'Trailer head • Heavy hauling', 'Mack trailer head for heavy hauling and transport services. Share your load and route details when booking.', 'assets/catalog/mack-trailer-head-cutout.png', '{"hourly": 90, "daily": 750}'::jsonb, 1,
 COALESCE(MAX("sortOrder") FILTER (WHERE "category"='Heavy Hauling'), MAX("sortOrder"), 0) + 10, CURRENT_TIMESTAMP
FROM "Product"
HAVING COUNT(*) > 0
UNION ALL
SELECT 'ford-f450-dump-flatbed', 'Ford F-450 Flatbed with Dumping Bed', 'Heavy Hauling', 'Flatbed truck • Dumping bed', 'Ford F-450 flatbed with a dumping bed for transporting and unloading materials. Share your load, route and site requirements when booking.', 'assets/catalog/ford-f450-dump-flatbed-cutout.png', '{"hourly": 60, "daily": 495}'::jsonb, 1,
 COALESCE(MAX("sortOrder") FILTER (WHERE "category"='Heavy Hauling'), MAX("sortOrder"), 0) + 20, CURRENT_TIMESTAMP
FROM "Product"
HAVING COUNT(*) > 0
UNION ALL
SELECT 'ford-f550-dump-flatbed', 'Ford F-550 Flatbed with Dumping Bed', 'Heavy Hauling', 'Flatbed truck • Dumping bed', 'Ford F-550 flatbed with a dumping bed for transporting and unloading materials. Share your load, route and site requirements when booking.', 'assets/catalog/ford-f550-dump-flatbed-cutout.png', '{"hourly": 60, "daily": 495}'::jsonb, 1,
 COALESCE(MAX("sortOrder") FILTER (WHERE "category"='Heavy Hauling'), MAX("sortOrder"), 0) + 30, CURRENT_TIMESTAMP
FROM "Product"
HAVING COUNT(*) > 0
ON CONFLICT ("id") DO NOTHING;
