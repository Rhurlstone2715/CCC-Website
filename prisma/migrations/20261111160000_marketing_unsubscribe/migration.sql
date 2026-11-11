ALTER TABLE "User" ADD COLUMN "marketingUnsubscribeToken" TEXT;
CREATE UNIQUE INDEX "User_marketingUnsubscribeToken_key" ON "User"("marketingUnsubscribeToken");
