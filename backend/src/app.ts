import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { env } from './config/env.js'

import { authRoutes } from './routes/auth.routes.js'

import { healthRoutes } from './routes/health.routes.js'

import { qrRoutes } from './routes/qr.routes.js'

import { sellerRoutes } from './routes/seller.routes.js'

import { shopsRoutes } from './routes/shops.routes.js'

import type { AppBindings } from './types/hono-env.js'

export const app = new Hono<AppBindings>()

app.onError((err, c) => {
  console.error(err)
  const message = err instanceof Error ? err.message : String(err)

  return c.json(
    {
      error: 'Internal server error',
      detail: message,
    },
    500
  )
})

app.use(
  '*',
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
)

app.route('/', healthRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/qr', qrRoutes)
app.route('/api/seller', sellerRoutes)
app.route('/api/shops', shopsRoutes)
