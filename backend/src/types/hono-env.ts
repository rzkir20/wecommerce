import type { AppEnv } from '../env.js'

declare module 'hono' {
  interface ContextVariableMap {
    env: AppEnv
    /** Di-set oleh middleware `requireAuth` */
    jwtUserId?: string
  }
}

export {}
