-- Add two separately rentable plate clamps without replacing catalog records or admin edits.
INSERT INTO "Product" ("id","name","category","spec","description","image","rates","availableQuantity","delivery","sortOrder","updatedAt")
SELECT 'karryton-vertical-plate-clamp', 'KARRYTON 2-Ton Vertical Plate Lifting Clamp', 'Attachments', '2 ton / 4,400 lb • Vertical plate clamp • Per piece', 'Vertical steel plate lifting clamp, rented per piece. Select the quantity needed for your lift.', 'assets/catalog/karryton-vertical-plate-clamp-cutout.png', '{"daily": 10, "weekly": 40}'::jsonb, 2, TRUE, COALESCE(MAX("sortOrder"),0)+1, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
