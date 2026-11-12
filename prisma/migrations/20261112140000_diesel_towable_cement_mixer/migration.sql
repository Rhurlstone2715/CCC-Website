-- Add the approved diesel mixer to existing rental catalogs without overwriting admin edits.
-- Empty databases use catalog-seed.json, which contains the mixer and the complete original catalog.
INSERT INTO "Product" ("id", "name", "category", "spec", "description", "image", "rates", "availableQuantity", "sortOrder", "updatedAt")
SELECT 'diesel-mixer-9-cu-ft', '9 cu ft Towable Cement Mixer (Diesel Powered)', 'Tools', '9 cu ft drum • Diesel powered • Pintle hitch', 'Towable, diesel-powered cement mixer with a 9 cu ft drum and pintle hitch.', 'assets/catalog/diesel-towable-cement-mixer-9-cu-ft.webp', '{"daily": 40, "weekly": 175, "monthly": 600}'::jsonb, 2,
 COALESCE(MAX("sortOrder") FILTER (WHERE "category"='Tools'), MAX("sortOrder"), 0) + 10, CURRENT_TIMESTAMP
FROM "Product"
HAVING COUNT(*) > 0
ON CONFLICT ("id") DO NOTHING;
