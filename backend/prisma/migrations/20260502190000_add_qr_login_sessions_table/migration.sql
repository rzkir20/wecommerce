CREATE TABLE IF NOT EXISTS "qr_login_sessions" (
  "token" VARCHAR(128) NOT NULL,
  "status" VARCHAR(16) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "approved_user_id" UUID,
  "approved_user_name" VARCHAR(255),
  "approved_user_email" VARCHAR(255),
  "approved_user_phone" VARCHAR(32),
  "auth_token" TEXT,
  "used_at" TIMESTAMPTZ(6),
  CONSTRAINT "qr_login_sessions_pkey" PRIMARY KEY ("token"),
  CONSTRAINT "qr_login_sessions_status_check" CHECK ("status" IN ('pending', 'approved', 'expired', 'used'))
);

CREATE INDEX IF NOT EXISTS "idx_qr_login_sessions_status_expires_at"
ON "qr_login_sessions"("status", "expires_at");
