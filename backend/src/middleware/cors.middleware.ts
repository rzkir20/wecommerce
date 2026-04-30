import { cors } from 'hono/cors'

import type { AppEnv } from '../env.js'

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

export function corsMiddleware(env: AppEnv) {
  return cors({
    origin: (origin) => {
      const extra =
        env.CORS_ORIGIN?.split(',')
          .map((s) => s.trim())
          .filter(Boolean) ?? []
      const allowed = [...defaultOrigins, ...extra]
      if (!origin) return allowed[0]
      return allowed.includes(origin) ? origin : allowed[0]
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  })
}
