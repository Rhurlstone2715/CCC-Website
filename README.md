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
| `/privacy` | Privacy notice (`src/views/privacy.tsx`), linked from the footer, sign-up and checkout |
| `/admin` | Admin area: bookings and customers |
| `/admin/setup` | Creates an admin account, using `ADMIN_SETUP_CODE` |
| `/admin/catalog` | Edit equipment, prices, quantities and photos |
| `/admin/calendar` | Month view of bookings with clash warnings |
| `/admin/bookings/export.csv` | Bookings and payments as a spreadsheet |
| `/catalog.js` | The current catalog, loaded by the rentals page before `app.js` |
| `/uploads/:id` | Photos and PDFs uploaded in the catalog editor |
| `POST /api/bookings` | Saves a booking request and emails it to Cayman Crane |
| `GET /api/rewards` | The signed-in customer's tier and details (401 when signed out) |
| `/healthz` | Health check used by Railway (also checks the database) |

## Accounts and rewards

Customers sign up with an email and password. Passwords are hashed with scrypt, and sessions are stored in the `Session` table behind an HttpOnly cookie that lasts 30 days.

Customers earn one point for every CI$1 an admin marks as paid on a booking they made while logged in. Tiers match the rentals page: Silver at CI$5,000 (5% off), Gold at CI$15,000 (10%) and Platinum at CI$25,000 (15%). The discount applies to equipment in the cart, and the tier at booking time is saved on each booking so an admin can check it. Admins can also add rewards credit to a customer for spend made outside the site.

## Admin area

To add an admin, set `ADMIN_SETUP_CODE` on the web service in Railway, open `/admin/setup`, and enter the code with the admin's name, email and password. If the email already has a customer account, its password is needed and the account becomes an admin. Remove the variable afterwards to turn setup off.

In the admin area, a booking can be approved (which emails the customer their contract), declined, cancelled, marked as paid with the amount, given a private note, or deleted. Customers can be searched, edited, given rewards credit, sent a one-time password reset link, or deleted. Deleting a customer keeps their bookings as guest bookings unless the admin ticks the box to delete those too.

## Catalog

The equipment list lives in the `Product` and `RiggingOption` tables. On first start with an empty database, the server loads `prisma/catalog-seed.json`, which is the catalog the site launched with. After that, the admin catalog editor is the source of truth: the server serves it as `/catalog.js`, and `public/app.js` reads `window.CCC_CATALOG` in place of its old hard-coded list. The page's add-on groups, navigation tree and rigging-size logic still live in `app.js` and work on whatever the catalog contains. Equipment added in admin is placed in the navigation by its category.

Bookings send their cart lines along with the readable request. The server prices each line from the catalog at that moment and stores the result on the booking, so later price changes don't alter past bookings.

## Calendar and export

The admin calendar shows active bookings on their confirmed rental dates, or on the customer's requested start date until an admin confirms dates on the booking. A day is flagged when more bookings need a piece of equipment than its available quantity. On phones the month grid becomes an agenda list.

The bookings page can export the current status filter, optionally limited by the date received, as a CSV that opens in Excel, Numbers or Google Sheets. Amounts are plain numbers for adding up, and cells that a spreadsheet would treat as formulas are prefixed with an apostrophe.

## Booking alerts

Every booking is saved to the `Booking` table. If `RESEND_API_KEY` is set, the server also emails the booking to `BOOKING_ALERT_TO` and the customer sees "Booking request sent".

If the alert email can't be sent (no key set, or Resend is down), the booking is still saved, and the page asks the customer to send the prepared email to caymancrane@gmail.com instead. No booking is lost either way.

Emails to customers (contracts on approval, password resets) need `EMAIL_FROM` on a domain verified in Resend. Until then, the admin booking page offers the contract to copy or send from your own inbox, and customers who forget their password are asked to contact Cayman Crane, who can create a reset link from the customer's admin page.

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
| `ADMIN_SETUP_CODE` | Turns on `/admin/setup`. Remove it once admins exist. |
| `PUBLIC_URL` | Base URL for links in emails. Defaults to the Railway domain. |
| `TEST_DATABASE_URL` | Local only. A separate database for `npm test`. |
