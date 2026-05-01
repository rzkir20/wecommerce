import type { Context } from 'hono'

import { deleteCookie, setCookie } from 'hono/cookie'

import { AUTH_COOKIE } from '../constants/auth.js'

import { parseLoginInput, parseRegisterInput } from '../lib/auth.js'

import { loginUser, registerUser } from '../services/auth.service.js'

import type { AppBindings } from '../types/hono-env.js'

function setSessionCookie(c: Context, token: string) {
  setCookie(c, AUTH_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: false,
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function registerController(c: Context) {
  const body = await c.req.json().catch(() => null)
  const parsed = parseRegisterInput(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }, 400)
  }

  const result = await registerUser(parsed.data)
  if (!result.ok) {
    return c.json({ error: result.error }, 409)
  }

  setSessionCookie(c, result.token)
  return c.json({ user: result.user }, 201)
}

export async function loginController(c: Context) {
  const body = await c.req.json().catch(() => null)
  const parsed = parseLoginInput(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }, 400)
  }

  const result = await loginUser(parsed.data)
  if (!result.ok) {
    return c.json({ error: result.error }, 401)
  }

  setSessionCookie(c, result.token)
  return c.json({ user: result.user })
}

export async function meController(c: Context<AppBindings>) {
  return c.json({ user: c.get('authUser') })
}

export function logoutController(c: Context) {
  deleteCookie(c, AUTH_COOKIE, {
    path: '/',
  })
  return c.json({ ok: true })
}
