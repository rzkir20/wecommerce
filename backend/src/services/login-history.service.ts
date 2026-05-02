import { createHash } from 'node:crypto'

import type { Context } from 'hono'

import { supabaseAdmin } from '../lib/supabase.js'
import type { AuthUser } from '../types/hono-env.js'

function firstHeaderValue(value: string | null): string | null {
  if (!value) return null
  return value.split(',')[0]?.trim() || null
}

function getIpAddress(c: Context): string | null {
  return (
    firstHeaderValue(c.req.header('cf-connecting-ip') ?? null) ??
    firstHeaderValue(c.req.header('x-forwarded-for') ?? null) ??
    firstHeaderValue(c.req.header('x-real-ip') ?? null)
  )
}

function detectBrowser(userAgent: string): string {
  if (/edg\//i.test(userAgent)) return 'Edge'
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) return 'Chrome'
  if (/firefox\//i.test(userAgent)) return 'Firefox'
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return 'Safari'
  return 'Unknown Browser'
}

function detectEngine(userAgent: string): string {
  if (/applewebkit/i.test(userAgent)) return 'WebKit'
  if (/gecko/i.test(userAgent) && !/like gecko/i.test(userAgent)) return 'Gecko'
  return 'Unknown Engine'
}

function detectOs(userAgent: string): string {
  if (/windows nt/i.test(userAgent)) return 'Windows'
  if (/android/i.test(userAgent)) return 'Android'
  if (/iphone|ipad|ios/i.test(userAgent)) return 'iOS'
  if (/mac os x|macintosh/i.test(userAgent)) return 'macOS'
  if (/linux/i.test(userAgent)) return 'Linux'
  return 'Unknown OS'
}

function describeDevice(userAgent: string | null): string | null {
  if (!userAgent) return null
  return `${detectEngine(userAgent)} - ${detectBrowser(userAgent)} on ${detectOs(userAgent)}`
}

function describeLocation(c: Context): string | null {
  const city = c.req.header('cf-ipcity')?.trim()
  const region = c.req.header('cf-region')?.trim()
  const country = c.req.header('cf-ipcountry')?.trim()
  const parts = [city, region, country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

export function createTokenId(token: string): string {
  return createHash('sha512').update(token).digest('hex')
}

export async function recordLoginHistory(c: Context, user: AuthUser, token: string) {
  const tokenId = createTokenId(token)
  const userAgent = c.req.header('user-agent')?.trim() || null

  const now = new Date().toISOString()
  const { error } = await supabaseAdmin.from('login_histories').upsert(
    {
      user_id: user.id,
      token_id: tokenId,
      ip_address: getIpAddress(c),
      user_agent: userAgent,
      location: describeLocation(c),
      device: describeDevice(userAgent),
      login_date: now,
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    { onConflict: 'token_id', ignoreDuplicates: true }
  )

  if (error) {
    console.error('[recordLoginHistory]', error)
  }

  return tokenId
}

export async function markLoginHistoryLoggedOut(token: string | null | undefined) {
  if (!token) return

  const tokenId = createTokenId(token)
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin
    .from('login_histories')
    .update({
      logout_date: now,
      is_active: false,
      updated_at: now,
    })
    .eq('token_id', tokenId)
    .eq('is_active', true)

  if (error) {
    console.error('[markLoginHistoryLoggedOut]', error)
  }
}

export async function listLoginHistories(userId: string, currentToken: string | null | undefined) {
  const currentTokenId = currentToken ? createTokenId(currentToken) : null
  const { data, error } = await supabaseAdmin
    .from('login_histories')
    .select(
      'id, user_id, token_id, ip_address, user_agent, location, device, login_date, logout_date, is_active, created_at, updated_at'
    )
    .eq('user_id', userId)
    .order('login_date', { ascending: false })

  if (error) {
    console.error('[listLoginHistories]', error)
    return []
  }

  return (data ?? []).map((item) => ({
    ...item,
    is_current_device: currentTokenId ? item.token_id === currentTokenId : false,
  }))
}
