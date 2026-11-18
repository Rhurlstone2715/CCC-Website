# Heavy Hauling vehicle additions

| Vehicle | Hourly KYD | Daily KYD |
| --- | ---: | ---: |
| Mack Trailer Head | 90 | 675 |
| Ford F-450 Flatbed with Dumping Bed | 60 | 495 |
| Ford F-550 Flatbed with Dumping Bed | 60 | 495 |

Each new vehicle has one stock unit and uses the existing Heavy Hauling booking rules, including the existing hourly booking minimum. No unverified capacities, engine details or model years are added. Existing lowboy and flatbed trailer listings/rates are unchanged. These are transport service listings using the same collection/delivery treatment as the existing Heavy Hauling products.

Three supplied photos are matched in their supplied order: Mack, left-facing Ford F-450, right-facing Ford F-550. Product cutouts were prepared with the image editing tool and saved as PNGs with genuine alpha channels. The original generated files remain in /workspace/generated_images. Website copies retain their generated resolution and transparency.

The migration inserts only missing IDs and preserves existing catalog entries/admin edits. Empty databases use the complete seed. Existing bookings, accounts, companies and loyalty data are not rewritten.

Checks cover safe seeding, idempotent migration, admin edits preserved, both rates at checkout, one-unit overlap rejection, independent vehicles allowed simultaneously, category coverage, transparent images and desktop/mobile card rendering.
