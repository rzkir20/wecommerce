import { createFileRoute, Navigate } from '@tanstack/react-router'

import { LuxeSellerOnboardingPage } from '#/components/portal/luxe-seller-onboarding'

import { useAuth } from '#/context/AuthContext'

export const Route = createFileRoute('/portal')({
  head: () => ({
    meta: [
      {
        title: 'Become a LUXE Seller | Merchant Onboarding',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: 'https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500,400&f[]=satoshi@700,500,400&display=swap',
      },
    ],
  }),
  component: PortalRoute,
})

function PortalRoute() {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-500"
        style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
      >
        <p className="text-sm font-medium">Memuat sesi…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="dark">
      <LuxeSellerOnboardingPage />
    </div>
  )
}
