# Cayman Crane Company website

Equipment rentals and booking site for Cayman Crane Company, Grand Cayman.

The rentals page is plain HTML, CSS and JavaScript in `public/`. A small Node server (`src/server.ts`, using Hono) serves it and handles booking requests, which are stored in Postgres through Prisma. It is hosted on Railway.

## Routes

| Path | What it does |
|---|---|
| `/` | Redirects to `/rentals` |
| `/rentals` | The rentals page (`public/rentals.html`) |
| `/account` | Customer log in and sign up |
| `/account/profile` | Rewards tier, booking history, details and password |
| `/account/forgot`, `/account/reset` | Password reset |
| `/account/verify` | Confirm an email address (from the emailed link), or the "check your email" page |
| `/privacy` | Privacy notice (`src/views/privacy.tsx`), linked from the footer, sign-up and checkout |
| `/admin` | Admin area: bookings and customers |
| `/admin/catalog` | Edit equipment, prices, quantities and photos |
| `/admin/calendar` | Month view of bookings with clash warnings |
| `/admin/bookings/export.csv` | Bookings and payments as a spreadsheet |
| `/catalog.js` | The current catalog, loaded by the rentals page before `app.js` |
| `/uploads/:id` | Photos and PDFs uploaded in the catalog editor |
| `POST /api/bookings` | Saves a booking request from a logged-in customer and emails it to Cayman Crane (401 when signed out) |
| `GET /api/rewards` | The signed-in customer's tier and details (401 when signed out) |
| `/healthz` | Health check used by Railway (also checks the database) |

## Accounts and rewards

Booking needs an account, so Cayman Crane always knows who is asking. Signed-out visitors can browse and fill a cart, but the cart's checkout button sends them to log in or sign up, then back to `/rentals?checkout=1`, which reopens checkout with the same cart (it's kept in the browser). The server refuses bookings without a session, and each booking uses the account's email rather than whatever the form says. Bookings made before this rule show as guest bookings in admin.

Customers sign up with their name, email, phone number and a password (company is optional). Accounts made before phone numbers were required pick theirs up from their next checkout.

New customers also confirm their email before they can book: sign-up emails a link (valid 48 hours) to `/account/verify`, and until it's clicked the cart sends them to a "check your email" page with a button for a new link. Changing the email on an account means confirming the new one. Admins are exempt and previously verified accounts remain verified. Customers must confirm their own email; admins cannot bypass it. If delivery is unavailable, signup shows a resend option and bookings remain blocked until verification succeeds.

Sign-up and the account page have an unticked "offers and news" box. The customer's choice and the date they agreed are stored on their account. Admin → Customers shows who agreed and offers the opted-in customers as a CSV (`/admin/customers/marketing.csv`) for a mailing tool; an admin can stop marketing for a customer who asks, but only the customer can opt in. Passwords are hashed with scrypt, and sessions are stored in the `Session` table behind an HttpOnly cookie that lasts 30 days.

Customers earn one point for every CI$1 an admin marks as paid on a booking they made while logged in. Tiers match the rentals page: Silver at CI$5,000 (5% off), Gold at CI$15,000 (10%) and Platinum at CI$25,000 (15%). The discount applies to equipment in the cart, and the tier at booking time is saved on each booking so an admin can check it. Admins can also add rewards credit to a customer for spend made outside the site.

## Admin area

Admins log in through the normal login at `/account`, which takes them to the admin area. Customers cannot be granted admin access through the website. An admin can't remove their own access, and the last admin can't be removed.

In the admin area, a booking can be approved (which emails the customer their contract), declined, cancelled, marked as paid with the amount, given a private note, or deleted. Customers can be searched, edited, given rewards credit, or deleted. Email confirmation and password recovery are customer self-service; admins cannot generate reset links or confirm customers by hand. Deleting a customer keeps their bookings as guest bookings unless the admin ticks the box to delete those too.

## Catalog

