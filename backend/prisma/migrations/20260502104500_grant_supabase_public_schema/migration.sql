-- Supabase PostgREST butuh USAGE pada schema public untuk role bawaan.
-- Tanpa ini, supabase-js bisa gagal dengan: 42501 permission denied for schema public
-- (sering muncul setelah hardening / revoke default pada schema public).

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

-- Hindari over-permission di production: akses data tabel harus lewat RLS policy.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- Aktifkan RLS di tabel aplikasi (defense in depth).
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seller_applications FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shops FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs FORCE ROW LEVEL SECURITY;

-- Drop policy lama jika ada agar migration idempotent saat redeploy.
DROP POLICY IF EXISTS "users_owner_select" ON public.users;
DROP POLICY IF EXISTS "users_owner_update" ON public.users;
DROP POLICY IF EXISTS "seller_applications_owner_select" ON public.seller_applications;
DROP POLICY IF EXISTS "seller_applications_owner_insert" ON public.seller_applications;
DROP POLICY IF EXISTS "seller_applications_owner_update" ON public.seller_applications;
DROP POLICY IF EXISTS "shops_public_read_active" ON public.shops;
DROP POLICY IF EXISTS "shops_owner_manage" ON public.shops;
DROP POLICY IF EXISTS "logs_owner_select" ON public.logs;

-- users berisi data sensitif (email/phone/password_hash).
CREATE POLICY "users_owner_select"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_owner_update"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Seller application hanya boleh diakses pemilik account.
CREATE POLICY "seller_applications_owner_select"
ON public.seller_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "seller_applications_owner_insert"
ON public.seller_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seller_applications_owner_update"
ON public.seller_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Shop aktif boleh dibaca publik untuk storefront, owner bisa kelola sendiri.
CREATE POLICY "shops_public_read_active"
ON public.shops
FOR SELECT
TO anon, authenticated
USING (status = 'active');

CREATE POLICY "shops_owner_manage"
ON public.shops
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Log hanya bisa dibaca pemilik log (jika ada user_id).
CREATE POLICY "logs_owner_select"
ON public.logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
