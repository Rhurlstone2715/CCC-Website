-- Update only the requested stock count for the existing 36-inch sweeper.
UPDATE "Product" SET "availableQuantity"=2,"updatedAt"=CURRENT_TIMESTAMP WHERE "id"='magnetic-sweeper-36';
-- Add the 17-inch model without replacing existing records or admin edits.
INSERT INTO "Product" ("id","name","category","spec","description","image","rates","availableQuantity","delivery","sortOrder","updatedAt")
SELECT 'magnetic-sweeper-17', '17″ Magnetic Sweeper', 'Tools', 'Toolwiz • 17″ wide • Adjustable handle', 'Compact wheeled magnetic sweeper for collecting nails, screws and small ferrous metal debris around construction sites.', 'assets/catalog/magnetic-sweeper-17.jpg', '{"daily": 6, "weekly": 20}'::jsonb, 1, TRUE, COALESCE(MAX("sortOrder"),0)+1, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
