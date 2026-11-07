-- ICF bracing is offered only at CI$2 per day. Existing bookings retain their saved prices.
UPDATE "Product"
SET "rates" = '{"daily":2}'::jsonb
WHERE "id" = 'plumwall';
