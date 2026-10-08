-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "area" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "estimateCents" INTEGER,
ADD COLUMN     "items" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "scheduleEnd" DATE,
ADD COLUMN     "scheduleStart" DATE,
ADD COLUMN     "siteAddress" TEXT,
ADD COLUMN     "startDate" DATE,
ADD COLUMN     "startTime" TEXT;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "spec" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "chart" TEXT,
    "photo" BOOLEAN NOT NULL DEFAULT false,
    "delivery" BOOLEAN NOT NULL DEFAULT false,
    "operatorService" BOOLEAN NOT NULL DEFAULT false,
    "availableQuantity" INTEGER,
    "rates" JSONB NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "extra" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiggingOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "swl" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "RiggingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiggingOption_productId_idx" ON "RiggingOption"("productId");

-- CreateIndex
CREATE INDEX "Booking_startDate_idx" ON "Booking"("startDate");

-- CreateIndex
CREATE INDEX "Booking_scheduleStart_idx" ON "Booking"("scheduleStart");

-- AddForeignKey
ALTER TABLE "RiggingOption" ADD CONSTRAINT "RiggingOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
