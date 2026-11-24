# Rental end reminder preview — 24 November 2026

Status: **owner approved launch on 24 November 2026**. Templates and the gated delivery worker are implemented. Production activation uses `RENTAL_REMINDERS_ENABLED=true` after the deployment succeeds.

## Reviewable output

- `src/rental-reminder-email.ts`: plain-text and responsive HTML templates, extension-request links, and proposed Cayman send-time calculation.
- `scripts/render-rental-reminder-preview.mjs`: self-contained interactive preview with weekly/monthly and collection/customer-return variants. Run after `npx tsc`, supplying an output directory.
- Example preview: `/workspace/exports/rental-reminder-preview/index.html`.
- The fictional example is CCC-01234 for Alex Morgan, two diesel cement mixers, confirmed end date Friday 4 December 2026. Published per-unit rates are KYD 40/day, 175/week, 600/month; extension totals for two are 80/350/1,200. Prices are before applicable loyalty discounts.

## Approved behaviour

1. Day before the confirmed last rental day, 9:00 am Cayman time: confirm the end date, items and quantities; offer extensions. If the contract includes delivery **and collection**, say CCC staff will collect by end of day on the last rental day.
2. Morning of the last rental day, 8:00 am Cayman time: confirm the rental ends today. Only for collection-included items, say staff will arrive by 4:00 pm. Otherwise remind the customer to arrange return under the existing agreement; do not promise a CCC pickup.
3. Extension buttons open a prefilled email request to `caymancrane@gmail.com` for that item and quantity, using its available daily, weekly or monthly rate. Missing/unpublished terms are omitted. A request does not modify inventory, dates, invoices, rewards or collection arrangements.
4. CCC confirms availability and updates the booking/estimate through the existing admin controls. Applicable discounts are confirmed on the updated estimate. Keep pickup/return scheduled until an extension is actually confirmed.

The preview intercepts links and displays a simulation notice. It does not open an email composer or submit any request. The raw email templates contain the intended mailto links for use after approval. HTML previews use embedded public hook logos so they can be opened offline.

## Delivery safeguards and administration

- Use confirmed **per-item** rental end dates, not invented calendar dates from the words weekly/monthly. The current advertised workday terms and reservation-hour rules are not interchangeable. If a confirmed end date is absent or ambiguous, obtain admin confirmation rather than sending a guessed deadline.
- Restrict to confirmed active weekly/monthly rentals and verified recipients; skip pending, cancelled, declined, completed/returned or otherwise ineligible rentals. Group only ending items that share a date and collection arrangement.
- Determine collection from the saved rental contract/estimate collection rows and item eligibility, not `rentalCollection=delivery` alone. Cranes, boom trucks, telehandlers and bundled add-ons do not automatically include a separate collection service under current rules.
- Use a durable queue with unique booking/item/end-date/reminder-kind keys, safe retry/idempotency and concurrent-worker claims. Re-read booking status, recipient, end date, items and collection arrangement immediately before sending.
- Invalidate stale jobs on confirmed extensions, cancellations or schedule changes. Do not send a stale "tomorrow" message on the final day, or a "by 4 pm today" promise after 4 pm. Do not backfill old historic rentals when enabling the worker.
- Integrate with the existing customer-email sender and hook-brand footer; leave sending disabled by default until deployment/activation is approved. No customer credentials or external mail subscriptions are needed in chat.

## Verification

Four unit tests cover date/month/year/leap-day boundaries in Cayman time, collection/return wording, quantity-based extension totals, unpublished rate omission, no automatic confirmation and escaped content. Desktop/phone browser checks cover all eight reminder/transport/term combinations, no overflow and safe preview interactions. Exported email images and a two-page PDF are opened/read back before handoff.

The full automated suite passes 235 tests, including queue concurrency, provider idempotency, retries, cancellation, confirmed extensions, verification changes, returned equipment and expiry during a sweep. The admin rental dates card shows missing dates/configuration and delivery history. Mark all equipment returned stops reminders without changing payment or rewards; resume restores eligibility. Day-before jobs expire at midnight before the final day; final-day jobs expire at noon Cayman time. Unknown collection arrangements ask the customer to contact CCC instead of promising pickup or asking them to return lifting equipment.
