-- Incremental fix: previous migration already marked applied, so re-apply
-- effective table grants and RLS settings in a new migration.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Minimum grants required before RLS policies can be evaluated.
GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.seller_applications TO authenticated;
GRANT SELECT ON TABLE public.shops TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.shops TO authenticated;
GRANT SELECT ON TABLE public.logs TO authenticated;

-- Keep RLS enabled but do not force owner through RLS.
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seller_applications NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shops NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs NO FORCE ROW LEVEL SECURITY;
