import { randomUUID } from 'node:crypto'

import { signAuthToken } from '../lib/auth.js'

import type { AuthUser } from '../types/hono-env.js'

type QrSessionStatus = 'pending' | 'approved' | 'expired' | 'used'

type QrSession = {
  token: string
  status: QrSessionStatus
  createdAt: number
  expiresAt: number
  approvedBy?: AuthUser
  authToken?: string
}

const QR_TTL_MS = 1000 * 60 * 2
const qrSessions = new Map<string, QrSession>()

function cleanupExpiredSessions() {
  const now = Date.now()
  for (const [token, session] of qrSessions.entries()) {
    if (session.status === 'pending' && session.expiresAt <= now) {
      qrSessions.set(token, { ...session, status: 'expired' })
    }

    if (session.expiresAt + QR_TTL_MS <= now || session.status === 'used') {
      qrSessions.delete(token)
    }
  }
}

export function createQrLoginSession() {
  cleanupExpiredSessions()
  const now = Date.now()
  const token = randomUUID().replace(/-/g, '')
  const session: QrSession = {
    token,
    status: 'pending',
    createdAt: now,
    expiresAt: now + QR_TTL_MS,
  }

  qrSessions.set(token, session)

  return {
    token,
    status: session.status,
    expiresAt: new Date(session.expiresAt).toISOString(),
  }
}

export async function approveQrLoginSession(token: string, user: AuthUser) {
  cleanupExpiredSessions()
  const session = qrSessions.get(token)
  if (!session) {
    return { ok: false as const, error: 'QR tidak valid', status: 404 }
  }

  if (session.status === 'expired' || session.expiresAt <= Date.now()) {
    qrSessions.set(token, { ...session, status: 'expired' })
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

  qrSessions.set(token, {
    ...session,
    status: 'approved',
    approvedBy: user,
    authToken,
  })

  return { ok: true as const, status: 'approved' as const }
}

export function getQrLoginSessionStatus(token: string) {
  cleanupExpiredSessions()
  const session = qrSessions.get(token)
  if (!session) {
    return {
      found: false as const,
      status: 'expired' as const,
    }
  }

  if (session.status === 'pending' && session.expiresAt <= Date.now()) {
    qrSessions.set(token, { ...session, status: 'expired' })
    return {
      found: true as const,
      status: 'expired' as const,
    }
  }

  if (session.status === 'approved') {
    return {
      found: true as const,
      status: 'approved' as const,
      user: session.approvedBy,
      authToken: session.authToken,
    }
  }

  return {
    found: true as const,
    status: session.status,
  }
}

export function markQrLoginSessionUsed(token: string) {
  const session = qrSessions.get(token)
  if (!session) {
    return
  }

  qrSessions.set(token, {
    ...session,
    status: 'used',
  })
}
