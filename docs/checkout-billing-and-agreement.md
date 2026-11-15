# Checkout billing and single agreement

Checkout has one required agreement checkbox. The acknowledgement that the displayed amount is an estimate and final charges are confirmed by CCC appears inside the Rates clause of the rental/service terms. Accepting those terms records both agreement and payment acknowledgement; there is no second checkbox. The drawn signature is still required.

Customer registration requires a personal/company billing address (maximum 500 characters). It is stored on that customer's account, editable on their profile and included in the signup admin email. Existing accounts keep working. Migration copies a customer's own most recently supplied booking billing address if their account has no saved address; it never copies another staff member's address or overwrites a saved address.

The authenticated, private rewards/profile response supplies name, email, phone, company/department and billing address for checkout prefill. The full-name signer field is also prefilled; customers must still draw their signature and accept the terms. Saved details do not overwrite edits already made in the checkout form. Job dates, times and delivery locations remain booking-specific. The saved account billing address is used as a fallback for older clients, and an older customer's first checkout address is saved if their account has none. Individual booking changes do not silently overwrite an existing account address.

Tests cover required registration address, profile persistence and updates, estimate billing details, safe historical backfill, one checkbox/terms content, and desktop/mobile prefill.
