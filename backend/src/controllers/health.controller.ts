import type { Context } from 'hono'
import { supabaseAdmin } from '../lib/supabase.js'

export function rootController(c: Context) {
  return c.json({
    message: 'Backend is running',
  })
}

export async function healthController(c: Context) {
  const { count, error } = await supabaseAdmin
    .from('users')
    .select('id', { count: 'exact', head: true })

  if (error) {
    return c.json(
      {
        status: 'error',
        message: error.message,
      },
      500
    )
  }

  return c.json({
    status: 'ok',
    usersCount: count ?? 0,
  })
}

export async function supabaseHealthController(c: Context) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  })

  if (error) {
    return c.json(
      {
        status: 'error',
        message: error.message,
      },
      500
    )
  }

  return c.json({
    status: 'ok',
    usersCount: data.users.length,
  })
}
