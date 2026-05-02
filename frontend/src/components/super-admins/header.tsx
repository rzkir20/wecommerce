import { Bell, Crown, Search } from 'lucide-react'

import { avatarUrlForEmail } from '#/context/AuthContext'
import { ModeToggle } from '#/components/ui/mode-toggle'

type SuperAdminsHeaderProps = {
  userName?: string | null
  userEmail?: string | null
}

export function SuperAdminsHeader({
  userName,
  userEmail,
}: SuperAdminsHeaderProps) {
  const displayName = userName?.trim() || 'Super Admin'
  const email = userEmail?.trim() || 'super-admin@wecommerce.app'

  return (
    <header className="sticky top-0 z-40 h-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-4 px-6 lg:px-8">
        <div className="hidden max-w-2xl flex-1 md:block">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari tenant, admin, policy, log..."
              className="w-full rounded-2xl border border-border bg-muted py-3 pr-4 pl-11 text-sm outline-none focus:bg-card"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <button type="button" className="relative rounded-xl bg-muted p-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <div className="hidden items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-700 md:flex dark:text-rose-300">
            <Crown className="h-4 w-4" />
            Super Admin
          </div>
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-bold">{displayName}</p>
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                Root Access
              </p>
            </div>
            <img
              src={avatarUrlForEmail(email)}
              alt="Super Admin Avatar"
              className="h-11 w-11 rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
