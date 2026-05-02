import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AdminsHeader } from '#/components/admins/header'

import { AdminsSidebar } from '#/components/admins/sidebar'

import { useAuth } from '#/context/AuthContext'

import { getSessionUser } from '#/hooks/root-bootstrap'

import { useTheme } from '#/context/theme-provider'

import { getRoleHomePath } from '#/lib/role-proxy'

export const Route = createFileRoute('/admins')({
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    if (user.role !== 'admins') {
      throw redirect({ to: getRoleHomePath(user.role), replace: true })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const { theme } = useTheme()

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-theme={theme}
    >
      <div className="lg:pl-80">
        <div className="fixed top-0 left-0 z-40 hidden h-screen w-80 border-r border-border bg-background lg:block">
          <div className="h-full overflow-hidden px-5 py-6">
            <AdminsSidebar />
          </div>
        </div>

        <AdminsHeader userName={user?.name} userEmail={user?.email} />

        <main className="mx-auto w-full max-w-[1600px] px-6 py-10 lg:px-8">
          <div className="mb-8 lg:hidden">
            <AdminsSidebar />
          </div>
          <section className="flex-1">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}
