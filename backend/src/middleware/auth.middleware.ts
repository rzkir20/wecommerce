import type { MiddlewareHandler } from 'hono'

import { getCookie } from 'hono/cookie'

import { verify } from 'hono/jwt'

/** Auth via cookie session (`session`) dengan fallback Bearer token. */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const cookieToken = getCookie(c, 'session')
  const header = c.req.header('Authorization')
  const bearerToken = header?.startsWith('Bearer ') ? header.slice(7) : null
  const raw = cookieToken ?? bearerToken

  if (!raw) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { JWT_SECRET } = c.get('env')
    const decoded = await verify(raw, JWT_SECRET, 'HS256')
    const sub = typeof decoded.sub === 'string' ? decoded.sub : undefined
    if (!sub) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    c.set('jwtUserId', sub)
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}
