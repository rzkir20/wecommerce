import { Bell, ChevronDown, Search, ShoppingBag } from 'lucide-react'

type HeaderProps = {
  cartHref: string
  cartCount: number
  userName: string
  userAvatar: string
  hasNotifications: boolean
}

export function Header({
  cartHref,
  cartCount,
  userName,
  userAvatar,
  hasNotifications,
}: HeaderProps) {
  return (
    <nav className="fixed top-0 left-[250px] right-0 z-40 flex h-20 items-center justify-between border-b border-white/5 bg-[#09090b] px-8">
      <div className="relative max-w-xl flex-1">
        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full rounded-full border border-white/5 bg-zinc-900/50 py-2.5 pr-4 pl-12 text-sm focus:ring-1 focus:ring-[#d4ff3f] focus:outline-none"
        />
      </div>

      <div className="ml-12 flex items-center gap-6">
        <button className="relative text-zinc-400 transition-colors hover:text-white">
          <Bell className="h-6 w-6" />
          {hasNotifications ? (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          ) : null}
        </button>

        <a href={cartHref} className="relative text-zinc-400 transition-colors hover:text-white">
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#d4ff3f] text-[10px] font-bold text-black">
            {cartCount}
          </span>
        </a>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-zinc-400">Welcome back</p>
            <p className="text-sm font-bold">{userName}</p>
          </div>
          <div className="relative">
            <img
              src={userAvatar}
              alt={userName}
              className="h-10 w-10 rounded-xl border border-white/10 bg-zinc-800"
            />
            <ChevronDown className="absolute -right-2 -bottom-1 h-3.5 w-3.5 rounded-full bg-[#09090b] text-zinc-400" />
          </div>
        </div>
      </div>
    </nav>
  )
}
