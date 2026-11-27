# Final invoices

Admin booking pages provide **Edit booking before invoicing** and **Send Final Invoice**. Confirm completion only after saving actual equipment, quantities, periods, work sessions, rates, delivery and discounts through the existing editor. The final invoice is built fresh from the saved booking; unknown prices/transport charges block issuance. A stale browser page must reload before issuing.

Final invoices use the existing estimate font, layout, logo, banking details, booking reference, KYD totals and USD conversion (KYD / 0.80), labelled FINAL INVOICE. They show confirmed payment and balance/credit. FIN numbers have a separate consecutive sequence and never consume estimate numbers. PDFs and historical versions are immutable. Existing estimates and payment receipts are retained.

Sending does not mark payment received, release rewards or change inventory/rental return state. The existing admin payment confirmation and equipment-return controls remain authoritative. Sent invoices are downloadable by the owning verified customer, and admin previews retain the iPhone Back to booking toolbar.

The queue is unique per booking/version. Duplicate clicks do not produce duplicate invoices or emails. A new saved booking version requires another deliberate Send Final Invoice action; pending invoices from earlier versions are suppressed. Before sending, the worker locks and rereads the booking. Saved PDFs retry with the same provider idempotency key. Customer email configuration uses the existing Resend sender. No real customer email is sent for testing.

## Invoice watermark and preview

Final invoices carry the same large red diagonal translucent watermark as estimates, labelled INVOICE. Rendering, email attachments, customer downloads and admin previews all apply it idempotently. Startup backfills every saved historical final invoice (including superseded/sent copies), updating only PDF bytes. Totals, snapshots, invoice numbers, dates, payment status and email-send status are unchanged; previously emailed attachments are not recalled or resent.

Every admin booking has Preview final invoice. `/admin/bookings/preview/jr-latest` selects the newest J&R company booking and opens its private preview, labelled SAMPLE ONLY / PREVIEW. It reads current saved booking data without creating an invoice, consuming a sequence number or emailing the customer. The preview retains the iPhone back toolbar.
