/**
 * Cloudflare Worker entrypoint.
 * Keep this file Worker-safe (no Prisma imports), otherwise wrangler bundling fails.
 */
import { Hono } from 'hono'

import type { Context } from 'hono'

type WorkerBindings = {
  API_ORIGIN?: string
}

const app = new Hono<{ Bindings: WorkerBindings }>()

function readApiOrigin(c: Context<{ Bindings: WorkerBindings }>) {
  const fromEnv = c.env.API_ORIGIN?.trim()
  if (!fromEnv) return ''

  try {
    return new URL(fromEnv).origin
  } catch {
    return fromEnv.replace(/\/$/, '')
  }
}

app.get('/', (c) =>
  c.json({
    ok: true,
    service: 'wecommerce-api-worker',
    message: 'Worker aktif sebagai reverse proxy ke Node backend.',
    proxied_to: c.env.API_ORIGIN ?? null,
  }),
)

app.all('/api/*', async (c) => {
  const apiOrigin = readApiOrigin(c)
  if (!apiOrigin) {
    return c.json(
      {
        ok: false,
        message: 'API_ORIGIN belum di-set pada Worker environment variables.',
      },
      500,
    )
  }

  const url = new URL(c.req.url)
  const target = `${apiOrigin}${url.pathname}${url.search}`
  const request = new Request(target, c.req.raw)

  return fetch(request)
})

app.all('*', (c) => c.text('404 Not Found', 404))

export default app