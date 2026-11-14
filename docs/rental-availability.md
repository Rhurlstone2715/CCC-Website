# Rental availability

Checkout reserves inventory for PENDING, APPROVED and PAID bookings. Declined,
cancelled and deleted bookings release their inventory. The stock check and booking
creation share a PostgreSQL transaction-level advisory lock, also used by admin
booking changes, to prevent simultaneous requests claiming the same final unit.

Availability is based on the catalog's `availableQuantity`, not the number of
bookings. Hourly lines reserve one physical item for the entered work hours
(minimum four hours); other lines reserve the entered number of physical items.
Windows are half-open, so another rental can begin exactly when the previous one
ends. Dates and times use America/Cayman (UTC-5).

Default rental windows: four-hour = 4 hours, daily/quote = 24 hours, weekly = 7 days,
monthly = 30 days. An admin's confirmed First day / Last day dates reserve all of
those dates inclusively. Admin rescheduling, approval and reopening also check
stock, excluding the booking being edited. No existing booking is automatically
cancelled or moved.

A conflict returns HTTP 409 without creating a booking, estimate or email. The
response includes the first later whole-hour start where the entire requested
cart fits, if the requested quantities can ever fit. Checkout keeps the cart and
offers a button to use that start; submitting again rechecks availability.
An impossible quantity prompts the customer to reduce it instead.

All stock quantities were checked against the live public catalog on 14 Nov 2026.
Both boom trucks (National 1400H and Altec AC25-95B) have one unit each; Plumwall
ICF bracing has 300. Existing recorded quantities remain unchanged. Six physical
catalog groups have no quantity recorded: 60 Ton Lowboy, 20 Ton Flatbed, National
1400H Man Basket, Lifting Beams, Spreader Bars and Spreader Beams. They conservatively
reserve at most one unit per group until an admin enters a verified quantity in
Catalog. Rigging size options share their parent group's stock. Operator service
is not physical equipment and is excluded from equipment stock checks. Concrete
vibrator motors, shafts and heads each use their own recorded stock.

Legacy bookings without a structured rental date cannot reserve an invented
period; these remain in the admin calendar's awaiting-scheduling list. New
structured equipment bookings require a valid date and whole-hour start.

Validation: real PostgreSQL integration tests cover competing simultaneous
checkouts, pooled brace stock, excessive and duplicated cart quantities, boundary
handover, cancellation, weekly/monthly periods, zero/unrecorded stock and admin
rescheduling. Desktop and mobile browser checks exercise the actual 409 response,
cart retention, next-start button and successful retry.

## Available alternatives and automatic expiry

Conflict responses include up to three alternatives per unavailable product. The
same complete cart is checked for its original requested period after replacing
that product, including existing lines for the suggested equipment. Recommendations
must offer every requested rental term. Known compatible alternatives are other
boom trucks, rough-terrain cranes, telehandlers, the two mobile generators, the two
extension-cord lengths, and the two cutter/bender machines. Other tools are not
assumed interchangeable just because they share a category. Crane/telehandler
capacity is used to prefer the nearest larger model. Specs and rates remain
visible for customer review; suggestions are not a guarantee of job suitability.
Incompatible dedicated attachments prevent a recommendation. Set components are
not automatically substituted.

Customers explicitly choose a replacement. Checkout updates the equipment,
recalculates prices/discounts/delivery and preserves the requested date and time.
Availability is checked again on submission, so an alternative is not reserved
merely because it was suggested.

`GET /api/inventory` calculates available-now counts from active reservation
windows. At the end instant the reservation no longer consumes stock; no timer,
manual stock increment, booking status change or payment-history rewrite is
required. Catalog labels refresh once per minute and read “Available now: X of Y”.
The physical stock total stays unchanged. Future reservations still reserve their
own time windows, even while equipment is available now.
