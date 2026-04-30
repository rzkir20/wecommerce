import type { MiddlewareHandler } from 'hono'

import type { AppEnv } from '../env.js'

export function envMiddleware(env: AppEnv): MiddlewareHandler {
  return async (c, next) => {
    c.set('env', env)
    await next()
  }
}
