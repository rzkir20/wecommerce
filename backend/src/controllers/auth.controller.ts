import type { Context } from 'hono'

import { deleteCookie, setCookie } from 'hono/cookie'

import { sign } from 'hono/jwt'

import bcrypt from 'bcryptjs'

import { getPrisma } from '../lib/db.js'

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function buildAuthTokenAndUser(
  c: Context,
  userId: string,
): Promise<{ token: string; user: AuthUser }> {
  const { JWT_SECRET } = c.get('env')
  const prisma = getPrisma()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
      role: true,
      isVerified: true,
    },
  })
  if (!user) {
    throw new Error('User not found')
  }

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
  const { SESSION_COOKIE_DOMAIN } = c.get('env')
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    path: '/',
    maxAge: JWT_EXPIRES_SEC,
    ...(SESSION_COOKIE_DOMAIN ? { domain: SESSION_COOKIE_DOMAIN } : {}),
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

  const id = crypto.randomUUID()
  const passwordHash = bcrypt.hashSync(password, 10)
  const prisma = getPrisma()

  try {
    await prisma.user.create({
      data: {
        id,
        email,
        name,
        avatar: avatar || null,
        phone: phone || null,
        role,
        isVerified,
        passwordHash,
      },
      select: { id: true },
    })
  } catch (e: unknown) {
    // Prisma: unique constraint violation
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
      return c.json({ error: 'Email already registered' }, 409)
    }
    console.error(e)
    return c.json({ error: 'Registration failed' }, 500)
  }

  const { token } = await buildAuthTokenAndUser(c, id)
  setSessionCookie(c, token)

  return c.json({
    token,
    user: {
      id,
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

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
      role: true,
      isVerified: true,
      passwordHash: true,
    },
  })
  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const ok = bcrypt.compareSync(password, user.passwordHash)
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
      isVerified: user.isVerified,
    },
  })
}

export async function me(c: Context) {
  const userId = c.get('jwtUserId')
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
      role: true,
      isVerified: true,
    },
  })
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return c.json({ user })
}

export async function logout(c: Context) {
  const { SESSION_COOKIE_DOMAIN } = c.get('env')
  deleteCookie(c, SESSION_COOKIE, {
    path: '/',
    ...(SESSION_COOKIE_DOMAIN ? { domain: SESSION_COOKIE_DOMAIN } : {}),
  })
  return c.json({ ok: true })
}
