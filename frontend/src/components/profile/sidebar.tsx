import { Link, useRouterState } from '@tanstack/react-router'

import {
  BellDot,
  Coins,
  CreditCard,
  Crown,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  TicketPercent,
  UserCircle,
} from 'lucide-react'

function NavItem({
  to,
  label,
  icon,
  active = false,
  badge,
}: {
  to: string
  label: string
  icon: React.ReactNode
  active?: boolean
  badge?: { text: string; tone: 'neutral' | 'hot' }
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 ${
        active
          ? 'bg-card text-foreground shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)]'
          : 'text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm'
      }`}
    >
      {icon}
      <span
        className={`text-sm tracking-tight ${active ? 'font-bold' : 'font-semibold'}`}
      >
        {label}
      </span>
      {badge ? (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
            badge.tone === 'hot'
              ? 'bg-rose-600 text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {badge.text}
        </span>
      ) : null}
    </Link>
  )
}

export function ProfileSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isProfile = pathname === '/profile' || pathname === '/profile/'

  return (
    <aside className="flex h-full w-full flex-col justify-between gap-8 lg:w-72">
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
            <LayoutDashboard className="h-5 w-5 text-background" />
          </div>
          <span className="text-xl font-black tracking-tight">DASHBOARD</span>
        </div>

        <div className="space-y-2">
          <p className="mb-4 px-4 text-[11px] font-black tracking-[0.2em] text-muted-foreground uppercase">
            Account Overview
          </p>
          <nav className="space-y-1.5">
            <NavItem
              to="/profile"
              label="My Profile"
              active={isProfile}
              icon={<UserCircle className="h-5 w-5 text-rose-600" />}
            />
            <NavItem
              to="/profile"
              label="Banks & Cards"
              icon={<CreditCard className="h-5 w-5" />}
            />
            <NavItem
              to="/profile"
              label="Addresses"
              icon={<MapPin className="h-5 w-5" />}
            />
            <NavItem
              to="/profile"
              label="Security"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
          </nav>
        </div>

        <div className="space-y-2">
          <p className="mb-4 px-4 text-[11px] font-black tracking-[0.2em] text-muted-foreground uppercase">
            Shopping Experience
          </p>
          <nav className="space-y-1.5">
            <NavItem
              to="/profile"
              label="My Purchases"
              icon={<ShoppingBag className="h-5 w-5" />}
              badge={{ text: '12', tone: 'neutral' }}
            />
            <NavItem
              to="/profile"
              label="Activity"
              icon={<BellDot className="h-5 w-5" />}
            />
            <NavItem
              to="/profile"
              label="Vouchers"
              icon={<TicketPercent className="h-5 w-5" />}
              badge={{ text: 'HOT', tone: 'hot' }}
            />
            <NavItem
              to="/profile"
              label="Luxe Rewards"
              icon={<Coins className="h-5 w-5" />}
            />
          </nav>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-3xl bg-foreground p-6">
        <div className="relative z-10">
          <p className="mb-2 text-lg leading-tight font-bold text-background">
            Upgrade to
            <br />
            Elite Status
          </p>
          <p className="mb-4 text-xs text-background/70">
            Dapatkan gratis ongkir tanpa batas & akses eksklusif.
          </p>
          <Link to="/portal">
            <button
              type="button"
              className="w-full rounded-xl bg-[#d4ff3f] py-3 text-xs font-black tracking-widest text-black uppercase transition-transform hover:scale-[1.02]"
            >
              Pelajari Lebih
            </button>
          </Link>
        </div>
        <Crown className="absolute -right-4 -bottom-4 h-20 w-20 rotate-12 text-white/10 transition-transform duration-500 group-hover:rotate-0" />
      </div>
    </aside>
  )
}
