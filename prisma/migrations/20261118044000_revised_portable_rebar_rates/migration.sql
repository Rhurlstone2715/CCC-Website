-- Apply revised portable cutter rates for future bookings only.
UPDATE "Product"
SET "rates" = '{"daily":45,"weekly":180,"monthly":675}'::jsonb,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'handheld-rebar';
