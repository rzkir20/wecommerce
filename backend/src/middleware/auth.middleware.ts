import { getCookie } from 'hono/cookie'

import { createMiddleware } from 'hono/factory'

import { AUTH_COOKIE } from '../constants/auth.js'

import { verifyAuthToken } from '../lib/auth.js'

import { prisma } from '../lib/prisma.js'

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

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('authUser', user)
  await next()
})
