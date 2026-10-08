import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { prisma } from "./db.js";

const port = Number(process.env.PORT) || 3000;
const server = serve({ fetch: app.fetch, port }, info => console.log(`Listening on port ${info.port}`));

function shutdown() {
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
