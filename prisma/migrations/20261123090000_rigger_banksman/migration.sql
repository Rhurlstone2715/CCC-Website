-- Add the visible Rigger/Banksman labour service without replacing existing records or admin edits.
INSERT INTO "Product" ("id","name","category","spec","description","image","photo","operatorService","rates","delivery","hidden","sortOrder","updatedAt")
SELECT 'rigger-banksman', 'Rigger/Banksman', 'Operator Service', 'Hourly or daily labour service', 'Rigger/banksman service for lifting work.', 'assets/catalog/rigger-banksman.jpg', TRUE, TRUE, '{"hourly":50,"daily":315}'::jsonb, FALSE, FALSE, COALESCE(MAX("sortOrder"),0)+1, CURRENT_TIMESTAMP FROM "Product" HAVING COUNT(*)>0
ON CONFLICT ("id") DO NOTHING;
