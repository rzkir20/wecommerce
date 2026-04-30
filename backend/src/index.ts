/**
 * Cloudflare Worker entrypoint.
 * Keep this file Worker-safe (no mysql2/Node-only imports), otherwise wrangler bundling fails.
 */
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) =>
  c.json({
    ok: true,
    service: 'wecommerce-api-worker',
    message:
      'Worker aktif, tapi auth API berbasis MySQL Node runtime dijalankan via server Node.',
  }),
)

export default app
