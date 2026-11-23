-- Owner confirmed the existing rt40 listing is a P&H Omega 40.
-- Keep the product ID, stock, prices and all booking/document snapshots intact.
UPDATE "Product" SET "name" = 'P&H Omega 40', "spec" = '40 ton • 106'' main boom', "chart" = 'assets/load-charts/ph-omega-40.pdf' WHERE "id" = 'rt40';
