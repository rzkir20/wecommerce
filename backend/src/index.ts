/**
 * Cloudflare Worker entrypoint.
 * Keep this file Worker-safe (no Prisma imports), otherwise wrangler bundling fails.
 */
import { Hono } from 'hono'

type WorkerBindings = {
  API_ORIGIN?: string
  CORS_ORIGIN?: string
}

const app = new Hono<{ Bindings: WorkerBindings }>()

function readApiOrigin(raw?: string): string {
  const fromEnv = raw?.trim()
  if (!fromEnv) return ''

  try {
    return new URL(fromEnv).origin
  } catch {
    return ''
  }
}

function parseAllowedOrigins(raw?: string): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function resolveCorsOrigin(requestOrigin: string | null, allowedOrigins: string[]): string {
  if (!requestOrigin) return ''
  if (allowedOrigins.length === 0) return requestOrigin
  return allowedOrigins.includes(requestOrigin) ? requestOrigin : ''
}

function appendCorsHeaders(
  headers: Headers,
  allowedOrigin: string,
  requestHeaders: string | null,
) {
  if (!allowedOrigin) return

  headers.set('Access-Control-Allow-Origin', allowedOrigin)
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set(
    'Access-Control-Allow-Headers',
    requestHeaders ?? 'Content-Type, Authorization',
  )
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  headers.set('Vary', 'Origin')
}

app.get('/', (c) =>
  c.json({
    ok: true,
    service: 'wecommerce-api-worker',
    mode: 'proxy',
    proxied_to: readApiOrigin(c.env.API_ORIGIN) || null,
  }),
)

app.options('/api/*', (c) => {
  const allowedOrigins = parseAllowedOrigins(c.env.CORS_ORIGIN)
  const requestOrigin = c.req.header('Origin') ?? null
  const allowedOrigin = resolveCorsOrigin(requestOrigin, allowedOrigins)

  const headers = new Headers()
  appendCorsHeaders(
    headers,
    allowedOrigin,
    c.req.header('Access-Control-Request-Headers') ?? null,
  )

  return new Response(null, { status: 204, headers })
})

app.all('/api/*', async (c) => {
  const apiOrigin = readApiOrigin(c.env.API_ORIGIN)
  if (!apiOrigin) {
    return c.json(
      {
        ok: false,
        message:
          'API_ORIGIN belum di-set atau tidak valid pada Worker environment variables.',
      },
      500,
    )
  }

  const url = new URL(c.req.url)
  const target = new URL(`${url.pathname}${url.search}`, apiOrigin)
  const upstreamRequest = new Request(target.toString(), c.req.raw)

  try {
    const upstreamResponse = await fetch(upstreamRequest)
    const responseHeaders = new Headers(upstreamResponse.headers)

    const allowedOrigins = parseAllowedOrigins(c.env.CORS_ORIGIN)
    const requestOrigin = c.req.header('Origin') ?? null
    const allowedOrigin = resolveCorsOrigin(requestOrigin, allowedOrigins)
    appendCorsHeaders(
      responseHeaders,
      allowedOrigin,
      c.req.header('Access-Control-Request-Headers') ?? null,
    )

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    })
  } catch {
    return c.json(
      {
        ok: false,
        message: 'Upstream API_ORIGIN tidak bisa dijangkau dari Worker.',
      },
      502,
    )
  }
})

app.all('*', (c) => c.text('404 Not Found', 404))

export default app