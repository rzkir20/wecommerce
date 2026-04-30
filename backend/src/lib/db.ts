import type { AppEnv } from '../env.js'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function initDb(env: AppEnv): SupabaseClient {
  if (client) return client
  client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

export function getDb(): SupabaseClient {
  if (!client) {
    throw new Error('Database belum di-init — panggil initDb(env) di server.ts')
  }
  return client
}
