# Customer experience preview

Branch: `preview/customer-experience`. Do not merge or push these changes to `main` until the owner approves the preview.

The separate Railway service `design-preview` starts with `node scripts/preview-server.mjs`, rather than the production start command. It does not run migrations, connect to a database, create customer accounts, submit bookings, or send calendar/email/WhatsApp notifications. All writes are blocked server-side. Preview sign-in and booking completion are simulated and clearly labelled. The catalogue is a read-only snapshot from the live catalogue; the normal production application continues to use the database catalogue.

Production deployment remains on `main`. The new layout preserves existing pricing, complete vibrator sets, inventory rules, company account verification and per-item delivery calculations. Pickup rentals now collect a requested start date too; heavy-hauling requests collect site details.

Changes include equipment-first homepage order, compact responsive navigation and hero, seven descriptive equipment categories, twelve-item catalogue batches, expandable specifications, explicit quantity/rate labels, stock labelled as fleet inventory, account tabs, three real checkout steps, mobile estimate bar, per-item delivery in the summary, and customer-facing copy cleanup. Static photos are converted to WebP with the same pixel dimensions. Animated GIFs remain unchanged. The preview-only banner and demo scripts are injected by the preview server; production pages do not load them.

Validation: build/typecheck, full Postgres integration and pricing tests, and Playwright desktop/mobile checks of catalogue filters, required fields, checkout navigation, delivery estimates, signup tabs and server-side preview write blocking. Preview backend integrations are deliberately disabled and cannot be end-to-end tested here.

## Pending approval: category pages

Local changes add seven category URLs under `/equipment/`, an All Equipment search page at `/equipment`, homepage category tiles, individual equipment pages at `/equipment/item/:id`, breadcrumbs, desktop equipment navigation and a compact mobile category switcher. The full catalogue loads on every equipment page so carts, sets and operator lines survive navigation. Login returns customers to the page they were using.

Do not push this branch: that would automatically update the hosted preview. The owner asked that these changes remain undeployed until approval. Both the live website and the hosted preview must remain on their current releases.
