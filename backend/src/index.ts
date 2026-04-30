/**
 * Cloudflare Worker entrypoint.
 * Keep this file Worker-safe (no Prisma imports), otherwise wrangler bundling fails.
 */
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) =>
  c.json({
    ok: true,
    service: 'wecommerce-api-worker',
    message:
      'Worker aktif, tapi auth API berbasis Prisma/MySQL harus dijalankan di Node runtime.',
  }),
)

export default app