import { cors } from 'hono/cors'

import type { AppEnv } from '../env.js'

export function corsMiddleware(env: AppEnv) {
  return cors({
    origin: (origin, c) => {
      const allowed = c.get('env').CORS_ORIGIN
      if (!origin) return allowed
      if (origin === allowed) return origin
      return allowed
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    credentials: true,
    maxAge: 86400,
  })
}
