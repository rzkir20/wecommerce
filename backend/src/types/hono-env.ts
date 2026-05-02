export type AuthUser = {
  id: string
  name: string
  email: string
  phone: string | null
}

export type AppBindings = {
  Variables: {
    authUser: AuthUser
  }
}
