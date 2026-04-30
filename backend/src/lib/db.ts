import type { AppEnv } from '../env.js'

import mysql, { type Pool } from 'mysql2/promise'

let pool: Pool | null = null

export function initDb(env: AppEnv): void {
  if (pool) return
  pool = mysql.createPool({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
}

export function getDb(): Pool {
  if (!pool) {
    throw new Error('Database belum di-init — panggil initDb(env) di server.ts')
  }
  return pool
}
