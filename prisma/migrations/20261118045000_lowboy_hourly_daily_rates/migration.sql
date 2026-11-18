-- Update requested lowboy terms only; preserve other terms and existing booking prices.
UPDATE "Product"
SET "rates" = "rates" || '{"hourly":175,"daily":1350}'::jsonb,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'lowboy';