The equipment list lives in the `Product` and `RiggingOption` tables. On first start with an empty database, the server loads `prisma/catalog-seed.json`, which is the catalog the site launched with. After that, the admin catalog editor is the source of truth: the server serves it as `/catalog.js`, and `public/app.js` reads `window.CCC_CATALOG` in place of its old hard-coded list. The page's add-on groups, navigation tree and rigging-size logic still live in `app.js` and work on whatever the catalog contains. Equipment added in admin is placed in the navigation by its category.

Each item's page in the catalog editor also sets which add-ons appear in the "add extras" prompt when a customer adds it to their cart (for example a crane's lifting accessories), and whether it runs on electric power. Generators are only suggested at checkout when the cart contains an item marked as electric.

Some items only work together, like the concrete vibrator's motor, shaft and head. In the catalog editor a part gets a "set part" kind (Shaft, Head), and any item that offers set parts as add-ons is then rented as a set: adding it opens a picker that needs one of each kind, the parts follow the main item's term and quantity in the cart, and parts can't be booked on their own. The server checks the totals again on every booking.

Concrete vibrators appear as one complete rental in the catalog, cart, checkout and readable booking request. Customers choose a 14 ft or 20 ft shaft and a 13/16 inch or 1 inch head. The displayed rental price includes all three components at their existing catalog rates; component records remain linked internally for pricing and inventory validation.

Bookings send their cart lines along with the readable request. The server prices each line from the catalog at that moment and stores the result on the booking, so later price changes don't alter past bookings.

## Calendar and export

The admin calendar shows active bookings on their confirmed rental dates, or on the customer's requested start date until an admin confirms dates on the booking. A day is flagged when more bookings need a piece of equipment than its available quantity. On phones the month grid becomes an agenda list.

The bookings page can export the current status filter, optionally limited by the date received, as a CSV that opens in Excel, Numbers or Google Sheets. Amounts are plain numbers for adding up, and cells that a spreadsheet would treat as formulas are prefixed with an apostrophe.

## Booking alerts

Every booking is saved to the `Booking` table. If `RESEND_API_KEY` is set, the server also emails the booking to `BOOKING_ALERT_TO` and the customer sees "Booking request sent".

If the alert email can't be sent (no key set, or Resend is down), the booking is still saved, and the page asks the customer to send the prepared email to caymancrane@gmail.com instead. No booking is lost either way.

Emails to customers (contracts on approval, password resets) need `EMAIL_FROM` on a domain verified in Resend. Until configured, account recovery shows that email delivery is unavailable. Customers use Forgot username or password on the login page: their email is their username, and the recovery email includes a single-use reset link valid for one hour. Resetting invalidates existing sessions and other outstanding reset links.

## Running locally

Needs Node 22.12+ (or 24+) and a Postgres database.

```bash
cp .env.example .env    # then set DATABASE_URL
npm install
npx prisma migrate dev  # creates the tables
npm run build
npm run dev             # http://localhost:3000/rentals
```

## Tests

`npm test` builds the app and runs the tests in `src/*.test.ts` with Node's test runner. The integration tests need `TEST_DATABASE_URL` pointing at a separate, empty Postgres database; they wipe it before each test.

## Database changes

Edit `prisma/schema.prisma`, then run `npx prisma migrate dev --name <change>` and commit the new folder in `prisma/migrations/`. `npm start` applies any pending migrations before the server starts, so Railway picks them up on every deploy. If a migration fails, the new deploy never goes live and the previous one keeps serving.

## Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string. On Railway it references the Postgres service. |
| `RESEND_API_KEY` | Optional. Enables email through Resend. |
| `BOOKING_ALERT_TO` | Where booking alerts go. Defaults to caymancrane@gmail.com. |
| `EMAIL_FROM` | Sender on a domain verified in Resend. Turns on customer emails. |
| `PUBLIC_URL` | The site's own address (https://www.caymancrane.com). Used for links in emails, and page visits to the Railway address are redirected there. |
| `TEST_DATABASE_URL` | Local only. A separate database for `npm test`. |

## Google Calendar booking sync

Admin → Calendar → Connect Google Calendar manages automatic sync to the main
`caymancrane@gmail.com` calendar. The website needs its own OAuth authorization;
a Google Calendar connection in chat does not supply credentials to Railway.

