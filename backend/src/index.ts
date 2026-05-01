import { Hono } from 'hono'

import { serve } from '@hono/node-server'

import { Prisma } from '@prisma/client'

import { cors } from 'hono/cors'

import { env } from './config/env.js'

import { authRoutes } from './routes/auth.routes.js'

import { healthRoutes } from './routes/health.routes.js'

import type { AppBindings } from './types/hono-env.js'

const app = new Hono<AppBindings>()

app.onError((err, c) => {
  console.error(err)

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return c.json(
      {
        error: 'Database tidak bisa diakses. Cek koneksi database/server.',
      },
      503
    )
  }

  return c.json(
    {
      error: 'Internal server error',
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

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    console.log(`Backend running on http://localhost:${info.port}`)
  }
)
