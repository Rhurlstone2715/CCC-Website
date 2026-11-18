-- Add the approved 100 ft cord without changing existing cords or admin edits.
INSERT INTO "Product" ("id","name","category","spec","description","image","rates","availableQuantity","delivery","sortOrder","updatedAt")
SELECT 'lifesupply-100ft-10-3-cord', 'LifeSupplyUSA 100 ft 10/3 Extension Cord', 'Power Generation', '100 ft • 10/3 • Grounded indoor/outdoor cord', 'Heavy-duty 100 ft extension cord with grounded three-prong plugs for indoor and outdoor use.', 'assets/catalog/lifesupply-100ft-10-3-cord.jpg', '{"daily":6,"weekly":18}'::jsonb, 1, TRUE, COALESCE(MAX("sortOrder"),0)+1, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
