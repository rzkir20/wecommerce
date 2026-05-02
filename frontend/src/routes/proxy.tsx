import { Navigate, createFileRoute } from '@tanstack/react-router'

import { useAuth } from '#/context/AuthContext'

import { getRoleHomePath } from '#/lib/role-proxy'

export const Route = createFileRoute('/proxy')({
  component: RoleProxyPage,
})

function RoleProxyPage() {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <p className="text-sm font-medium">Memuat sesi…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getRoleHomePath(user.role)} replace />
}
