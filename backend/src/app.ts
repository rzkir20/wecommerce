import './types/hono-env.js'

import { Hono } from 'hono'

import type { AppEnv } from './env.js'

import { errorHandler } from './middleware/error.middleware.js'

import { corsMiddleware } from './middleware/cors.middleware.js'

import { envMiddleware } from './middleware/env.middleware.js'

import { authRoutes } from './routes/auth.routes.js'

export function createApp(env: AppEnv) {
  const app = new Hono()

  app.onError(errorHandler)

  app.use('*', envMiddleware(env))
  app.use('*', corsMiddleware(env))

  app.get('/', (c) =>
    c.json({
      ok: true,
      service: 'wecommerce-api',
      auth: '/api/auth',
    }),
  )

  app.route('/api/auth', authRoutes)

  return app
}
