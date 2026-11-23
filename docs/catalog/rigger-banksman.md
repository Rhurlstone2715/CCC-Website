# Rigger/Banksman — 23 November 2026

Approved rates: CI$50 hourly / CI$315 daily. No weekly or monthly rate supplied. Labour service, so no stock count and no delivery.

Product.category is "Rigging Services", a new category distinct from "Lifting/Rigging Gear", with operatorService: true so booking still uses the labour flags (operator subtotal line, excluded from rewards discounts, no delivery). Unlike the hidden telehandler-operator add-on, this item is visible and bookable on its own. Browse layout gains a "Rigging Services" group (id rigging-services, ?category=rigging-services) mapped from that backend category; itemsFor() admits non-hidden operator services, so the hidden telehandler operator stays out of browse and search.

Image: supplied render (rigger hooking chains to a beam under a crane hook, black background), re-encoded at native 1428×1101 without upscaling or cutout.

Idempotent migration 20261123090000_rigger_banksman inserts the product only into already-populated catalogs and never overwrites admin edits. Fresh databases get it from catalog-seed.json.
