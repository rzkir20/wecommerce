import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Package, ReceiptText, ShieldCheck, Users } from 'lucide-react'

function Item({
  to,
  label,
  icon,
  active,
}: {
  to: string
  label: string
  icon: React.ReactNode
  active: boolean
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
        active
          ? 'bg-card font-bold text-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-card hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

export function AdminsSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <aside className="flex h-full w-full flex-col gap-6 lg:w-72">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="text-xl font-black tracking-tight">ADMINS</span>
      </div>
      <nav className="space-y-1.5">
        <Item
          to="/admins"
          label="Overview"
          icon={<LayoutDashboard className="h-4 w-4" />}
          active={pathname.startsWith('/admins')}
        />
        <Item
          to="/admins"
          label="Users Management"
          icon={<Users className="h-4 w-4" />}
          active={false}
        />
        <Item
          to="/admins"
          label="Products"
          icon={<Package className="h-4 w-4" />}
          active={false}
        />
        <Item
          to="/admins"
          label="Transactions"
          icon={<ReceiptText className="h-4 w-4" />}
          active={false}
        />
      </nav>
    </aside>
  )
}
