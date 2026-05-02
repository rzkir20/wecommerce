import type { UserRole } from './user-role.js'

export type AuthUser = {
  id: string
  name: string
  email: string
  phone: string | null
  role?: UserRole
  gender?: string | null
  date?: string | null
}

export type AppBindings = {
  Variables: {
    jwtPayload?: unknown
    authUser: AuthUser
  }
}
