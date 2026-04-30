/**
 * Cloudflare Worker entrypoint.
 * Keep this file Worker-safe (no mysql2/Node-only imports), otherwise wrangler bundling fails.
 */
import { Hono } from 'hono'

type WorkerBindings = {
  CORS_ORIGIN?: string
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
  const headers = new Headers()
  withCorsHeaders(headers, resolveAllowedOrigin(c))
  headers.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(
    JSON.stringify({
      error:
        'API proxy on Worker is disabled. Point be-commerce.rizkiramadhan.web.id directly to Node API origin.',
    }),
    { status: 503, headers },
  )
})

app.get('/', (c) =>
  c.json({
    ok: true,
    service: 'wecommerce-api-worker',
    message: 'Worker aktif sebagai edge proxy untuk /api/* ke backend Node.',
  }),
)

export default app
