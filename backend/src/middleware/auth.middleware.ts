import { getCookie } from 'hono/cookie'

import { createMiddleware } from 'hono/factory'

import { AUTH_COOKIE } from '../constants/auth.js'

import { verifyAuthToken } from '../lib/auth.js'

import { supabaseAdmin } from '../lib/supabase.js'

import type { AppBindings } from '../types/hono-env.js'

import type { UserRole } from '../types/user-role.js'

export const requireAuth = createMiddleware<AppBindings>(async (c, next) => {
  const token = getCookie(c, AUTH_COOKIE)
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const payload = await verifyAuthToken(token)
  if (!payload?.sub) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, phone')
    .eq('id', payload.sub)
    .maybeSingle()

  if (error) {
    console.error('[requireAuth]', error)
    return c.json({ error: 'Service unavailable' }, 503)
  }

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('authUser', user)
  await next()
})

export function requireRole(allowed: UserRole[]) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const authUser = c.get('authUser')
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: row, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle()

    if (error) {
      console.error('[requireRole]', error)
      return c.json({ error: 'Service unavailable' }, 503)
    }

    const role = row?.role as UserRole | undefined
    if (!role || !allowed.includes(role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await next()
  })
}
