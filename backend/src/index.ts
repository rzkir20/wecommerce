import { createApp } from './app.js'
import { loadEnv } from './env.js'
import { initDb } from './lib/db.js'

const env = loadEnv()
initDb(env)

const app = createApp(env)

export default app
