import {runConfiguredDocumentCorrection} from "./booking-document-correction.js";
import {runConfiguredTransportRepair} from './booking-transport-repair.js';
import {startReceiptEmailDelivery} from './receipts.js';
import { startAdminPushDelivery } from "./admin-push.js";
import { startCompanyLogoRefresh } from "./company-logos.js";
import { startEstimateEmailDelivery } from "./estimates.js";
import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { ensureCatalogSeeded } from "./catalog.js";
import { startAccountEmailDelivery } from "./account-emails.js";
import { startGoogleCalendarSync } from "./google-calendar.js";
import { prisma } from "./db.js";

await ensureCatalogSeeded();
await runConfiguredTransportRepair();
await runConfiguredDocumentCorrection();
const googleCalendarTimer = startGoogleCalendarSync();
const accountEmailTimer = startAccountEmailDelivery();
const estimateEmailTimer = startEstimateEmailDelivery();
const receiptEmailTimer=startReceiptEmailDelivery();
const companyLogoTimer=startCompanyLogoRefresh();
const adminPushTimer=startAdminPushDelivery();

const port = Number(process.env.PORT) || 3000;
const server = serve({ fetch: app.fetch, port }, info => console.log(`Listening on port ${info.port}`));

function shutdown() {
  clearInterval(googleCalendarTimer);
  clearInterval(accountEmailTimer);
  clearInterval(estimateEmailTimer);
  clearInterval(receiptEmailTimer);
  clearInterval(companyLogoTimer);
  clearInterval(adminPushTimer);
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
