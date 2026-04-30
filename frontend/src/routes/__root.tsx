import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'

import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { TanStackDevtools } from '@tanstack/react-devtools'

import { CartModal } from '../components/layout/cart-modal'

import { Footer } from '../components/layout/footer'

import { Header } from '../components/layout/header'

import { ModeToggle } from '../components/ui/mode-toggle'

import {
  AuthProvider,
  avatarUrlForEmail,
  useAuth,
} from '../context/AuthContext'
import { CartProvider, useCart } from '../context/CartContext'

import dashboardData from '../data/data.json'

import { ThemeProvider } from '../context/theme-provider'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: AppLayout,
  shellComponent: RootDocument,
})

function AppLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forget-password') ||
    pathname.startsWith('/verifications')

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
      <AuthProvider>
        {isAuthRoute ? (
          <div className="relative min-h-screen">
            <div className="fixed top-4 right-4 z-50 md:top-6 md:right-8">
              <ModeToggle />
            </div>
            <Outlet />
          </div>
        ) : (
          <CartProvider initialData={dashboardData.cart}>
            <AppShell activeItem={activeItem} />
          </CartProvider>
        )}
      </AuthProvider>
    </ThemeProvider>
  )
}

type AppShellProps = {
  activeItem: string
}

function AppShell({ activeItem }: AppShellProps) {
  const { itemCount, openCart } = useCart()
  const { user, logout } = useAuth()
  const isLoggedIn = user !== null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        activeItem={activeItem}
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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
