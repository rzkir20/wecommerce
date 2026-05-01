import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { TanStackDevtools } from '@tanstack/react-devtools'

import {
  getSessionUser,
  themeInitializerScript,
} from '#/hooks/root-bootstrap.ts'

import { PathnameLayout } from '#/hooks/Pathname.tsx'

import appCss from '#/styles.css?url'

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
        <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
          404
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang kamu buka tidak ditemukan.
        </p>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-black tracking-tight">
          Terjadi kesalahan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'Unexpected application error'}
        </p>
      </div>
    </div>
  ),
  component: PathnameLayout,
  shellComponent: RootDocument,
})

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
