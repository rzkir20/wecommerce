import { QueryClientProvider } from '@tanstack/react-query'

import { getRouteApi, Outlet, useRouterState } from '@tanstack/react-router'

import { CartModal } from '#/components/layout/cart-modal'

import { Footer } from '#/components/layout/footer'

import { Header } from '#/components/layout/header'

import { ModeToggle } from '#/components/ui/mode-toggle'

import { Toaster } from '#/components/ui/sonner'

import { AuthProvider, avatarUrlForEmail, useAuth } from '#/context/AuthContext'

import { CartProvider, useCart } from '#/context/CartContext'

import { ThemeProvider } from '#/context/theme-provider'

import dashboardData from '#/data/data.json'

import { queryClient } from '#/lib/query-client'

const rootRoute = getRouteApi('__root__')

export function PathnameLayout() {
  const { initialUser } = rootRoute.useLoaderData()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forget-password') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/change-password') ||
    pathname.startsWith('/verifications')

  const isPortalRoute = pathname.startsWith('/portal')

  const productSlugs = Object.keys(dashboardData.productDetails)
  const pathSlug = pathname.slice(1).split('/')[0]
  const isProductDetailPage =
    productSlugs.length > 0 && productSlugs.includes(pathSlug)

  const activeItem = pathname.startsWith('/products')
    ? 'products'
    : isProductDetailPage
      ? 'products'
      : pathname.startsWith('/cart') || pathname.startsWith('/checkout')
        ? 'orders'
        : pathname.startsWith('/change-password')
          ? 'settings'
          : 'dashboard'

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider initialUser={initialUser}>
          {isAuthRoute ? (
            <div className="relative min-h-screen">
              <div className="fixed top-4 right-4 z-50 md:top-6 md:right-8">
                <ModeToggle />
              </div>
              <Outlet />
            </div>
          ) : isPortalRoute ? (
            <Outlet />
          ) : (
            <CartProvider initialData={dashboardData.cart}>
              <AppShell activeItem={activeItem} />
            </CartProvider>
          )}
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  )
}

type AppShellProps = {
  activeItem: string
}

function AppShell({ activeItem }: AppShellProps) {
  const { itemCount, openCart } = useCart()
  const { user, logout, ready } = useAuth()
  const isLoggedIn = user !== null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        activeItem={activeItem}
        isAuthReady={ready}
        isLoggedIn={isLoggedIn}
        userName={user?.name ?? dashboardData.header.userName}
        userAvatar={
          user ? avatarUrlForEmail(user.email) : dashboardData.header.userAvatar
        }
        cartCount={itemCount}
        onCartClick={openCart}
        onLogout={isLoggedIn ? logout : undefined}
      />
      <Outlet />
      <Footer />
      <CartModal />
    </div>
  )
}
