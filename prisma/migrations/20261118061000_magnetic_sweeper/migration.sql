-- Add magnetic sweeper without replacing existing catalog records or admin edits.
INSERT INTO "Product" ("id","name","category","spec","description","image","rates","availableQuantity","delivery","sortOrder","updatedAt")
SELECT 'magnetic-sweeper-36', '36″ Magnetic Sweeper', 'Tools', 'VEVOR • 36″ wide • Telescoping handle', 'Wheeled push-type magnetic sweeper for collecting nails, screws and other ferrous metal debris around construction sites.', 'assets/catalog/magnetic-sweeper-36.jpg', '{"daily": 10, "weekly": 40}'::jsonb, 1, TRUE, COALESCE(MAX("sortOrder"),0)+1, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
