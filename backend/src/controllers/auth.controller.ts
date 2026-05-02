import type { Context } from 'hono'

import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import { env } from '../config/env.js'

import { AUTH_COOKIE } from '../constants/auth.js'

import { parseLoginInput, parseRegisterInput } from '../lib/auth.js'

import { loginUser, registerUser } from '../services/auth.service.js'
import {
  listLoginHistories,
  markLoginHistoryLoggedOut,
  recordLoginHistory,
} from '../services/login-history.service.js'

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

function resolveCookieDomain(c: Context): string | undefined {
  const configured = env.sessionCookieDomain
  if (!configured) return undefined

  const normalized = configured.startsWith('.') ? configured.slice(1) : configured
  try {
    const host = new URL(c.req.url).hostname.toLowerCase()
    if (host === normalized || host.endsWith(`.${normalized}`)) {
      return configured
    }
  } catch {
    return undefined
  }

  return undefined
}

function sessionCookieBase(c: Context) {
  const secure = isHttps(c)
  const domain = resolveCookieDomain(c)
  return {
    path: '/' as const,
    httpOnly: true as const,
    sameSite: 'Lax' as const,
    secure,
    ...(domain ? { domain } : {}),
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
          ...(result.postgrestMessage ? { message: result.postgrestMessage } : {}),
          ...(result.hint ? { hint: result.hint } : {}),
        },
        status,
      )
    }

    setSessionCookie(c, result.token)
    await recordLoginHistory(c, result.user, result.token)
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
          ...(result.postgrestMessage ? { message: result.postgrestMessage } : {}),
          ...(result.hint ? { hint: result.hint } : {}),
        },
        status,
      )
    }

    setSessionCookie(c, result.token)
    await recordLoginHistory(c, result.user, result.token)
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

export async function historiesController(c: Context<AppBindings>) {
  const authUser = c.get('authUser')
  const currentToken = getCookie(c, AUTH_COOKIE)
  const histories = await listLoginHistories(authUser.id, currentToken)
  return c.json({ histories })
}

export async function logoutController(c: Context) {
  const currentToken = getCookie(c, AUTH_COOKIE)
  await markLoginHistoryLoggedOut(currentToken)
  deleteCookie(c, AUTH_COOKIE, sessionCookieBase(c))
  return c.json({ ok: true })
}
