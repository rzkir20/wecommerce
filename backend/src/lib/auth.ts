import bcrypt from 'bcryptjs'
import { sign, verify } from 'hono/jwt'
import { z } from 'zod'

import { env } from '../config/env.js'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter'),
  email: z.string().trim().email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
})

const loginSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export type AuthTokenPayload = {
  sub: string
  email: string
  name: string
  iss?: string
  exp?: number
  iat?: number
}

export function parseRegisterInput(input: unknown) {
  return registerSchema.safeParse(input)
}

export function parseLoginInput(input: unknown) {
  return loginSchema.safeParse(input)
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return sign(
    {
      ...payload,
      iat: now,
      exp: now + 60 * 60 * 24 * 7,
      iss: 'wecommerce-backend',
    },
    env.jwtSecret
  )
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const payload = (await verify(token, env.jwtSecret, 'HS256')) as AuthTokenPayload
    if (payload.iss !== 'wecommerce-backend') {
      return null
    }
    return payload
  } catch {
    return null
  }
}
