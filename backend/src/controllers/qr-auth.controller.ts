import type { Context } from 'hono'

import { setCookie } from 'hono/cookie'

import { z } from 'zod'

import { AUTH_COOKIE } from '../constants/auth.js'

import {
  approveQrLoginSession,
  createQrLoginSession,
  getQrLoginSessionStatus,
  markQrLoginSessionUsed,
} from '../services/qr-login.service.js'
import type { AppBindings } from '../types/hono-env.js'

const approveQrSchema = z.object({
  token: z.string().min(1, 'Token QR wajib diisi'),
})

function setSessionCookie(c: Context, token: string) {
  setCookie(c, AUTH_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: false,
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function startQrLoginController(c: Context) {
  const session = createQrLoginSession()
  return c.json(
    {
      token: session.token,
      status: session.status,
      expiresAt: session.expiresAt,
      // String ini bisa langsung dijadikan isi QR di frontend.
      qrValue: session.token,
    },
    201
  )
}

export function qrLoginStatusController(c: Context) {
  const token = c.req.param('token')
  if (!token) {
    return c.json({ error: 'Token QR wajib diisi' }, 400)
  }

  const result = getQrLoginSessionStatus(token)

  if (!result.found) {
    return c.json({ status: 'expired' }, 404)
  }

  if (result.status === 'approved' && result.authToken && result.user) {
    setSessionCookie(c, result.authToken)
    markQrLoginSessionUsed(token)
    return c.json({
      status: 'approved',
      user: result.user,
    })
  }

  return c.json({ status: result.status })
}

export async function approveQrLoginController(c: Context<AppBindings>) {
  const body = await c.req.json().catch(() => null)
  const parsed = approveQrSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }, 400)
  }

  const result = await approveQrLoginSession(parsed.data.token, c.get('authUser'))
  if (!result.ok) {
    if (result.status === 404) {
      return c.json({ error: result.error }, 404)
    }
    if (result.status === 410) {
      return c.json({ error: result.error }, 410)
    }
    return c.json({ error: result.error }, 409)
  }

  return c.json({ ok: true, status: result.status })
}
