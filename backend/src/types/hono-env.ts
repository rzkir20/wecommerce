export type AuthUser = {
  id: string
  name: string
  email: string
}

export type AppBindings = {
  Variables: {
    authUser: AuthUser
  }
}
