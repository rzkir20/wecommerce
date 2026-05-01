import { getCookie } from 'hono/cookie'

import { createMiddleware } from 'hono/factory'

import { AUTH_COOKIE } from '../constants/auth.js'

import { verifyAuthToken } from '../lib/auth.js'

import { supabaseAdmin } from '../lib/supabase.js'

import type { AppBindings } from '../types/hono-env.js'

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
    .select('id, name, email')
    .eq('id', payload.sub)
    .maybeSingle()

  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('authUser', user)
  await next()
})
