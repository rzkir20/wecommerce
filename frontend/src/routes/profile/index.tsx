import { createFileRoute } from '@tanstack/react-router'

import {
  AtSign,
  Camera,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  User,
  User2,
  UserCircle2,
  Wallet,
} from 'lucide-react'

import { avatarUrlForEmail, useAuth } from '#/context/AuthContext'

export const Route = createFileRoute('/profile/')({
  component: ProfileIndexPage,
})

function ProfileIndexPage() {
  const { user } = useAuth()
  const name = user?.name ?? 'space.digitalia'
  const email = user?.email ?? 'spa.digitalia@example.com'
  const avatar = avatarUrlForEmail(email)

  return (
    <>
      <div className="overflow-hidden rounded-[40px] border border-border bg-card shadow-sm">
        <div className="relative h-48 bg-linear-to-r from-[#d4ff3f]/20 via-white to-rose-600/10">
          <div className="absolute -bottom-16 left-12 flex items-end gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-3xl bg-white p-1 shadow-xl ring-4 ring-white/50">
                <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-gray-100">
                  <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                  <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="mb-1 h-5 w-5 text-white" />
                    <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                      Change
                    </span>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
              <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-white bg-[#d4ff3f] shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-black" />
              </div>
            </div>
            <div className="mb-4">
              <h1 className="text-3xl font-black tracking-tight text-foreground">{name}</h1>
              <p className="flex items-center gap-2 font-medium text-muted-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {email}
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 pt-24 pb-12 lg:px-12 lg:pb-16">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="mb-1 text-xl font-bold tracking-tight">Personal Information</h2>
              <p className="text-sm text-muted-foreground">
                Update your personal details and how others see you.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-6 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                Discard
              </button>
              <button
                type="button"
                className="rounded-2xl bg-[#d4ff3f] px-8 py-2.5 text-sm font-black tracking-widest text-black uppercase shadow-lg shadow-[#d4ff3f]/30 transition-transform hover:scale-[1.02]"
              >
                Save Changes
              </button>
            </div>
          </div>

          <form className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Field label="Full Name" icon={<User className="h-5 w-5" />}>
              <input
                type="text"
                defaultValue={name}
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold text-foreground transition-all focus:border-[#d4ff3f] focus:ring-4 focus:ring-[#d4ff3f]/10 focus:outline-none"
              />
            </Field>
            <Field label="Display Name" icon={<AtSign className="h-5 w-5" />}>
              <input
                type="text"
                defaultValue="space.digitalia"
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold text-foreground transition-all focus:border-[#d4ff3f] focus:ring-4 focus:ring-[#d4ff3f]/10 focus:outline-none"
              />
            </Field>
            <Field label="Phone Number" icon={<Phone className="h-5 w-5" />}>
              <input
                type="tel"
                defaultValue="+62 812 3456 7890"
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold text-foreground transition-all focus:border-[#d4ff3f] focus:ring-4 focus:ring-[#d4ff3f]/10 focus:outline-none"
              />
            </Field>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                Gender
              </label>
              <div className="flex h-[60px] items-center gap-4 rounded-2xl border border-border bg-muted/40 p-2">
                <button
                  type="button"
                  className="flex h-full flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-bold shadow-sm"
                >
                  <User2 className="h-4 w-4 text-blue-500" />
                  Male
                </button>
                <button
                  type="button"
                  className="flex h-full flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold text-muted-foreground transition-all hover:bg-card hover:text-foreground"
                >
                  <UserCircle2 className="h-4 w-4" />
                  Female
                </button>
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-4">
                <SelectBox defaultValue="12" />
                <SelectBox defaultValue="May" />
                <SelectBox defaultValue="1995" />
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                Bio / Description
              </label>
              <textarea
                rows={4}
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-semibold text-foreground transition-all focus:border-[#d4ff3f] focus:ring-4 focus:ring-[#d4ff3f]/10 focus:outline-none"
                defaultValue="Enthusiastic watch collector and digital product designer based in Jakarta."
              />
            </div>
          </form>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <InfoCard
          title="Account Security"
          desc="Dua faktor autentikasi aktif. Terakhir diubah 2 bulan lalu."
          cta="Update Password"
          icon={<Lock className="h-6 w-6" />}
          tone="blue"
        />
        <InfoCard
          title="Luxe Wallet"
          desc={
            <>
              Saldo Anda saat ini:{' '}
                    <span className="font-bold text-foreground">Rp 2.500.000</span>
            </>
          }
          cta="Top Up Now"
          icon={<Wallet className="h-6 w-6" />}
          tone="green"
        />
      </div>
    </>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="group space-y-1.5">
      <label className="text-[11px] font-black tracking-widest text-muted-foreground transition-colors group-focus-within:text-foreground uppercase">
        {label}
      </label>
      <div className="relative flex items-center">
        {children}
        <div className="absolute right-5 text-muted-foreground/60 transition-colors group-focus-within:text-foreground">
          {icon}
        </div>
      </div>
    </div>
  )
}

function SelectBox({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      defaultValue={defaultValue}
      className="cursor-pointer appearance-none rounded-2xl border border-border bg-background px-5 py-4 font-bold text-foreground transition-all focus:border-[#d4ff3f] focus:ring-4 focus:ring-[#d4ff3f]/10 focus:outline-none"
    >
      <option value={defaultValue}>{defaultValue}</option>
    </select>
  )
}

function InfoCard({
  title,
  desc,
  cta,
  icon,
  tone,
}: {
  title: string
  desc: React.ReactNode
  cta: string
  icon: React.ReactNode
  tone: 'blue' | 'green'
}) {
  const toneClass =
    tone === 'blue'
      ? 'bg-blue-50 text-blue-600'
      : 'bg-emerald-50 text-emerald-600'
  return (
    <div className="group flex items-start gap-5 rounded-[32px] border border-border bg-card p-8 shadow-sm">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${toneClass}`}
      >
        {icon}
      </div>
      <div>
        <h3 className="mb-1 font-bold">{title}</h3>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{desc}</p>
        <button
          type="button"
          className="text-[11px] font-black tracking-widest text-rose-600 uppercase hover:underline"
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
