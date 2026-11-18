-- Update the portable handheld cutter only. Existing bookings keep their stored prices.
UPDATE "Product"
SET "rates" = '{"daily":40,"weekly":200,"monthly":750}'::jsonb,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'handheld-rebar';
