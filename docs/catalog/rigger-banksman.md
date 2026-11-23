# Rigger/Banksman — 23 November 2026

Approved rates: CI$50 hourly / CI$315 daily. No weekly or monthly rate supplied. Labour service, so no stock count and no delivery.

Product.category is "Operator Service" with operatorService: true, the same booking flags as the telehandler operator: operator subtotal line, excluded from rewards discounts, no delivery. Unlike the hidden telehandler-operator add-on, this item is visible and bookable on its own. Browse layout gains an "Operator Service" group (presentation only); itemsFor() now admits non-hidden operator services, so the hidden telehandler operator stays out of browse and search.

Image: supplied render (rigger hooking chains to a beam under a crane hook, black background), re-encoded at native 1428×1101 without upscaling or cutout.

Idempotent migration 20261123090000_rigger_banksman inserts the product only into already-populated catalogs and never overwrites admin edits. Fresh databases get it from catalog-seed.json.
