import { serve } from '@hono/node-server'

import { env } from './config/env.js'

import { app } from './app.js'

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    console.log(`Backend running on http://localhost:${info.port}`)
  }
)
