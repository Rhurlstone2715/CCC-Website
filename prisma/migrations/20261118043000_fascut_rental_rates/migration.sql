-- Apply the approved future FASCUT rental rates without rewriting saved bookings.
UPDATE "Product"
SET "rates" = CASE WHEN "id" = 'fr800c'
    THEN '{"daily":120,"weekly":500,"monthly":1750}'::jsonb
    ELSE '{"daily":75,"weekly":300,"monthly":1000}'::jsonb END,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN ('fr800c', 'fs600');
