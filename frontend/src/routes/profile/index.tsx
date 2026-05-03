import { Link, createFileRoute } from '@tanstack/react-router'

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

import { useMutation, useQuery } from '@tanstack/react-query'

import type { FormEvent, ReactNode } from 'react'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { toast } from 'sonner'

import { avatarUrlForEmail, useAuth } from '#/context/AuthContext'

import { ApiError } from '#/lib/config'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

import { authMeQueryOptions } from '#/service/auth.service'

export const Route = createFileRoute('/profile/')({
  component: ProfileIndexPage,
})

function ProfileRetryPanel({
  message,
  retryLabel,
  onRetry,
}: {
  message: string
  retryLabel: string
  onRetry: () => void
}) {
  return (
    <div className="rounded-[40px] border border-border bg-card px-8 py-16 text-center shadow-sm">
      <p className="mb-4 text-sm font-medium text-foreground">{message}</p>
      <Button type="button" variant="ctaRose" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  )
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const value = String(i + 1).padStart(2, '0')
  const label = new Date(2000, i, 1).toLocaleString(undefined, {
    month: 'long',
  })
  return { value, label }
})

const YEAR_END = new Date().getFullYear()
const YEAR_START = YEAR_END - 90
const YEAR_OPTIONS = Array.from(
  { length: YEAR_END - YEAR_START + 1 },
  (_, i) => {
    const y = YEAR_END - i
    return { value: String(y), label: String(y) }
  },
)

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const v = String(i + 1).padStart(2, '0')
  return { value: v, label: String(i + 1) }
})

function normalizeGender(
  g: string | null | undefined,
): 'male' | 'female' | null {
  if (g == null || g === '') return null
  const x = String(g).trim().toLowerCase()
  if (['male', 'm', 'laki-laki', 'laki laki'].includes(x)) return 'male'
  if (['female', 'f', 'perempuan', 'wanita'].includes(x)) return 'female'
  return null
}

function parseIsoParts(iso: string | null | undefined): {
  dobDay: string
  dobMonth: string
  dobYear: string
} {
  if (!iso) return { dobDay: '', dobMonth: '', dobYear: '' }
  const s = iso.slice(0, 10)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return { dobDay: '', dobMonth: '', dobYear: '' }
  const [, year, mo, dd] = m
  return { dobYear: year, dobMonth: mo, dobDay: dd }
}

function draftFromUser(user: AuthUser): ProfileDraft {
  const { dobDay, dobMonth, dobYear } = parseIsoParts(user.date)
  const n = user.name
  return {
    fullName: n,
    displayName: n,
    phone: user.phone ?? '',
    gender: normalizeGender(user.gender),
    dobDay,
    dobMonth,
    dobYear,
  }
}

function dobToIso(draft: ProfileDraft): string | null {
  const { dobDay: dRaw, dobMonth: mRaw, dobYear } = draft
  if (!dRaw || !mRaw || !dobYear) return null
  const d = dRaw.padStart(2, '0')
  const mo = mRaw.padStart(2, '0')
  const yNum = Number(dobYear)
  const mm = Number(mo)
  const dd = Number(d)
  const dt = new Date(Date.UTC(yNum, mm - 1, dd))
  if (
    dt.getUTCFullYear() !== yNum ||
    dt.getUTCMonth() !== mm - 1 ||
    dt.getUTCDate() !== dd
  ) {
    return null
  }
  return `${dobYear}-${mo}-${d}`
}