One-time setup:

1. In Google Cloud, enable the Google Calendar API and configure the OAuth consent
   screen with the website homepage and privacy URL. Create a **Web application**
   OAuth client with redirect URI
   `https://www.caymancrane.com/admin/google-calendar/callback`.
2. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as Railway service variables.
   `PUBLIC_URL` must be `https://www.caymancrane.com`. Never commit these values.
3. Publish the OAuth app for production use. In testing mode, add
   `caymancrane@gmail.com` as a test user; Google expires testing authorizations
   after seven days, so testing mode is unsuitable for unattended ongoing sync.
4. Open `/admin/google-calendar`, connect, and authorize as `caymancrane@gmail.com`.

The server polls bookings about once a minute and backfills existing dated
bookings. Pending requests are tentative; approved and paid bookings are
confirmed. Events cover the rental dates as all-day entries; requested times are
included in their descriptions in Cayman time. Undated bookings wait until
scheduled. Rescheduling and detail changes update the same event; cancellations,
declines and deletion remove only events tracked by this integration. Other
calendar events and attendees are untouched. The connection page shows sync
errors and supports retry and disconnect. Disconnect stops future syncing and
leaves existing Google events in place.

Refresh tokens are encrypted in the database using AES-256-GCM with a key derived
from `GOOGLE_CLIENT_SECRET`. Changing that secret requires reconnecting Google.
Keep one active web replica; the worker prevents overlapping runs within that
process and uses deterministic event IDs to avoid duplicates on retries.

## Company loyalty accounts

Customers can use personal accounts, register a company limited to one verified
email login, or join shared company rewards using a verified matching work domain. Signup/profile
recommend the matching company; they do not offer a directory of unrelated
companies. Free/disposable mailbox providers cannot establish a shared work domain, but can
register an email-only company. Its exact verified owner email is the only allowed
login; existing companies cannot be claimed by unrelated email addresses.
Domain matching uses the Public Suffix List, including private suffixes, to prevent
lookalike-subdomain matches.

After email verification, a matching company name/domain is saved and becomes
available to other staff. For trading names or abbreviations that do not match
the domain, admins can pre-register the mapping at `/admin/companies` (linked
from Customers). Staff retain individual passwords, contact details and booking
histories; verified members share company-paid booking points, tier discounts and
company rewards credit. Admin credit changes on a linked staff account apply to
the shared company balance.

Bookings store the company ID at creation. Leaving a company or changing email
does not move its historical spend to another company. Existing company-name
text is not automatically trusted or merged; existing personal bookings and
credit remain personal. Checkout company text cannot create company membership.

Email-only companies have a unique registered owner email and cannot accept staff
with other email addresses. They are labeled with that email in Admin → Companies.
Changing the registered email requires assistance rather than silently adding
another login.

## Signup and welcome notifications

Each new customer signup queues an admin email to BOOKING_ALERT_TO (default:
`caymancrane@gmail.com`) titled “New customer signup — [Name]”. It includes
contact details, the requested company, signup time in Cayman time, verification
status and an admin account link. Passwords and verification tokens are excluded.

After the customer verifies their email, a branded HTML/plain-text welcome email
explains the loyalty program, company membership where applicable, payment rules
and tier discounts. It is sent once per account, separately from marketing
opt-ins. Existing verified accounts are not sent bulk welcome emails.

Both notifications use a persistent AccountEmail queue with retry backoff and
Resend idempotency keys. The server retries pending emails every 30 seconds.
The example at `/welcome-email-preview.html` uses the real template with sample
customer details. Customer welcome delivery requires EMAIL_FROM and RESEND_API_KEY.

Admins can edit each active company at `/admin/companies`. Changing a name updates
linked staff profiles; changing a domain or single-login email unlinks members
whose verified email no longer matches. Booking company IDs and historical spend
remain attached to the original company. Inactive companies are hidden from
registration recommendations and cannot grant shared rewards. The one-time
removal of company A retains its history in an archived record and releases its
old registration identifiers.
