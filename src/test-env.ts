// Imported first by the tests, before anything that touches the database, so
// the Prisma client only ever sees the test database (or none at all).
const testDb = process.env.TEST_DATABASE_URL;
if (testDb && testDb === process.env.DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL must point at a separate database; the tests wipe it.");
}
process.env.DATABASE_URL = testDb || "postgresql://no-test-database@127.0.0.1:1/none";

// Never send real email from tests.
delete process.env.RESEND_API_KEY;
delete process.env.EMAIL_FROM;
process.env.ADMIN_SETUP_CODE = "test-setup-code";

export {};
