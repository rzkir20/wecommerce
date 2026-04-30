import { config } from 'dotenv'
import { z } from 'zod'

config()

const schema = z.object({
  PORT: z.coerce.number().default(8787),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET harus minimal 16 karakter (lihat .env.example)'),
  MYSQL_HOST: z.string().default('127.0.0.1'),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_USER: z.string().default('root'),
  MYSQL_PASSWORD: z.string().default(''),
  MYSQL_DATABASE: z.string().default('wecommerce'),
  CORS_ORIGIN: z.string().optional(),
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
