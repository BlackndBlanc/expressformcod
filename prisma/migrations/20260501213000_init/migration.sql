CREATE TYPE "CodOrderStatus" AS ENUM ('PENDING', 'DRAFT_CREATED', 'FAILED');

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "fullNameLabel" TEXT NOT NULL DEFAULT 'Full name',
    "phoneLabel" TEXT NOT NULL DEFAULT 'Phone',
    "cityLabel" TEXT NOT NULL DEFAULT 'City',
    "addressLabel" TEXT NOT NULL DEFAULT 'Address',
    "quantityLabel" TEXT NOT NULL DEFAULT 'Quantity',
    "buttonText" TEXT NOT NULL DEFAULT 'Order with cash on delivery',
    "successMessage" TEXT NOT NULL DEFAULT 'Thank you. We received your order.',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CodSubmission" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "productTitle" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "CodOrderStatus" NOT NULL DEFAULT 'PENDING',
    "draftOrderId" TEXT,
    "draftOrderName" TEXT,
    "shopifyOrderId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storeSettingsId" TEXT,

    CONSTRAINT "CodSubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StoreSettings_shop_key" ON "StoreSettings"("shop");
CREATE INDEX "CodSubmission_shop_idx" ON "CodSubmission"("shop");
CREATE INDEX "CodSubmission_createdAt_idx" ON "CodSubmission"("createdAt");

ALTER TABLE "CodSubmission" ADD CONSTRAINT "CodSubmission_storeSettingsId_fkey" FOREIGN KEY ("storeSettingsId") REFERENCES "StoreSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
