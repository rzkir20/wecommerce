import type { Context } from 'hono'

import { sign } from 'hono/jwt'

import bcrypt from 'bcryptjs'

import { getPool } from '../lib/db.js'

const JWT_EXPIRES_SEC = 60 * 60 * 24 * 7

type UserRow = {
  id: string
  email: string
  name: string
  password_hash: string
}

export type AuthUser = {
  id: string
  email: string
  name: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function rowToUser(row: UserRow): AuthUser {
  return { id: row.id, email: row.email, name: row.name }
}

export async function register(c: Context) {
  const { JWT_SECRET } = c.get('env')

  let body: { email?: string; password?: string; name?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const name = String(body.name ?? '').trim()

  if (!name || name.length < 2) {
    return c.json({ error: 'Name must be at least 2 characters' }, 400)
  }
  if (!isValidEmail(email)) {
    return c.json({ error: 'Invalid email address' }, 400)
  }
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400)
  }

  const id = crypto.randomUUID()
  const passwordHash = bcrypt.hashSync(password, 10)
  const pool = getPool()

  try {
    await pool.execute(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
      [id, email, name, passwordHash],
    )
  } catch (e: unknown) {
    const code =
      e && typeof e === 'object' && 'code' in e
        ? (e as { code: string }).code
        : ''
    if (code === 'ER_DUP_ENTRY') {
      return c.json({ error: 'Email already registered' }, 409)
    }
    console.error(e)
    return c.json({ error: 'Registration failed' }, 500)
  }

  const now = Math.floor(Date.now() / 1000)
  const token = await sign(
    { sub: id, email, name, iat: now, exp: now + JWT_EXPIRES_SEC },
    JWT_SECRET,
  )

  return c.json({
    token,
    user: { id, email, name },
  })
}

export async function login(c: Context) {
  const { JWT_SECRET } = c.get('env')

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

  const pool = getPool()
  const [rows] = await pool.execute(
    'SELECT id, email, name, password_hash FROM users WHERE email = ? LIMIT 1',
    [email],
  )

  const user = (rows as UserRow[])[0]
  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const ok = bcrypt.compareSync(password, user.password_hash)
  if (!ok) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const now = Math.floor(Date.now() / 1000)
  const token = await sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: now,
      exp: now + JWT_EXPIRES_SEC,
    },
    JWT_SECRET,
  )

  return c.json({
    token,
    user: rowToUser(user),
  })
}

export async function me(c: Context) {
  const userId = c.get('jwtUserId')
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const pool = getPool()
  const [rows] = await pool.execute(
    'SELECT id, email, name, password_hash FROM users WHERE id = ? LIMIT 1',
    [userId],
  )

  const user = (rows as UserRow[])[0]
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return c.json({ user: rowToUser(user) })
}
