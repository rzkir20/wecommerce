CREATE TABLE IF NOT EXISTS "login_histories" (
  "id" SERIAL NOT NULL,
  "user_id" UUID NOT NULL,
  "token_id" VARCHAR(128) NOT NULL,
  "ip_address" VARCHAR(64),
  "user_agent" VARCHAR(1000),
  "location" VARCHAR(255),
  "device" VARCHAR(255),
  "login_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "logout_date" TIMESTAMPTZ(6),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "login_histories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "login_histories_token_id_key" UNIQUE ("token_id")
);

CREATE INDEX IF NOT EXISTS "idx_login_histories_user_id" ON "login_histories"("user_id");
CREATE INDEX IF NOT EXISTS "idx_login_histories_user_login_date" ON "login_histories"("user_id", "login_date");

ALTER TABLE "login_histories"
ADD CONSTRAINT "login_histories_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
