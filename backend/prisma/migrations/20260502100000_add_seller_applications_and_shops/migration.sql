-- Enums for seller application workflow and shop lifecycle
CREATE TYPE "SellerApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE "ShopStatus" AS ENUM ('active', 'suspended');

-- User applies to become a seller (role stays `users` until approval is handled in app logic)
CREATE TABLE "seller_applications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "store_name" VARCHAR(255) NOT NULL,
    "ktp_number" VARCHAR(32) NOT NULL,
    "ktp_image" VARCHAR(512) NOT NULL,
    "selfie_ktp" VARCHAR(512) NOT NULL,
    "status" "SellerApplicationStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" VARCHAR(1000),
    CONSTRAINT "seller_applications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_seller_applications_user_id" ON "seller_applications"("user_id");

ALTER TABLE "seller_applications"
ADD CONSTRAINT "seller_applications_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Created when an application is approved (one shop per seller account)
CREATE TABLE "shops" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "ShopStatus" NOT NULL DEFAULT 'active',
    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shops_user_id_key" ON "shops"("user_id");

CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");

ALTER TABLE "shops"
ADD CONSTRAINT "shops_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
