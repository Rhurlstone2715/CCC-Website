# Drawn checkout signatures

Checkout replaces the initials input with a canvas signature pad supporting touch, stylus and mouse pointer events. The full legal-name field remains to identify the signer. Clear removes all strokes; submitting an empty pad is blocked. Signing disables scrolling only within the pad, so the rest of the checkout continues to scroll normally.

Signatures are stored with the booking as bounded numeric strokes, not executable SVG, markup, image URLs or public uploads. The server rejects malformed coordinates, oversized drawings and empty/tap-only marks. Administrators can view the drawing beside the original agreement. Admin booking edits preserve it; admin-entered bookings still do not claim to have a customer signature. Contract text identifies that a handwritten signature is saved with the booking. Older bookings and older checkout tabs retain support for their original typed name and initials.

Migration adds nullable Booking.signatureDrawing. No existing agreements are rewritten. Signature drawings are not saved in browser storage and are cleared after successful/saved checkout.

Verification covers real browser mouse and touch strokes, blank rejection, clear, server validation, database persistence and admin-only agreement access, alongside the full regression suite.
