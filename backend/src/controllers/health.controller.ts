import type { Context } from 'hono'

import { prisma } from '../lib/prisma.js'

import { supabaseAdmin } from '../lib/supabase.js'

export function rootController(c: Context) {
  return c.json({
    message: 'Backend is running',
  })
}

export async function healthController(c: Context) {
  const now = await prisma.$queryRawUnsafe<{ now: string }[]>('SELECT NOW()::text as now')
  return c.json({
    status: 'ok',
    database: now[0]?.now ?? null,
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
