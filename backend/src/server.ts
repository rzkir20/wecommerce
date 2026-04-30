import './types/hono-env.js'

import { serve } from '@hono/node-server'

import { createApp } from './app.js'
import { loadEnv } from './env.js'
import { initDb } from './lib/db.js'

const env = loadEnv()
initDb(env)
const app = createApp(env)

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`API http://localhost:${info.port}`)
    console.log(`Auth http://localhost:${info.port}/api/auth`)
  },
)
