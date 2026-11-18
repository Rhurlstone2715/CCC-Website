# Approved category browsing layout

This release changes only the public rental browsing interface. The existing hero, rewards section, cart, customer login, billing prefill, quantity/duration controls, set pickers, attachments, checkout, signatures, payment proofs and booking APIs remain in place.

## Categories

`public/catalog-layout.js` is a presentation mapping over `/catalog.js`. Every visible main product appears exactly once. Cranes (4), Boom Trucks (2) and Forklifts/Telehandlers (3) are separate. Heavy Hauling contains lowboy and flatbed transport. Wall Bracing contains ICF bracing and Ellis wall braces; Scaffolding & Props contains scaffolding and post shores. Wall Bracing uses the original animated ICF image from the catalog, not a converted still. Other customer-approved categories are shown; categories without products clearly say none are currently listed. No equipment is invented for them.

Category links use `/rentals?category=cranes#catalog`, `/rentals?category=boom-trucks#catalog`, `/rentals?category=telehandlers#catalog`, `/rentals?category=heavy-hauling#catalog`, `/rentals?category=wall-bracing#catalog`, and equivalent IDs. They work on direct loading, reload, browser Back/Forward and mobile. Search works across the catalog or within the chosen category. A filter hides categories without listed equipment.

`Product.category` is NOT changed: it continues to drive stock, delivery, fuel, add-on and pricing rules. Product IDs, rates, quantities and cart localStorage key are unchanged. No database schema or data migration accompanies this release. Company/customer/rewards/account data and admin APIs are untouched. New admin products are assigned to a suitable display group by backend category or product name; otherwise a visible Other Equipment & Tools group prevents them from disappearing.

Empty-category illustrations are local copies of the customer-provided reference category images. Product card photos come from the current CCC catalog. The existing hero image remains in place.

## Checks

- Unit checks: all visible products covered once, no source-catalog mutation, requested category membership and animated ICF path, custom admin products discoverable.
- Browser checks at 1440px and 390px: category cards and filters, separate groups, shareable links/reload/history, retained cart across groups, ICF quantity/duration, existing Gold discount, saved billing prefill, delivery/collection rules, crane with bundled attachment, drawn signature and single agreement control, search, no-stock states and horizontal overflow.
- Full current-source test suite and production build.

No email, booking or payment is submitted during browser QA. The fixture uses sample catalog/account responses with writes disabled.
