import { Prisma } from '@prisma/client'

import { hashPassword, signAuthToken } from '../lib/auth.js'

import { prisma } from '../lib/prisma.js'

import { supabaseAdmin } from '../lib/supabase.js'

import type { AuthUser } from '../types/hono-env.js'

type AuthResult =
  | { ok: true; user: AuthUser; token: string }
  | { ok: false; error: string }

export async function registerUser(input: {
  name: string
  email: string
  phone?: string
  password: string
}): Promise<AuthResult> {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  const phone = input.phone?.trim() ? input.phone.trim().slice(0, 32) : null
  const passwordHash = await hashPassword(input.password)

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existing) {
    return { ok: false, error: 'Email sudah terdaftar' }
  }

  const { data: authCreated, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      name,
      ...(phone ? { phone } : {}),
    },
  })

  if (authCreateError || !authCreated.user) {
    return {
      ok: false,
      error: authCreateError?.message ?? 'Gagal membuat user Authentication',
    }
  }

  const authUserId = authCreated.user.id

  let createdUser: { id: string; name: string; email: string; phone: string | null }
  try {
    createdUser = await prisma.user.create({
      data: {
        id: authUserId,
        name,
        email,
        phone,
        password_hash: passwordHash,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      },
      select: { id: true, name: true, email: true, phone: true },
    })
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => null)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { ok: false, error: 'Email sudah terdaftar' }
    }
    return { ok: false, error: 'Gagal menyimpan user ke database aplikasi' }
  }

  const user: AuthUser = {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    phone: createdUser.phone,
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
  const { data: authSignInData, error: authSignInError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password: input.password,
  })

  const supabaseUser = authSignInData?.user
  if (authSignInError || !supabaseUser) {
    return { ok: false, error: 'Email atau password salah' }
  }

  const userRow = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { id: true, name: true, email: true, phone: true },
  })

  if (!userRow) {
    return { ok: false, error: 'Gagal mengambil profil user' }
  }

  const user: AuthUser = {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    phone: userRow.phone,
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
