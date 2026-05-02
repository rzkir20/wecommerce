import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { SellerHeader } from '#/components/seller/header'

import { SellerSidebar } from '#/components/seller/sidebar'

import { useAuth } from '#/context/AuthContext'

import { getSessionUser } from '#/hooks/root-bootstrap'

import { useTheme } from '#/context/theme-provider'

import { getRoleHomePath } from '#/lib/role-proxy'

export const Route = createFileRoute('/seller')({
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    if (user.role !== 'seller') {
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
            <SellerSidebar />
          </div>
        </div>

        <SellerHeader userName={user?.name} userEmail={user?.email} />

        <main className="mx-auto w-full max-w-[1600px] px-6 py-10 lg:px-8">
          <div className="mb-8 lg:hidden">
            <SellerSidebar />
          </div>
          <section className="flex-1">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}
