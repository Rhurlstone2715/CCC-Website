CREATE TABLE "Company" (
 "id" SERIAL PRIMARY KEY,
 "name" TEXT NOT NULL,
 "rewardCreditCents" INTEGER NOT NULL DEFAULT 0,
 "nameKey" TEXT NOT NULL UNIQUE,
 "domain" TEXT NOT NULL UNIQUE,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "User" ADD COLUMN "companyAccountId" INTEGER REFERENCES "Company"("id") ON DELETE SET NULL;
ALTER TABLE "Booking" ADD COLUMN "companyAccountId" INTEGER REFERENCES "Company"("id") ON DELETE SET NULL;
CREATE INDEX "User_companyAccountId_idx" ON "User"("companyAccountId");
CREATE INDEX "Booking_companyAccountId_idx" ON "Booking"("companyAccountId");
