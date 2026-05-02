import { randomUUID } from 'node:crypto'

import { signAuthToken } from '../lib/auth.js'
import { supabaseAdmin } from '../lib/supabase.js'

import type { AuthUser } from '../types/hono-env.js'

type QrSessionStatus = 'pending' | 'approved' | 'expired' | 'used'

type QrSession = {
  token: string
  status: QrSessionStatus
  createdAt: string
  expiresAt: string
  approvedBy?: AuthUser | null
  authToken?: string
}

const QR_TTL_MS = 1000 * 60 * 2

async function cleanupExpiredSessions() {
  const nowIso = new Date().toISOString()
  await supabaseAdmin
    .from('qr_login_sessions')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', nowIso)

  const deleteBefore = new Date(Date.now() - QR_TTL_MS).toISOString()
  await supabaseAdmin
    .from('qr_login_sessions')
    .delete()
    .or(`status.eq.used,expires_at.lt.${deleteBefore}`)
}

function mapRowToSession(row: {
  token: string
  status: QrSessionStatus
  created_at: string
  expires_at: string
  auth_token: string | null
  approved_user_id: string | null
  approved_user_name: string | null
  approved_user_email: string | null
  approved_user_phone: string | null
}): QrSession {
  return {
    token: row.token,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    approvedBy:
      row.approved_user_id && row.approved_user_name && row.approved_user_email
        ? {
            id: row.approved_user_id,
            name: row.approved_user_name,
            email: row.approved_user_email,
            phone: row.approved_user_phone,
          }
        : null,
    authToken: row.auth_token ?? undefined,
  }
}

export async function createQrLoginSession() {
  await cleanupExpiredSessions()
  const now = Date.now()
  const token = randomUUID().replace(/-/g, '')
  const session = {
    token,
    status: 'pending',
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + QR_TTL_MS).toISOString(),
  }

  const { error } = await supabaseAdmin.from('qr_login_sessions').insert(session)
  if (error) {
    throw new Error(`Gagal membuat QR session: ${error.message}`)
  }

  return {
    token,
    status: 'pending' as const,
    expiresAt: session.expires_at,
  }
}

export async function approveQrLoginSession(token: string, user: AuthUser) {
  await cleanupExpiredSessions()
  const { data, error } = await supabaseAdmin
    .from('qr_login_sessions')
    .select(
      'token, status, created_at, expires_at, auth_token, approved_user_id, approved_user_name, approved_user_email, approved_user_phone'
    )
    .eq('token', token)
    .maybeSingle()
  if (error) {
    return { ok: false as const, error: 'Gagal membaca sesi QR', status: 409 }
  }
  const session = data ? mapRowToSession(data) : null
  if (!session) {
    return { ok: false as const, error: 'QR tidak valid', status: 404 }
  }

  if (session.status === 'expired' || Date.parse(session.expiresAt) <= Date.now()) {
    await supabaseAdmin.from('qr_login_sessions').update({ status: 'expired' }).eq('token', token)
    return { ok: false as const, error: 'QR sudah kedaluwarsa', status: 410 }
  }

  if (session.status === 'approved') {
    return { ok: true as const, status: 'approved' as const }
  }

  if (session.status === 'used') {
    return { ok: false as const, error: 'QR sudah digunakan', status: 409 }
  }

  const authToken = await signAuthToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  })

  const { error: updateError } = await supabaseAdmin
    .from('qr_login_sessions')
    .update({
      status: 'approved',
      approved_user_id: user.id,
      approved_user_name: user.name,
      approved_user_email: user.email,
      approved_user_phone: user.phone,
      auth_token: authToken,
    })
    .eq('token', token)
  if (updateError) {
    return { ok: false as const, error: 'Gagal menyetujui QR', status: 409 }
  }

  return { ok: true as const, status: 'approved' as const }
}

export async function getQrLoginSessionStatus(token: string) {
  await cleanupExpiredSessions()
  const { data, error } = await supabaseAdmin
    .from('qr_login_sessions')
    .select(
      'token, status, created_at, expires_at, auth_token, approved_user_id, approved_user_name, approved_user_email, approved_user_phone'
    )
    .eq('token', token)
    .maybeSingle()
  if (error || !data) {
    return {
      found: false as const,
      status: 'expired' as const,
      expiresAt: Date.now(),
    }
  }

  const session = mapRowToSession(data)
  if (session.status === 'pending' && Date.parse(session.expiresAt) <= Date.now()) {
    await supabaseAdmin.from('qr_login_sessions').update({ status: 'expired' }).eq('token', token)
    return {
      found: true as const,
      status: 'expired' as const,
      expiresAt: Date.parse(session.expiresAt),
    }
  }

  if (session.status === 'approved') {
    return {
      found: true as const,
      status: 'approved' as const,
      expiresAt: Date.parse(session.expiresAt),
      user: session.approvedBy ?? undefined,
      authToken: session.authToken,
    }
  }

  return {
    found: true as const,
    status: session.status,
    expiresAt: Date.parse(session.expiresAt),
  }
}

export async function markQrLoginSessionUsed(token: string) {
  await supabaseAdmin
    .from('qr_login_sessions')
    .update({
      status: 'used',
      used_at: new Date().toISOString(),
    })
    .eq('token', token)
}
