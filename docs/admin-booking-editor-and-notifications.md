# Admin booking editing and iPhone booking alerts

Administrators can use **Add customer booking** on `/admin/bookings`, or **Edit booking** on an individual booking. These routes require an administrator role. Customers retain their own checkout flow but cannot use the admin editor.

The editor supports registered customers or guests, customer/contact details, equipment and attachments, quantities, hourly work, repeated daily/weekly/monthly periods, rate overrides, delivery area and site, and notes. Hourly quantity represents hours for one machine; other rental quantities represent physical units, multiplied by rental periods. Blank rates remain to be confirmed. All times use Cayman time. Saving a legacy manually scheduled booking replaces that all-day schedule with the selected time and item durations, with a warning on the form.

Active bookings recheck availability inside the inventory transaction. Concurrent edits are rejected rather than silently overwriting another administrator. Each save records the administrator and reason, archives the old estimate PDF, issues the next estimate number, and emails the customer the new PDF. Original customer signature fields remain intact; administrator-created bookings explicitly say they were not signed online. For paid bookings the administrator records the actual payment retained after extra payment/refund, so rewards follow confirmed payment rather than the revised estimate. Calendar sync uses edited equipment and durations.

## Enable alerts on iPhone

Requires iOS 16.4 or later and a home-screen web app. Open the admin icon, sign in, tap **Enable booking alerts**, then **Allow**. If the old icon opens a Safari tab, open `/admin/bookings` in Safari and use Share → Add to Home Screen, then enable alerts from that new icon. Allow Badges in iPhone notification settings. Each device needs its own permission; website deployment cannot grant it remotely.

New bookings create durable per-admin unread notices and per-device push deliveries in the booking transaction. Successful deliveries show a generic lock-screen notification and set the unread icon badge. Viewing bookings marks only the displayed bookings read for that administrator. The delivery worker retries transient failures, removes expired subscriptions, and suppresses pending deliveries for already-read notices. Notifications contain no customer details. There is no private-page offline cache. Logging out disables that device subscription.

Railway requires stable `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, and `WEB_PUSH_SUBJECT` variables. The private key stays in Railway. Key rotation requires devices to re-subscribe. The production keys have been configured. Schema migrations create push subscriptions/outbox and booking revisions/estimate archives.

Verification: production build; 143 tests, including authorization, paid booking edits, revised PDF archives, optimistic concurrency, stock quantities/durations, push subscription validation and durable retries, service-worker notifications/badges, and calendar windows. Browser checks cover creation/editing and responsive layout at 1440/390 px, plus mocked notification permission/badge setup and iPhone installation guidance. Actual delivery to the owner's iPhone requires enabling permission there and a subsequent new booking.
