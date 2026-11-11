import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { ensureCatalogSeeded } from "./catalog.js";
import { startAccountEmailDelivery } from "./account-emails.js";
import { startGoogleCalendarSync } from "./google-calendar.js";
import { prisma } from "./db.js";

await ensureCatalogSeeded();
const googleCalendarTimer = startGoogleCalendarSync();
const accountEmailTimer = startAccountEmailDelivery();

const port = Number(process.env.PORT) || 3000;
const server = serve({ fetch: app.fetch, port }, info => console.log(`Listening on port ${info.port}`));

function shutdown() {
  clearInterval(googleCalendarTimer);
  clearInterval(accountEmailTimer);
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
