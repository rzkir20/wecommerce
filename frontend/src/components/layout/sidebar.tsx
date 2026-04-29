import { Link } from '@tanstack/react-router'
import type { ComponentType } from 'react'
import {
  LayoutGrid,
  FileText,
  Package,
  Users,
  Settings,
  TrendingUp,
  LogOut,
  Watch,
} from 'lucide-react'

type SidebarItem = {
  key: string
  label: string
  href: string
}

type SidebarProps = {
  items: SidebarItem[]
  activeItem: string
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  dashboard: LayoutGrid,
  orders: FileText,
  products: Package,
  customers: Users,
  settings: Settings,
  marketing: TrendingUp,
}

export function Sidebar({ items, activeItem }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-white/5 bg-[#09090b] p-6">
      <div className="mb-10 pl-2">
        <Link to="/" className="flex items-center">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e11d48] shadow-lg shadow-red-500/20">
            <Watch className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white uppercase">
            LUXE WATCH
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5">
        {items.map((item) => {
          const Icon = iconMap[item.key] ?? LayoutGrid
          const isActive = activeItem === item.key
          return (
            <a
              key={item.key}
              href={item.href}
              className={[
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all',
                isActive
                  ? 'bg-[#d4ff3f] text-black shadow-[0_0_15px_rgba(212,255,63,0.3)]'
                  : 'text-zinc-500 hover:text-white',
              ].join(' ')}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="mt-auto">
        <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-zinc-500 transition-all hover:text-white">
          <LogOut className="h-[18px] w-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
