-- Set the customer-confirmed stock quantities without changing rental rates or existing bookings.
UPDATE "Product"
SET "availableQuantity" = 3, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN ('concrete-jitter-bug', 'concrete-bull-float');
