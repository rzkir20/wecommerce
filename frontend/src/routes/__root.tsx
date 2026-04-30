import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'

import { createServerFn } from '@tanstack/react-start'

import { getRequestHeader } from '@tanstack/react-start/server'

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

import type { AuthUser } from '../context/AuthContext'

import { CartProvider, useCart } from '../context/CartContext'

import dashboardData from '../data/data.json'

import { ThemeProvider } from '../context/theme-provider'

import appCss from '../styles.css?url'

import { API_PATHS, getApiUrl } from '../lib/config'

const themeInitializerScript = `
(() => {
  const storageKey = 'vite-ui-theme';
  const root = document.documentElement;
  const storedTheme = localStorage.getItem(storageKey);
  const isValidTheme = storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system';
  const preferredTheme = isValidTheme ? storedTheme : 'system';
  const resolvedTheme =
    preferredTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preferredTheme;

  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
})();
`

const getSessionUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthUser | null> => {
    const cookie = getRequestHeader('cookie') ?? ''
    if (!cookie) return null

    const res = await fetch(`${getApiUrl()}${API_PATHS.auth.me}`, {
      headers: {
        cookie,
      },
    })

    if (!res.ok) return null

    const data = (await res.json()) as { user?: AuthUser }
    return data.user ?? null
  },
)

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
  loader: async () => {
    const initialUser = await getSessionUser()
    return { initialUser }
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="text-center">
        <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">404</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Page Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang kamu buka tidak ditemukan.
        </p>
      </div>
    </div>
  ),
  component: AppLayout,
  shellComponent: RootDocument,
})

function AppLayout() {
  const { initialUser } = Route.useLoaderData()
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
      <AuthProvider initialUser={initialUser}>
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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitializerScript }}
          suppressHydrationWarning
        />
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
