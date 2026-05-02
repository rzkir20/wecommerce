import type { PostgrestError } from '@supabase/supabase-js'

import { createClient } from '@supabase/supabase-js'

import { hashPassword, signAuthToken } from '../lib/auth.js'

import { env } from '../config/env.js'

import { supabaseAdmin } from '../lib/supabase.js'

import { writeAuditLog } from './audit-log.service.js'

import type { AuthUser } from '../types/hono-env.js'

type AuthResult =
  | { ok: true; user: AuthUser; token: string }
  | {
    ok: false
    error: string
    httpStatus?: 401 | 409 | 503
    debugCode?: string
    /** Dari PostgREST — bantu debug tanpa membuka log server. */
    postgrestMessage?: string
    hint?: string | null
  }

/** Pesan untuk error PostgREST ke tabel `users` (tabel belum dimigrasi, RLS, API key, dll.). */
function mapUsersTableError(err: PostgrestError): { error: string; debugCode: string } {
  const code = err.code ?? 'unknown'
  const msg = `${err.message ?? ''} ${err.details ?? ''} ${err.hint ?? ''}`.toLowerCase()

  if (
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table') ||
    msg.includes('undefined_table')
  ) {
    return {
      error:
        'Tabel public.users tidak ada di database Supabase project ini. Jalankan migrasi ke DB yang sama (mis. DATABASE_URL Supabase lalu `npx prisma migrate deploy`), lalu cek Table Editor.',
      debugCode: code,
    }
  }
  // Harus sebelum cabang "permission denied" umum (pesan ini juga mengandung kata permission).
  if (msg.includes('permission denied for schema') || msg.includes('denied for schema public')) {
    return {
      error:
        'Role API tidak punya USAGE pada schema public. Jalankan migrasi terbaru: `npx prisma migrate deploy` (DATABASE_URL = Postgres project Supabase yang sama). Atau jalankan SQL di Supabase → SQL Editor: GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;',
      debugCode: code,
    }
  }
  // 42501 / "permission denied" sering dari RLS jika yang terpasang bukan service_role, atau policy memblokir.
  if (
    msg.includes('row-level security') ||
    msg.includes('row level security') ||
    msg.includes('violates row-level security')
  ) {
    return {
      error:
        'Akses ke users ditolak oleh Row Level Security. Untuk Worker/backend wajib pakai **service_role** key (bukan anon). Di Supabase: Settings → API → *service_role* secret. Simpan lewat `wrangler secret put SUPABASE_SERVICE_ROLE_KEY` (hindari vars panjang di jsonc).',
      debugCode: code,
    }
  }
  if (msg.includes('permission denied') || code === '42501') {
    return {
      error:
        'PostgreSQL menolak akses (42501). Cek RLS, GRANT pada tabel, dan bahwa Worker memakai **service_role** key penuh (bukan anon).',
      debugCode: code,
    }
  }
  if (msg.includes('jwt') || msg.includes('invalid api') || msg.includes('api key')) {
    return {
      error: 'Konfigurasi Supabase tidak valid (URL atau service role key).',
      debugCode: code,
    }
  }

  return {
    error: 'Database tidak dapat diakses.',
    debugCode: code,
  }
}

function usersQueryFailure(err: PostgrestError, mapped: { error: string; debugCode: string }) {
  return {
    ok: false as const,
    error: mapped.error,
    httpStatus: 503 as const,
    debugCode: mapped.debugCode,
    postgrestMessage: err.message,
    hint: err.hint ?? undefined,
  }
}

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

  const { data: existing, error: existingErr } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingErr) {
    console.error('[registerUser] users lookup', existingErr)
    const mapped = mapUsersTableError(existingErr)
    return usersQueryFailure(existingErr, mapped)
  }

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

  const { data: createdUser, error: insertErr } = await supabaseAdmin
    .from('users')
    .insert({
      id: authUserId,
      name,
      email,
      phone,
      password_hash: passwordHash,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    })
    .select('id, name, email, phone')
    .single()

  if (insertErr || !createdUser) {
    await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => null)
    if (insertErr?.code === '23505') {
      return { ok: false, error: 'Email sudah terdaftar' }
    }
    console.error('[registerUser] users insert', insertErr)
    if (insertErr) {
      const mapped = mapUsersTableError(insertErr)
      return usersQueryFailure(insertErr, mapped)
    }
    return { ok: false, error: 'Gagal menyimpan user ke database aplikasi', httpStatus: 503 }
  }

  const user: AuthUser = {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    phone: createdUser.phone,
  }

  let token: string
  try {
    token = await signAuthToken({
      sub: user.id,
      name: user.name,
      email: user.email,
    })
  } catch (err) {
    console.error('[registerUser] signAuthToken', err)
    return { ok: false, error: 'Gagal membuat sesi.', httpStatus: 503 }
  }

  await writeAuditLog({
    action: 'auth_register',
    description: `Register sukses untuk ${user.email}`,
    targetTable: 'users',
    targetId: user.id,
    userId: user.id,
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
  // Isolated client to avoid mutating shared admin client auth state.
  const authClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  const { data: authSignInData, error: authSignInError } =
    await authClient.auth.signInWithPassword({
      email,
      password: input.password,
    })

  const supabaseUser = authSignInData?.user
  if (authSignInError || !supabaseUser) {
    return { ok: false, error: 'Email atau password salah' }
  }

  const { data: userRow, error: userErr } = await supabaseAdmin
    .from('users')
    .select('id, name, email, phone')
    .eq('id', supabaseUser.id)
    .maybeSingle()

  if (userErr) {
    console.error('[loginUser] users lookup', userErr)
    const mapped = mapUsersTableError(userErr)
    return usersQueryFailure(userErr, mapped)
  }

  if (!userRow) {
    return {
      ok: false,
      error:
        'Akun ada di autentikasi tetapi tidak di aplikasi. Daftar dulu atau hubungi admin.',
    }
  }

  const user: AuthUser = {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    phone: userRow.phone,
  }

  let token: string
  try {
    token = await signAuthToken({
      sub: user.id,
      name: user.name,
      email: user.email,
    })
  } catch (err) {
    console.error('[loginUser] signAuthToken', err)
    return { ok: false, error: 'Gagal membuat sesi login.', httpStatus: 503 }
  }

  await writeAuditLog({
    action: 'auth_login',
    description: `Login sukses untuk ${user.email}`,
    targetTable: 'users',
    targetId: user.id,
    userId: user.id,
  })

  return {
    ok: true,
    user,
    token,
  }
}
