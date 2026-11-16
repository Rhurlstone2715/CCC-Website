# PDF watermarks

Estimates receive a large translucent red ESTIMATE watermark; payment receipts receive a green PAID watermark on every page. The original fonts, amounts, balance/credit wording and document numbers remain unchanged.

New documents are stamped during rendering. Existing downloads and queued email attachments also receive the appropriate watermark. Queued attachment bytes are saved before sending so email retries reuse the same payload. A versioned metadata marker prevents repeated stamping. Archived estimate downloads are stamped without changing archived originals. Previously delivered emails are not resent.

Regenerate fictional public samples with `node scripts/render-paid-receipt-sample.mjs` after building. Tests cover all-page application, document metadata preservation, distinct colors and stable repeated delivery.
