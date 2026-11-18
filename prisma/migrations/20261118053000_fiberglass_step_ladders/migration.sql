-- Add ladders without replacing existing catalog records or subsequent admin edits.
INSERT INTO "Product" ("id","name","category","spec","description","image","rates","availableQuantity","delivery","sortOrder","updatedAt")
SELECT 'fiberglass-step-ladder-12ft', '12'' Fiberglass Step Ladder', 'Tools', '12 ft • Orange fiberglass • Step ladder', 'Orange fiberglass 12-foot step ladder.', 'assets/catalog/fiberglass-step-ladder-12ft.png', '{"daily": 25, "weekly": 100, "monthly": 375}'::jsonb, 1, TRUE, COALESCE(MAX("sortOrder"),0)+10, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
UNION ALL
SELECT 'fiberglass-step-ladder-8ft', '8'' Fiberglass Step Ladder', 'Tools', '8 ft • Orange fiberglass • Step ladder', 'Orange fiberglass 8-foot step ladder.', 'assets/catalog/fiberglass-step-ladder-8ft.png', '{"daily": 20, "weekly": 80, "monthly": 300}'::jsonb, 1, TRUE, COALESCE(MAX("sortOrder"),0)+20, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
UNION ALL
SELECT 'fiberglass-step-ladder-6ft', '6'' Fiberglass Step Ladder', 'Tools', '6 ft • Orange fiberglass • Step ladder', 'Orange fiberglass 6-foot step ladder.', 'assets/catalog/fiberglass-step-ladder-6ft.png', '{"daily": 15, "weekly": 65, "monthly": 275}'::jsonb, 1, TRUE, COALESCE(MAX("sortOrder"),0)+30, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
