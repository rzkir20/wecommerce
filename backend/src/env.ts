import { config } from 'dotenv'
import { z } from 'zod'

config()

function normalizeCookieDomain(input: string): string {
  const value = input.trim()
  if (!value) return ''

  let hostname = value
  try {
    if (value.includes('://')) {
      hostname = new URL(value).hostname
    }
  } catch {
    hostname = value
  }

  hostname = hostname
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .trim()

  return hostname
}

const schema = z.object({
  PORT: z.coerce.number().default(8787),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET harus minimal 16 karakter (lihat .env.example)'),
  SUPABASE_URL: z.string().url('SUPABASE_URL wajib URL valid'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY wajib diisi'),
  CORS_ORIGIN: z.string().optional(),
  SESSION_COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      const normalized = normalizeCookieDomain(value)
      return normalized || undefined
    }),
  SESSION_COOKIE_SECURE: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      return value === 'true'
    }),
  SESSION_COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).optional(),
})

export type AppEnv = z.infer<typeof schema>

/** Baca & validasi `process.env` — dipasang ke Hono lewat `c.set('env', …)` */
export function loadEnv(): AppEnv {
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Env tidak valid:', parsed.error.flatten().fieldErrors)
    process.exit(1)
  }
  return parsed.data
}
