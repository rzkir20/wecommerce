import './types/hono-env.js'

import { Hono } from 'hono'

import { cors } from 'hono/cors'

import type { AppEnv } from './env.js'

import { errorHandler } from './middleware/error.middleware.js'

import { envMiddleware } from './middleware/env.middleware.js'

import { authRoutes } from './routes/auth.routes.js'

import { qrRoutes } from './routes/qr.routes.js'

function normalizeOrigin(origin: string): string {
  const trimmed = origin.trim()
  if (!trimmed) return ''

  try {
    const url = new URL(trimmed)
    return url.origin.toLowerCase()
  } catch {
    return trimmed.replace(/\/$/, '').toLowerCase()
  }
}

function parseAllowedOrigins(value?: string): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((item) => normalizeOrigin(item))
    .filter(Boolean)
}

export function createApp(env: AppEnv) {
  const app = new Hono()
  const allowedOrigins = parseAllowedOrigins(env.CORS_ORIGIN)

  app.onError(errorHandler)

  app.use('*', envMiddleware(env))
  app.use(
    '*',
    cors({
      origin: (origin) => {
        if (!origin) return ''
        if (allowedOrigins.length === 0) return origin

        const requestOrigin = normalizeOrigin(origin)
        if (allowedOrigins.includes(requestOrigin)) return requestOrigin
        return ''
      },
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      exposeHeaders: ['Content-Length'],
      credentials: true,
      maxAge: 86400,
    }),
  )

  app.get('/', (c) =>
    c.json({
      ok: true,
      service: 'wecommerce-api',
      auth: '/api/auth',
      qr: '/api/qr',
    }),
  )

  app.route('/api/auth', authRoutes)
  app.route('/api/qr', qrRoutes)

  return app
}
