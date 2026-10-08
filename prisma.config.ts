import { defineConfig } from "prisma/config";

// Prisma 7 doesn't load .env on its own. Railway injects DATABASE_URL directly.
try {
  process.loadEnvFile();
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
