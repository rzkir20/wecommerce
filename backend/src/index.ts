/**
 * Cloudflare Worker entrypoint.
 * Keep this file Worker-safe (no mysql2/Node-only imports), otherwise wrangler bundling fails.
 */
import { Hono } from 'hono'

type WorkerBindings = {
  CORS_ORIGIN?: string
  API_ORIGIN?: string
}

const app = new Hono<{ Bindings: WorkerBindings }>()

function resolveAllowedOrigin(c: { req: { header: (name: string) => string | undefined }; env: WorkerBindings }) {
  const allowed = c.env.CORS_ORIGIN
  const origin = c.req.header('Origin')
  if (!allowed) return origin
  if (!origin) return allowed
  if (origin === allowed) return origin
  return allowed
}

function withCorsHeaders(headers: Headers, allowedOrigin: string | undefined) {
  if (!allowedOrigin) return
  headers.set('Access-Control-Allow-Origin', allowedOrigin)
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  headers.set('Access-Control-Expose-Headers', 'Content-Length')
}

app.options('/api/*', (c) => {
  const headers = new Headers()
  withCorsHeaders(headers, resolveAllowedOrigin(c))
  headers.set('Access-Control-Max-Age', '86400')
  return new Response(null, { status: 204, headers })
})

app.all('/api/*', async (c) => {
  const targetOrigin = c.env.API_ORIGIN
  if (!targetOrigin) {
    return c.json(
      {
        error: 'API_ORIGIN is not configured',
      },
      500,
    )
  }

  const incoming = new URL(c.req.url)
  const upstreamUrl = `${targetOrigin}${incoming.pathname}${incoming.search}`
  const reqHeaders = new Headers(c.req.raw.headers)
  reqHeaders.delete('host')

  const upstreamRes = await fetch(upstreamUrl, {
    method: c.req.method,
    headers: reqHeaders,
    body: c.req.method === 'GET' || c.req.method === 'HEAD' ? undefined : c.req.raw.body,
    redirect: 'manual',
  })

  const headers = new Headers(upstreamRes.headers)
  withCorsHeaders(headers, resolveAllowedOrigin(c))
  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers,
  })
})

app.get('/', (c) =>
  c.json({
    ok: true,
    service: 'wecommerce-api-worker',
    message: 'Worker aktif sebagai edge proxy untuk /api/* ke backend Node.',
  }),
)

export default app
