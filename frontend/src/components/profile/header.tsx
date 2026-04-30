import { Bell, QrCode, Search } from 'lucide-react'

import { useState } from 'react'

import { avatarUrlForEmail } from '#/context/AuthContext'

import { ModeToggle } from '#/components/ui/mode-toggle'

import { ScanQrDialog } from '#/components/profile/scan-qr'

type ProfileHeaderProps = {
  userName?: string | null
  userEmail?: string | null
}

export function ProfileHeader({ userName, userEmail }: ProfileHeaderProps) {
  const displayName = userName?.trim() || 'space.digitalia'
  const email = userEmail?.trim() || 'spa.digitalia@example.com'
  const [scanOpen, setScanOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-4 px-6 lg:px-8">
        <div className="hidden max-w-2xl flex-1 md:block">
          <div className="group relative">
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full rounded-2xl border border-transparent bg-muted py-3 pr-4 pl-12 text-sm transition-all duration-300 outline-none focus:border-border focus:bg-card"
            />
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
            <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-1 opacity-40">
              <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-bold">
                ⌘
              </span>
              <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-bold">
                K
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-5">
          <ModeToggle />
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            className="group relative flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs font-bold tracking-wider uppercase transition-colors hover:bg-accent"
          >
            <QrCode className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            Scan QR
          </button>
          <button
            type="button"
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-muted transition-colors hover:bg-accent"
          >
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-rose-600" />
          </button>

          <div className="group flex cursor-pointer items-center gap-3 border-l border-border pl-4">
            <div className="hidden text-right lg:block">
              <p className="text-sm leading-none font-bold">{displayName}</p>
              <p className="mt-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Pro Member
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-linear-to-tr from-[#d4ff3f] to-rose-600 p-[2px] shadow-sm">
              <div className="h-full w-full overflow-hidden rounded-[10px] bg-card">
                <img
                  src={avatarUrlForEmail(email)}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScanQrDialog open={scanOpen} onOpenChange={setScanOpen} />
    </header>
  )
}
