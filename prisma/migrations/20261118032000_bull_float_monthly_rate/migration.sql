-- Update only the Bull Float monthly rate; retain other terms and saved booking prices.
UPDATE "Product"
SET "rates" = jsonb_set("rates", '{monthly}', '375'::jsonb), "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'concrete-bull-float';
