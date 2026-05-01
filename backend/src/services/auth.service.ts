import { supabaseAdmin } from '../lib/supabase.js'

import { hashPassword, signAuthToken } from '../lib/auth.js'
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

  const { data: existingUser, error: existingUserError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingUserError) {
    return { ok: false, error: 'Gagal memeriksa email user' }
  }

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

  const { data: createdUser, error: createUserError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authUserId,
      name,
      email,
      password_hash: passwordHash,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    })
    .select('id, name, email')
    .single()

  if (createUserError || !createdUser) {
    // Keep Supabase Auth and app table in sync if DB insert fails.
    await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => null)
    return { ok: false, error: 'Gagal menyimpan user ke database aplikasi' }
  }

  const user: AuthUser = {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
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

  if (authSignInError || !authSignInData.user) {
    return { ok: false, error: 'Email atau password salah' }
  }

  const { data: userRow, error: userRowError } = await supabaseAdmin
    .from('users')
    .select('id, name, email')
    .eq('id', authSignInData.user.id)
    .maybeSingle()

  if (userRowError) {
    return { ok: false, error: 'Gagal mengambil profil user' }
  }

  const user: AuthUser = {
    id: authSignInData.user.id,
    name: userRow?.name ?? authSignInData.user.user_metadata?.name ?? email.split('@')[0] ?? 'User',
    email: userRow?.email ?? authSignInData.user.email ?? email,
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
