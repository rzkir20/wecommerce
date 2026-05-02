import type { Context } from 'hono'

import { deleteCookie, setCookie } from 'hono/cookie'

import { env } from '../config/env.js'

import { AUTH_COOKIE } from '../constants/auth.js'

import { parseLoginInput, parseRegisterInput } from '../lib/auth.js'

import { loginUser, registerUser } from '../services/auth.service.js'

import type { AppBindings } from '../types/hono-env.js'

function isHttps(c: Context): boolean {
  const forwarded = c.req.header('x-forwarded-proto')
  if (forwarded) return forwarded.split(',')[0]?.trim() === 'https'
  try {
    return new URL(c.req.url).protocol === 'https:'
  } catch {
    return false
  }
}

function sessionCookieBase(c: Context) {
  const secure = isHttps(c)
  return {
    path: '/' as const,
    httpOnly: true as const,
    sameSite: 'Lax' as const,
    secure,
    ...(env.sessionCookieDomain ? { domain: env.sessionCookieDomain } : {}),
  }
}

function setSessionCookie(c: Context, token: string) {
  setCookie(c, AUTH_COOKIE, token, {
    ...sessionCookieBase(c),
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function registerController(c: Context) {
  const body = await c.req.json().catch(() => null)
  const parsed = parseRegisterInput(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }, 400)
  }

  try {
    const result = await registerUser(parsed.data)
    if (!result.ok) {
      const status = (result.httpStatus ?? 409) as 409 | 503
      return c.json(
        {
          error: result.error,
          ...(result.debugCode ? { code: result.debugCode } : {}),
        },
        status,
      )
    }

    setSessionCookie(c, result.token)
    return c.json({ user: result.user }, 201)
  } catch (err) {
    console.error('[register]', err)
    const detail =
      env.exposeErrorDetails && err instanceof Error ? err.message : undefined
    return c.json(
      { error: 'Registrasi gagal diproses.', ...(detail ? { detail } : {}) },
      503,
    )
  }
}

export async function loginController(c: Context) {
  const body = await c.req.json().catch(() => null)
  const parsed = parseLoginInput(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }, 400)
  }

  try {
    const result = await loginUser(parsed.data)
    if (!result.ok) {
      const status = (result.httpStatus ?? 401) as 401 | 503
      return c.json(
        {
          error: result.error,
          ...(result.debugCode ? { code: result.debugCode } : {}),
        },
        status,
      )
    }

    setSessionCookie(c, result.token)
    return c.json({ user: result.user })
  } catch (err) {
    console.error('[login]', err)
    const detail =
      env.exposeErrorDetails && err instanceof Error ? err.message : undefined
    return c.json(
      { error: 'Login gagal diproses.', ...(detail ? { detail } : {}) },
      503,
    )
  }
}

export async function meController(c: Context<AppBindings>) {
  return c.json({ user: c.get('authUser') })
}

export function logoutController(c: Context) {
  deleteCookie(c, AUTH_COOKIE, sessionCookieBase(c))
  return c.json({ ok: true })
}
