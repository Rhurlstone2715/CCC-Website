-- Add the selected stone clamp without replacing existing records or admin edits.
INSERT INTO "Product" ("id","name","category","spec","description","image","rates","availableQuantity","delivery","sortOrder","updatedAt")
SELECT 'gryvoze-stone-lifting-clamp', 'GRYVOZE Stone Lifting Clamp — GSLC-F800', 'Attachments', '1,763 lb / 800 kg • 14–35″ opening', 'Adjustable stone lifting clamp for granite, marble, concrete blocks and curb stones. Rental rate is per clamp.', 'assets/catalog/gryvoze-stone-lifting-clamp-cutout.png', '{"daily": 15, "weekly": 60}'::jsonb, 1, TRUE, COALESCE(MAX("sortOrder"),0)+1, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
