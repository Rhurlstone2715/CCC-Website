-- Add concrete finishing tools without replacing admin-managed catalog entries.
-- Empty databases receive the complete catalog seed instead.
INSERT INTO "Product" ("id", "name", "category", "spec", "description", "image", "rates", "delivery", "sortOrder", "updatedAt")
SELECT 'concrete-jitter-bug', 'Concrete Jitter Bug', 'Tools', 'Manual concrete tamper', 'Manual concrete jitter bug for tamping freshly placed concrete and working coarse aggregate below the surface before finishing.', 'assets/catalog/concrete-jitter-bug.jpg', '{"daily": 20, "weekly": 80, "monthly": 350}'::jsonb, true,
 COALESCE(MAX("sortOrder") FILTER (WHERE "category"='Tools'), MAX("sortOrder"), 0) + 10, CURRENT_TIMESTAMP
FROM "Product"
HAVING COUNT(*) > 0
UNION ALL
SELECT 'concrete-bull-float', 'Concrete Bull Float', 'Tools', 'Concrete finishing float with extension handles', 'Manual bull float with extension handles for leveling and smoothing freshly placed concrete.', 'assets/catalog/concrete-bull-float.jpg', '{"daily": 25, "weekly": 100, "monthly": 350}'::jsonb, true,
 COALESCE(MAX("sortOrder") FILTER (WHERE "category"='Tools'), MAX("sortOrder"), 0) + 20, CURRENT_TIMESTAMP
FROM "Product"
HAVING COUNT(*) > 0
ON CONFLICT ("id") DO NOTHING;
