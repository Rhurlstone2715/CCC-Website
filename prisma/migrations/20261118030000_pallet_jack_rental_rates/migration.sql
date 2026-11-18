-- Apply the requested pallet jack rates to existing catalogs. New catalogs use the seed.
UPDATE "Product"
SET "rates" = '{"daily":25,"weekly":100,"monthly":350}'::jsonb,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'palletjacks';
