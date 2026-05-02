export type UserRole =
  | 'super_admins'
  | 'admins'
  | 'affiliate'
  | 'users'
  | 'seller'

export function getRoleHomePath(role?: UserRole | null): string {
  switch (role) {
    case 'super_admins':
      return '/super-admins'
    case 'admins':
      return '/admins'
    case 'seller':
      return '/seller'
    case 'affiliate':
    case 'users':
    default:
      return '/'
  }
}

export function canAccessRoleRoute(pathname: string, role?: UserRole | null): boolean {
  if (pathname.startsWith('/super-admins')) {
    return role === 'super_admins'
  }

  if (pathname.startsWith('/admins')) {
    return role === 'admins'
  }

  if (pathname.startsWith('/seller')) {
    return role === 'seller'
  }

  return true
}
