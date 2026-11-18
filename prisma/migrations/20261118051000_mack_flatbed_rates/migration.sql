-- Apply the requested future rates, retaining unmentioned terms and historical bookings.
UPDATE "Product"
SET "rates" = "rates" || CASE WHEN "id" = 'mack-trailer-head'
    THEN '{"daily":675}'::jsonb
    ELSE '{"hourly":125,"daily":850}'::jsonb END,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN ('mack-trailer-head', 'flatbed');
