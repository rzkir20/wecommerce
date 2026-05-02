import { Bell, Search, Shield } from 'lucide-react'

import { avatarUrlForEmail } from '#/context/AuthContext'
import { ModeToggle } from '#/components/ui/mode-toggle'

type AdminsHeaderProps = {
  userName?: string | null
  userEmail?: string | null
}

export function AdminsHeader({ userName, userEmail }: AdminsHeaderProps) {
  const displayName = userName?.trim() || 'Admin'
  const email = userEmail?.trim() || 'admin@wecommerce.app'

  return (
    <header className="sticky top-0 z-40 h-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-4 px-6 lg:px-8">
        <div className="hidden max-w-2xl flex-1 md:block">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari user, order, atau laporan..."
              className="w-full rounded-2xl border border-border bg-muted py-3 pr-4 pl-11 text-sm outline-none focus:bg-card"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-muted"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-amber-500" />
          </button>
          <div className="hidden items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-700 md:flex dark:text-blue-300">
            <Shield className="h-4 w-4" />
            Admin Panel
          </div>
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-bold">{displayName}</p>
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                Administrator
              </p>
            </div>
            <img
              src={avatarUrlForEmail(email)}
              alt="Admin Avatar"
              className="h-11 w-11 rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
