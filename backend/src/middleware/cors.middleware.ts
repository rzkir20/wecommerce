import { cors } from 'hono/cors'

import type { AppEnv } from '../env.js'

function parseAllowedOrigins(value?: string): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function corsMiddleware(env: AppEnv) {
  const allowedOrigins = parseAllowedOrigins(env.CORS_ORIGIN)
  const fallbackOrigin = allowedOrigins[0]

  return cors({
    origin: (origin) => {
      if (!origin) return fallbackOrigin ?? ''
      if (allowedOrigins.length === 0) return origin
      if (allowedOrigins.includes(origin)) return origin
      return fallbackOrigin ?? ''
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    credentials: true,
    maxAge: 86400,
  })
}
