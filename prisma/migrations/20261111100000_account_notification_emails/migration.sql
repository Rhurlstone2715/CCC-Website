CREATE TABLE "AccountEmail" (
 "id" SERIAL PRIMARY KEY,
 "key" TEXT NOT NULL UNIQUE,
 "kind" TEXT NOT NULL,
 "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "recipient" TEXT NOT NULL,
 "payload" JSONB NOT NULL,
 "attempts" INTEGER NOT NULL DEFAULT 0,
 "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "sentAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AccountEmail_sentAt_nextAttemptAt_idx" ON "AccountEmail"("sentAt", "nextAttemptAt");