function ProfileIndexPage() {
  const { updateProfile } = useAuth()
  const profileQuery = useQuery(authMeQueryOptions())

  const saveMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => toast.success('Profil diperbarui'),
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : 'Gagal menyimpan profil',
      )
    },
  })

  const user = profileQuery.data?.user
  const baseline = useMemo(() => (user ? draftFromUser(user) : null), [user])
  const [dirtyDraft, setDirtyDraft] = useState<ProfileDraft | null>(null)

  useEffect(() => {
    setDirtyDraft(null)
  }, [user])

  const patchDraft = useCallback(
    (updater: (d: ProfileDraft) => ProfileDraft) => {
      setDirtyDraft((prev) => {
        if (baseline === null) return prev
        return updater(prev ?? baseline)
      })
    },
    [baseline],
  )

  const dirty = useMemo(() => {
    if (!baseline) return false
    return JSON.stringify(dirtyDraft ?? baseline) !== JSON.stringify(baseline)
  }, [dirtyDraft, baseline])

  if (profileQuery.status === 'pending') {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[40px] border border-border bg-card text-muted-foreground">
        Memuat profil…
      </div>
    )
  }

  if (profileQuery.isError) {
    const msg =
      profileQuery.error instanceof ApiError
        ? profileQuery.error.message
        : 'Profil tidak dapat dimuat.'
    return (
      <ProfileRetryPanel
        message={msg}
        retryLabel="Coba lagi"
        onRetry={() => profileQuery.refetch()}
      />
    )
  }

  if (!user || baseline === null) {
    return (
      <ProfileRetryPanel
        message="Sesi tidak valid atau profil kosong."
        retryLabel="Muat ulang"
        onRetry={() => profileQuery.refetch()}
      />
    )
  }

  const profileDraft: ProfileDraft = dirtyDraft ?? baseline

  const email = user.email
  const avatar = avatarUrlForEmail(email)
  const headingName =
    profileDraft.displayName.trim() ||
    profileDraft.fullName.trim() ||
    user.name ||
    'Profil'

  function resetDraft() {
    setDirtyDraft(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const name = profileDraft.displayName.trim() || profileDraft.fullName.trim()
    if (name.length < 2) {
      toast.error('Nama minimal 2 karakter')
      return
    }

    const isCompleteDob = Boolean(
      profileDraft.dobDay && profileDraft.dobMonth && profileDraft.dobYear,
    )
    const hasPartialDob = Boolean(
      profileDraft.dobDay || profileDraft.dobMonth || profileDraft.dobYear,
    )
    if (hasPartialDob && !isCompleteDob) {
      toast.error(
        'Lengkapi tanggal lahir (hari, bulan, tahun) atau kosongkan semua',
      )
      return
    }

    const dateIso = isCompleteDob ? dobToIso(profileDraft) : null
    if (isCompleteDob && dateIso === null) {
      toast.error('Tanggal lahir tidak valid untuk bulan yang dipilih')
      return
    }

    const phoneTrim = profileDraft.phone.trim()
    if (phoneTrim) {
      const digits = phoneTrim.replace(/\D/g, '')
      if (digits.length < 8 || digits.length > 15) {
        toast.error('Nomor telepon berisi 8–15 digit')
        return
      }
    }

    await saveMutation.mutateAsync({
      name,
      phone: phoneTrim === '' ? null : phoneTrim.slice(0, 32),
      gender: profileDraft.gender,
      date: dateIso === null ? null : dateIso,
    })
  }

  return (
    <>
      <div className="overflow-hidden rounded-[40px] border border-border bg-card shadow-sm">
        <div className="relative h-48 bg-linear-to-r from-[#d4ff3f]/20 via-white to-rose-600/10">
          <div className="absolute -bottom-16 left-12 flex items-end gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-3xl bg-white p-1 shadow-xl ring-4 ring-white/50">
                <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
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
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                {headingName}
              </h1>
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
              <h2 className="mb-1 text-xl font-bold tracking-tight">
                Personal Information
              </h2>
              <p className="text-sm text-muted-foreground">
                Update your personal details and how others see you.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="profileDiscard"
                disabled={!dirty}
                onClick={resetDraft}
              >
                Discard
              </Button>
              <Button
                type="submit"
                form="profile-personal-form"
                variant="lime"
                disabled={!dirty || saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Menyimpan…' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <form
            id="profile-personal-form"
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <Field label="Full Name" icon={<User className="h-5 w-5" />}>
              <Input
                variant="field"
                type="text"
                name="fullName"
                autoComplete="name"
                value={profileDraft.fullName}
                onChange={(ev) =>
                  patchDraft((d) => ({ ...d, fullName: ev.target.value }))
                }
              />
            </Field>
            <Field label="Display Name" icon={<AtSign className="h-5 w-5" />}>
              <Input
                variant="field"
                type="text"
                name="displayName"
                autoComplete="nickname"
                value={profileDraft.displayName}
                onChange={(ev) =>
                  patchDraft((d) => ({
                    ...d,
                    displayName: ev.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Phone Number" icon={<Phone className="h-5 w-5" />}>
              <Input
                variant="field"
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                value={profileDraft.phone}
                onChange={(ev) =>
                  patchDraft((d) => ({ ...d, phone: ev.target.value }))
                }
                placeholder="+62 …"
              />
            </Field>
            <div className="space-y-1.5">
              <span className="text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                Gender
              </span>
              <div className="flex h-[60px] items-center gap-4 rounded-2xl border border-border bg-muted/40 p-2">
                <button
                  type="button"
                  onClick={() =>
                    patchDraft((d) => ({
                      ...d,
                      gender: d.gender === 'male' ? null : 'male',
                    }))
                  }
                  className={`flex h-full flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-colors ${
                    profileDraft.gender === 'male'
                      ? 'border-border bg-card shadow-sm'
                      : 'border-transparent text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  <User2 className="h-4 w-4 text-blue-500" />
                  Male
                </button>
                <button
                  type="button"
                  onClick={() =>
                    patchDraft((d) => ({
                      ...d,
                      gender: d.gender === 'female' ? null : 'female',
                    }))
                  }
                  className={`flex h-full flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-colors ${
                    profileDraft.gender === 'female'
                      ? 'border-border bg-card shadow-sm'
                      : 'border-transparent text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  <UserCircle2 className="h-4 w-4" />
                  Female
                </button>
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <span className="text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                Date of Birth
              </span>
              <div className="grid grid-cols-3 gap-4">
                <SelectField
                  value={profileDraft.dobDay}
                  placeholder="Day"
                  options={DAY_OPTIONS}
                  onChange={(v) => patchDraft((d) => ({ ...d, dobDay: v }))}
                />
                <SelectField
                  value={profileDraft.dobMonth}
                  placeholder="Month"
                  options={MONTH_OPTIONS}
                  onChange={(v) => patchDraft((d) => ({ ...d, dobMonth: v }))}
                />
                <SelectField
                  value={profileDraft.dobYear}
                  placeholder="Year"
                  options={YEAR_OPTIONS}
                  onChange={(v) => patchDraft((d) => ({ ...d, dobYear: v }))}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <InfoCard
          title="Account Security"
          desc="Dua faktor autentikasi aktif. Terakhir diubah 2 bulan lalu."
          cta="Update Password"
          ctaTo="/change-password"
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
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="group space-y-1.5">
      <label className="text-[11px] font-black tracking-widest text-muted-foreground transition-colors group-focus-within:text-foreground uppercase">
        {label}
      </label>
      <div className="relative flex items-center">
        {children}
        <div className="pointer-events-none absolute right-5 text-muted-foreground/60 transition-colors group-focus-within:text-foreground">
          {icon}
        </div>
      </div>
    </div>
  )
}

function SelectField({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string
  placeholder: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full cursor-pointer appearance-none rounded-2xl border border-border bg-background px-5 py-4 font-bold text-foreground transition-all focus:border-[#d4ff3f] focus:ring-4 focus:ring-[#d4ff3f]/10 focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function InfoCard({
  title,
  desc,
  cta,
  ctaTo,
  icon,
  tone,
}: {
  title: string
  desc: ReactNode
  cta: string
  ctaTo?: string
  icon: ReactNode
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
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {desc}
        </p>
        {ctaTo ? (
          <Button variant="ctaRose" asChild>
            <Link to={ctaTo}>{cta}</Link>
          </Button>
        ) : (
          <Button type="button" variant="ctaRose">
            {cta}
          </Button>
        )}
      </div>
    </div>
  )
}
