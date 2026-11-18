-- Add a complete drum-lifter assembly without replacing records or admin edits.
INSERT INTO "Product" ("id","name","category","spec","description","image","rates","availableQuantity","delivery","sortOrder","updatedAt")
SELECT 'ironwalls-chain-drum-lifter', 'IRONWALLS Chain Drum Lifter — 1 Ton', 'Attachments', '1-ton capacity • 30–55 gallon drums • Two-hook assembly', 'Complete two-hook chain drum lifting assembly for compatible sealed metal or plastic drums. Not for plastic drums with clamp-on lids. Drum not included.', 'assets/catalog/ironwalls-chain-drum-lifter-cutout.png', '{"daily": 5, "weekly": 20}'::jsonb, 1, TRUE, COALESCE(MAX("sortOrder"),0)+1, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
