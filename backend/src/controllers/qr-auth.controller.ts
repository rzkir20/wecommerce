import type { Context } from 'hono'

import { setCookie } from 'hono/cookie'

import { z } from 'zod'

import { env } from '../config/env.js'

import { AUTH_COOKIE } from '../constants/auth.js'

import {
  approveQrLoginSession,
  createQrLoginSession,
  getQrLoginSessionStatus,
  markQrLoginSessionUsed,
} from '../services/qr-login.service.js'
import type { AppBindings } from '../types/hono-env.js'

const approveQrSchema = z
  .object({
    token: z.string().min(1).optional(),
    qrToken: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.token || data.qrToken), {
    message: 'Token QR wajib diisi',
    path: ['token'],
  })

function setSessionCookie(c: Context, token: string) {
  const forwarded = c.req.header('x-forwarded-proto')
  const secure =
    (forwarded ? forwarded.split(',')[0]?.trim() === 'https' : false) ||
    (() => {
      try {
        return new URL(c.req.url).protocol === 'https:'
      } catch {
        return false
      }
    })()

  setCookie(c, AUTH_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure,
    ...(env.sessionCookieDomain ? { domain: env.sessionCookieDomain } : {}),
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function startQrLoginController(c: Context) {
  const session = createQrLoginSession()
  return c.json(
    {
      qrToken: session.token,
      expiresAt: Date.parse(session.expiresAt),
      token: session.token,
      status: session.status,
      expiresAtIso: session.expiresAt,
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
    return c.json({ status: 'expired', expiresAt: result.expiresAt }, 404)
  }

  if (result.status === 'approved' && result.authToken && result.user) {
    setSessionCookie(c, result.authToken)
    markQrLoginSessionUsed(token)
    return c.json({
      status: 'approved',
      expiresAt: result.expiresAt,
      user: result.user,
    })
  }

  return c.json({ status: result.status, expiresAt: result.expiresAt })
}

export async function approveQrLoginController(c: Context<AppBindings>) {
  const body = await c.req.json().catch(() => null)
  const parsed = approveQrSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }, 400)
  }

  const qrToken = parsed.data.qrToken ?? parsed.data.token ?? ''

  const result = await approveQrLoginSession(qrToken, c.get('authUser'))
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
