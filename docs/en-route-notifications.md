# Admin en route notifications

On an approved/paid booking, use **Equipment en route**, choose an optional operator/driver and banksman/rigger, then click **En route — notify customer**. Crew choices: Leon, Gregg, Conrad, Franklin, Joseph, Marlon, Jeorge, Silvio, Molo. The same person cannot fill both roles.

ETA windows start at the server's receipt of the click, displayed as Cayman local arrival times:
- West Bay, George Town, Red Bay, Prospect, Savannah: 15–30 minutes.
- Bodden Town: 20–30 minutes.
- North Side, East End: 30–40 minutes.
- Other/unspecified areas: admin must enter earliest/latest travel minutes (1–240), rather than guessing.

The email includes booking number, customer name, site, selected crew and arrival window. It uses the existing branded customer sender. Customer pickup bookings, cancelled/declined/pending bookings and returned equipment cannot send. Only authenticated admins can access the action. No booking dates, prices, inventory or rewards change.

Each submission has a unique ID; booking row locks and provider idempotency prevent duplicate sends from concurrent clicks/retries. History records recipient, crew, ETA and send outcome. A failed send can retry its original payload/key while the earliest ETA remains future; after that use a fresh form to calculate a new window. No automatic dispatch emails are sent during deployment.
