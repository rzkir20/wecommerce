-- Optional profile fields (aligned with auth.service insert/select).
ALTER TABLE "public"."users"
ADD COLUMN IF NOT EXISTS "gender" VARCHAR(32);

ALTER TABLE "public"."users"
ADD COLUMN IF NOT EXISTS "date" DATE;
