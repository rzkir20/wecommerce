import type { AppEnv } from '../env.js'

import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

export function initDb(env: AppEnv): void {
  if (prisma) return
  // `loadEnv()` sudah memastikan `process.env.DATABASE_URL` terpasang.
  // Ini hanya validasi tambahan agar error lebih jelas.
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL tidak ter-set. Isi di .env atau set MYSQL_* untuk auto-build.')
  }
  prisma = new PrismaClient()
}

export function getPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('Database belum di-init — panggil initDb(env) di server.ts')
  }
  return prisma
}
