import type { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'

/** Wajib header `Authorization: Bearer <jwt>`. Set `jwtUserId` di context. */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const header = c.req.header('Authorization')

  const raw = header?.startsWith('Bearer ') ? header.slice(7) : null
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
