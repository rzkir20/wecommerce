CREATE TABLE "logs" (
  "id" UUID NOT NULL,
  "action" VARCHAR(100) NOT NULL,
  "description" VARCHAR(1000),
  "target_table" VARCHAR(100),
  "target_id" VARCHAR(191),
  "user_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_logs_user_id" ON "logs"("user_id");
CREATE INDEX "idx_logs_target" ON "logs"("target_table", "target_id");

ALTER TABLE "logs"
ADD CONSTRAINT "logs_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
