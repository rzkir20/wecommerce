import { prisma } from '../lib/prisma.js'

import { supabaseAdmin } from '../lib/supabase.js'

import { comparePassword, hashPassword, signAuthToken } from '../lib/auth.js'
import type { AuthUser } from '../types/hono-env.js'

type AuthResult =
  | { ok: true; user: AuthUser; token: string }
  | { ok: false; error: string }

export async function registerUser(input: {
  name: string
  email: string
  password: string
}): Promise<AuthResult> {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  const passwordHash = await hashPassword(input.password)

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { ok: false, error: 'Email sudah terdaftar' }
  }

  const { data: authCreated, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      name,
    },
  })

  if (authCreateError || !authCreated.user) {
    return {
      ok: false,
      error: authCreateError?.message ?? 'Gagal membuat user Authentication',
    }
  }

  const authUserId = authCreated.user.id

  let user: AuthUser
  try {
    user = await prisma.user.create({
      data: {
        id: authUserId,
        name,
        email,
        password_hash: passwordHash,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
  } catch {
    // Keep Supabase Auth and app table in sync if DB insert fails.
    await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => null)
    return { ok: false, error: 'Gagal menyimpan user ke database aplikasi' }
  }

  const token = await signAuthToken({
    sub: user.id,
    name: user.name,
    email: user.email,
  })

  return {
    ok: true,
    user,
    token,
  }
}

export async function loginUser(input: {
  email: string
  password: string
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { ok: false, error: 'Email atau password salah' }
  }

  const validPassword = await comparePassword(input.password, user.password_hash)
  if (!validPassword) {
    return { ok: false, error: 'Email atau password salah' }
  }

  const token = await signAuthToken({
    sub: user.id,
    name: user.name,
    email: user.email,
  })

  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  }
}
