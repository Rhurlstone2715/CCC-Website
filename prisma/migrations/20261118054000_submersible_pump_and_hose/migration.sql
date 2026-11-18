-- Add pump and hose without replacing existing catalog records or admin edits.
INSERT INTO "Product" ("id","name","category","spec","description","image","rates","availableQuantity","delivery","needsPower","addOns","sortOrder","updatedAt")
SELECT 'multiquip-st2047', 'Multiquip ST2047 2″ Submersible Pump', 'Tools', '2″ outlet • Electric • 110 V • Up to 87 GPM', 'Portable electric submersible water pump. Maximum head: 47 ft. Discharge hose rented separately.', 'assets/catalog/multiquip-st2047.jpg', '{"daily": 40, "weekly": 185, "monthly": 650}'::jsonb, 1, TRUE, TRUE, ARRAY['discharge-hose-2in']::text[], COALESCE(MAX("sortOrder"),0)+10, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
UNION ALL
SELECT 'discharge-hose-2in', '2″ Discharge Hose', 'Tools', '2″ discharge hose', 'Discharge hose for water pumping applications. Rented separately from the pump.', 'assets/catalog/discharge-hose-2in.jpg', '{"daily": 5, "weekly": 20, "monthly": 75}'::jsonb, 1, TRUE, FALSE, ARRAY[]::text[], COALESCE(MAX("sortOrder"),0)+20, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
