CREATE TABLE "GoogleCalendarLink" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL,
    "encryptedToken" TEXT NOT NULL,
    "events" JSONB NOT NULL DEFAULT '{}',
    "lastSyncedAt" TIMESTAMP(3),
    "lastError" TEXT,
    CONSTRAINT "GoogleCalendarLink_pkey" PRIMARY KEY ("id")
);
