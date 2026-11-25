UPDATE "Product" SET "image" = 'assets/catalog/rigger-banksman.png', "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'rigger-banksman' AND "image" IN ('assets/catalog/rigger-banksman.jpg', '/assets/catalog/rigger-banksman.jpg');
