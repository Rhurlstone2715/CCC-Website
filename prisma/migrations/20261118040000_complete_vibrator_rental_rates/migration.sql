-- Price the motor, selected shaft and selected head as one complete rental.
-- Included component records keep individual inventory and compatibility tracking.
-- Existing bookings retain their stored prices and estimate/receipt snapshots.
UPDATE "Product"
SET "rates" = CASE WHEN "id" = 'wyco-995'
    THEN '{"daily":35,"weekly":150,"monthly":500}'::jsonb
    ELSE '{"daily":0,"weekly":0,"monthly":0}'::jsonb END,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN ('wyco-995', 'wyco-8914', 'wyco-8920', 'wyco-750d', 'wyco-750eh');
