import 'dotenv/config'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export const env = {
  port: Number(process.env.PORT ?? 8787),
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  /** Set to parent registrable domain (e.g. `.example.com`) so the session cookie is sent on both `www` and `api` subdomains. */
  sessionCookieDomain: process.env.SESSION_COOKIE_DOMAIN?.trim() || undefined,
}
