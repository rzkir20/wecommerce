CREATE INDEX IF NOT EXISTS "idx_qr_login_sessions_approved_user_id"
ON "qr_login_sessions"("approved_user_id");

ALTER TABLE "qr_login_sessions"
ADD CONSTRAINT "qr_login_sessions_approved_user_id_fkey"
FOREIGN KEY ("approved_user_id") REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
