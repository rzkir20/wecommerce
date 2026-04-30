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
  /**
   * Prisma pakai `DATABASE_URL`. Kalau kosong, akan di-build dari variabel MYSQL_*.
   * (Tetap disediakan supaya kompatibel dengan setup lama.)
   */
  DATABASE_URL: z.string().optional(),
  MYSQL_HOST: z.string().default('127.0.0.1'),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_USER: z.string().default('root'),
  MYSQL_PASSWORD: z.string().default(''),
  MYSQL_DATABASE: z.string().default('wecommerce'),
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
  const env = parsed.data
  if (!env.DATABASE_URL) {
    const user = encodeURIComponent(env.MYSQL_USER)
    const pass = encodeURIComponent(env.MYSQL_PASSWORD)
    const auth = env.MYSQL_PASSWORD ? `${user}:${pass}` : `${user}:`
    env.DATABASE_URL = `mysql://${auth}@${env.MYSQL_HOST}:${env.MYSQL_PORT}/${env.MYSQL_DATABASE}`
  }
  // Prisma client membaca dari `process.env.DATABASE_URL`
  process.env.DATABASE_URL = env.DATABASE_URL
  return env
}
