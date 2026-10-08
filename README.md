# Cayman Crane Company website

Equipment rentals and booking site for Cayman Crane Company, Grand Cayman.

The rentals page is plain HTML, CSS and JavaScript in `public/`. A small Node server (`src/server.ts`, using Hono) serves it and handles booking requests, which are stored in Postgres through Prisma. It is hosted on Railway.

## Routes

| Path | What it does |
|---|---|
| `/` | Redirects to `/rentals` |
| `/rentals` | The rentals page (`public/rentals.html`) |
| `POST /api/bookings` | Saves a booking request and emails it to Cayman Crane |
| `GET /api/rewards` | Returns 401 until customer accounts are rebuilt |
| `/account`, `/admin` | Placeholder page until accounts and the admin area are rebuilt |
| `/healthz` | Health check used by Railway (also checks the database) |

## Booking alerts

Every booking is saved to the `Booking` table. If `RESEND_API_KEY` is set, the server also emails the booking to `BOOKING_ALERT_TO` and the customer sees "Booking request sent".

If the alert email can't be sent (no key set, or Resend is down), the booking is still saved, and the page asks the customer to send the prepared email to caymancrane@gmail.com instead. No booking is lost either way.

## Running locally

Needs Node 22.12+ (or 24+) and a Postgres database.

```bash
cp .env.example .env    # then set DATABASE_URL
npm install
npx prisma migrate dev  # creates the tables
npm run build
npm run dev             # http://localhost:3000/rentals
```

## Database changes

Edit `prisma/schema.prisma`, then run `npx prisma migrate dev --name <change>` and commit the new folder in `prisma/migrations/`. `npm start` applies any pending migrations before the server starts, so Railway picks them up on every deploy. If a migration fails, the new deploy never goes live and the previous one keeps serving.

## Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string. On Railway it references the Postgres service. |
| `RESEND_API_KEY` | Optional. Enables booking alert emails through Resend. |
| `BOOKING_ALERT_TO` | Where alerts go. Defaults to caymancrane@gmail.com. |
| `BOOKING_ALERT_FROM` | Sender address. Defaults to Resend's test sender, which can only email the address the Resend account was created with. |
