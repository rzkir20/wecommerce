import { Link, useNavigate } from '@tanstack/react-router'

import { ChevronDown, KeyRound, LogOut } from 'lucide-react'

import { DropdownMenu } from 'radix-ui'

type ProfileMenuProps = {
  userName: string
  userAvatar: string
  onLogout?: () => void
}

export function ProfileMenu({
  userName,
  userAvatar,
  onLogout,
}: ProfileMenuProps) {
  const navigate = useNavigate()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-lg py-1.5 pr-1 pl-2 text-foreground/90 transition-colors hover:bg-muted/50 hover:text-foreground md:inline-flex lg:gap-2 lg:pl-1"
          aria-label="Menu akun"
        >
          <div className="hidden text-right lg:block">
            <p className="text-[10px] text-muted-foreground">Halo</p>
            <p className="max-w-28 truncate text-left text-xs font-bold text-foreground">
              {userName}
            </p>
          </div>
          <span className="relative shrink-0">
            <img
              src={userAvatar}
              alt={userName}
              className="h-8 w-8 rounded-lg border border-border bg-muted object-cover xl:h-9 xl:w-9"
            />
            <ChevronDown className="pointer-events-none absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-background text-muted-foreground sm:h-3.5 sm:w-3.5" />
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-52 origin-top-right rounded-xl border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg outline-none"
        >
          <div className="border-b border-border px-3 py-2.5 lg:hidden">
            <p className="text-[10px] text-muted-foreground">Masuk sebagai</p>
            <p className="truncate font-bold text-foreground">{userName}</p>
          </div>
          <DropdownMenu.Item asChild>
            <Link
              to="/change-password"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-foreground outline-none select-none hover:bg-muted hover:text-[#d4ff3f] data-highlighted:bg-muted data-highlighted:text-[#d4ff3f]"
            >
              <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
              Ubah kata sandi
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
          {onLogout ? (
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-foreground outline-none select-none hover:bg-muted hover:text-red-400 data-highlighted:bg-muted data-highlighted:text-red-400"
              onSelect={() => {
                onLogout()
                void navigate({ to: '/' })
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Keluar
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item asChild>
              <Link
                to="/login"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-foreground outline-none select-none hover:bg-muted hover:text-red-400 data-highlighted:bg-muted data-highlighted:text-red-400"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                Keluar
              </Link>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
