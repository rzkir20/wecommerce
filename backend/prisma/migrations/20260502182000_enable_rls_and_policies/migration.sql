-- Harden Supabase public schema for production by enforcing RLS.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- RLS tetap butuh table-level GRANT. Berikan privilege minimum per use-case.
GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.seller_applications TO authenticated;
GRANT SELECT ON TABLE public.shops TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.shops TO authenticated;
GRANT SELECT ON TABLE public.logs TO authenticated;

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seller_applications NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shops NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs NO FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_owner_select" ON public.users;
DROP POLICY IF EXISTS "users_owner_update" ON public.users;
DROP POLICY IF EXISTS "seller_applications_owner_select" ON public.seller_applications;
DROP POLICY IF EXISTS "seller_applications_owner_insert" ON public.seller_applications;
DROP POLICY IF EXISTS "seller_applications_owner_update" ON public.seller_applications;
DROP POLICY IF EXISTS "shops_public_read_active" ON public.shops;
DROP POLICY IF EXISTS "shops_owner_manage" ON public.shops;
DROP POLICY IF EXISTS "logs_owner_select" ON public.logs;

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

CREATE POLICY "logs_owner_select"
ON public.logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
