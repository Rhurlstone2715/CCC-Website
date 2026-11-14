CREATE TABLE "CompanyLogo" (
  "key" TEXT NOT NULL,
  "data" BYTEA,
  "sourceUrl" TEXT,
  "imageUrl" TEXT,
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "manual" BOOLEAN NOT NULL DEFAULT false,
  "lastError" TEXT,
  CONSTRAINT "CompanyLogo_pkey" PRIMARY KEY ("key")
);
