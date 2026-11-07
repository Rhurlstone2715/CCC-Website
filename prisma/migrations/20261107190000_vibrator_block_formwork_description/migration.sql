UPDATE "Product"
SET "description" = rtrim("description") || ' The pencil shaft and heads are the perfect tool for concrete block holes and formwork.'
WHERE "id" = 'wyco-995';
