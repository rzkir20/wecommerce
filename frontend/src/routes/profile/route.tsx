import { Outlet, createFileRoute } from '@tanstack/react-router'

import { ProfileHeader } from '#/components/profile/header'

import { ProfileSidebar } from '#/components/profile/sidebar'

import { useAuth } from '#/context/AuthContext'

import { useTheme } from '#/context/theme-provider'

export const Route = createFileRoute('/profile')({
  component: ProfileLayoutRoute,
})

function ProfileLayoutRoute() {
  const { user } = useAuth()
  const { theme } = useTheme()

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-theme={theme}
    >
      <div className="lg:pl-80">
        <div className="fixed top-0 left-0 z-50 hidden h-screen w-80 border-r border-border bg-background lg:block">
          <div className="h-full overflow-hidden px-5 py-6">
            <ProfileSidebar />
          </div>
        </div>

        <ProfileHeader userName={user?.name} userEmail={user?.email} />

        <main className="mx-auto w-full max-w-[1600px] px-6 py-10 lg:px-8">
          <div className="mb-8 lg:hidden">
            <ProfileSidebar />
          </div>
          <section className="flex-1">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}
