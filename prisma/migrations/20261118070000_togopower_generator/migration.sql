-- Add the portable gasoline generator without replacing existing records or admin edits.
INSERT INTO "Product" ("id","name","category","spec","description","image","rates","availableQuantity","delivery","fuelType","sortOrder","updatedAt")
SELECT 'togopower-gg8000', 'TogoPower GG8000 Portable Generator — 8,000W Peak', 'Power Generation', '6,500W running • 8,000W peak • Gasoline', 'Portable gasoline generator with a 420cc four-stroke OHV engine, electric start, wheels and a folding handle. Offers 120V and 120/240V outlets. Fuel tank: 6.6 US gallons.', 'assets/catalog/togopower-gg8000.jpg', '{"daily": 50, "weekly": 225}'::jsonb, 1, TRUE, 'gasoline', COALESCE(MAX("sortOrder"),0)+1, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
