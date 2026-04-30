import type { Context } from 'hono'

import { deleteCookie, setCookie } from 'hono/cookie'

import { sign } from 'hono/jwt'

import bcrypt from 'bcryptjs'

import { getDb } from '../lib/db.js'

const JWT_EXPIRES_SEC = 60 * 60 * 24 * 7

const SESSION_COOKIE = 'session'

const ALLOWED_ROLES = ['super_admins', 'affiliate', 'users', 'seller'] as const
type UserRole = (typeof ALLOWED_ROLES)[number]

export type AuthUser = {
  id: string
  email: string
  name: string
  avatar: string | null
  phone: string | null
  role: UserRole
  isVerified: boolean
}

type DbUserRow = {
  id: string
  email: string
  name: string
  avatar: string | null
  phone: string | null
  role: UserRole
  is_verified: boolean
  password_hash: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function toAuthUser(row: DbUserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    phone: row.phone,
    role: row.role,
    isVerified: row.is_verified,
  }
}

async function getUserById(userId: string): Promise<DbUserRow | null> {
  const db = getDb()
  const { data, error } = await db
    .from('users')
    .select('id, email, name, avatar, phone, role, is_verified, password_hash')
    .eq('id', userId)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as DbUserRow | null) ?? null
}

async function getUserByEmail(email: string): Promise<DbUserRow | null> {
  const db = getDb()
  const { data, error } = await db
    .from('users')
    .select('id, email, name, avatar, phone, role, is_verified, password_hash')
    .eq('email', email)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as DbUserRow | null) ?? null
}

function isHttpsRequest(c: Context): boolean {
  const forwardedProto = c.req.header('x-forwarded-proto')
  if (forwardedProto) {
    return forwardedProto.split(',')[0]?.trim().toLowerCase() === 'https'
  }
  return c.req.url.startsWith('https://')
}

function resolveCookieDomain(c: Context): string | undefined {
  const { SESSION_COOKIE_DOMAIN } = c.get('env')
  if (!SESSION_COOKIE_DOMAIN) return undefined

  const requestHost = new URL(c.req.url).hostname.toLowerCase()
  const configured = SESSION_COOKIE_DOMAIN.toLowerCase()
  const normalized = configured.startsWith('.') ? configured.slice(1) : configured

  if (requestHost === normalized || requestHost.endsWith(`.${normalized}`)) {
    return configured
  }

  return undefined
}

export async function buildAuthTokenAndUser(
  c: Context,
  userId: string,
): Promise<{ token: string; user: AuthUser }> {
  const { JWT_SECRET } = c.get('env')
  const row = await getUserById(userId)
  if (!row) {
    throw new Error('User not found')
  }
  const user = toAuthUser(row)

  const now = Math.floor(Date.now() / 1000)
  const token = await sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      iat: now,
      exp: now + JWT_EXPIRES_SEC,
    },
    JWT_SECRET,
  )

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    },
  }
}

export function setSessionCookie(c: Context, token: string) {
  const { SESSION_COOKIE_SECURE, SESSION_COOKIE_SAMESITE } = c.get('env')
  const sameSite =
    SESSION_COOKIE_SAMESITE === 'strict'
      ? 'Strict'
      : SESSION_COOKIE_SAMESITE === 'none'
        ? 'None'
        : 'Lax'
  // Cookie SameSite=None wajib Secure=true, kalau tidak browser akan drop cookie.
  const secure = sameSite === 'None' ? true : (SESSION_COOKIE_SECURE ?? isHttpsRequest(c))
  const domain = resolveCookieDomain(c)
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: JWT_EXPIRES_SEC,
    ...(domain ? { domain } : {}),
  })
}

export async function register(c: Context) {
  let body: {
    email?: string
    password?: string
    name?: string
    avatar?: string
    phone?: string
    role?: string
  }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const name = String(body.name ?? '').trim()
  const avatar = String(body.avatar ?? '').trim()
  const phone = String(body.phone ?? '').trim()
  const role = String(body.role ?? 'users').trim() as UserRole
  const isVerified = false

  if (!name || name.length < 2) {
    return c.json({ error: 'Name must be at least 2 characters' }, 400)
  }
  if (!isValidEmail(email)) {
    return c.json({ error: 'Invalid email address' }, 400)
  }
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400)
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return c.json({ error: 'Role must be one of: super_admins, affiliate, users, seller' }, 400)
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const db = getDb()
  let authUserId: string | null = null

  try {
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    })
    if (authError) throw authError
    authUserId = authData.user?.id ?? null
    if (!authUserId) {
      throw new Error('Supabase auth user not created')
    }

    const { error } = await db.from('users').insert({
      id: authUserId,
      email,
      name,
      avatar: avatar || null,
      phone: phone || null,
      role,
      is_verified: isVerified,
      password_hash: passwordHash,
    })
    if (error) throw error
  } catch (e: unknown) {
    if (
      e &&
      typeof e === 'object' &&
      'message' in e &&
      typeof (e as { message?: string }).message === 'string' &&
      (e as { message: string }).message.toLowerCase().includes('already')
    ) {
      return c.json({ error: 'Email already registered' }, 409)
    }
    if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === '23505') {
      return c.json({ error: 'Email already registered' }, 409)
    }
    if (authUserId) {
      await db.auth.admin.deleteUser(authUserId).catch(() => {
        // Best effort rollback when app table insert fails after auth user creation.
      })
    }
    console.error(e)
    return c.json({ error: 'Registration failed' }, 500)
  }

  if (!authUserId) {
    return c.json({ error: 'Registration failed' }, 500)
  }

  const { token } = await buildAuthTokenAndUser(c, authUserId)
  setSessionCookie(c, token)

  return c.json({
    token,
    user: {
      id: authUserId,
      email,
      name,
      avatar: avatar || null,
      phone: phone || null,
      role,
      isVerified,
    },
  })
}

export async function login(c: Context) {
  let body: { email?: string; password?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  if (!isValidEmail(email) || !password) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const user = await getUserByEmail(email)
  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const ok = bcrypt.compareSync(password, user.password_hash)
  if (!ok) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const { token } = await buildAuthTokenAndUser(c, user.id)
  setSessionCookie(c, token)

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      isVerified: user.is_verified,
    },
  })
}

export async function me(c: Context) {
  const userId = c.get('jwtUserId')
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const row = await getUserById(userId)
  if (!row) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return c.json({ user: toAuthUser(row) })
}

export async function logout(c: Context) {
  const domain = resolveCookieDomain(c)
  deleteCookie(c, SESSION_COOKIE, {
    path: '/',
    ...(domain ? { domain } : {}),
  })
  return c.json({ ok: true })
}
