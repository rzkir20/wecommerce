import { Link, useNavigate } from '@tanstack/react-router'

import {
  AlertCircle,
  ArrowRight,
  Bell,
  Building2,
  Camera,
  Check,
  CreditCard,
  FileText,
  Landmark,
  LayoutGrid,
  LogOut,
  MapPin,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Store,
  TrendingUp,
  UploadCloud,
  Users,
  Watch,
} from 'lucide-react'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'

import { avatarUrlForEmail, useAuth } from '#/context/AuthContext'

import { API_PATHS, ApiError, apiJson } from '#/lib/config'

import { toast } from 'sonner'

const DRAFT_KEY = 'wecommerce-luxe-seller-draft'

type SellerApplicationRow = {
  id: string
  user_id: string
  business_type: 'perorangan' | 'perusahaan'
  store_name: string
  store_description: string | null
  full_name: string | null
  ktp_number: string | null
  ktp_image: string | null
  selfie_ktp: string | null
  company_name: string | null
  company_address: string | null
  bank_name: string | null
  bank_account_no: string | null
  has_nib: boolean
  nib_number: string | null
  nib_image: string | null
  has_npwp: boolean
  npwp_number: string | null
  npwp_image: string | null
  has_deed: boolean
  deed_image: string | null
  supporting_doc: string | null
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
}

type ShopRow = {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  status: 'active' | 'suspended'
}

type DraftShape = {
  businessType: 'perorangan' | 'perusahaan'
  storeName: string
  fullName: string
  description: string
  ktpNumber: string
  ktpImageUrl: string
  selfieKtpUrl: string
  companyName: string
  companyAddress: string
  bankName: string
  bankAccountNo: string
  hasNib: boolean
  nibNumber: string
  nibImageUrl: string
  hasNpwp: boolean
  npwpNumber: string
  npwpImageUrl: string
  hasDeed: boolean
  deedImageUrl: string
  supportingDocUrl: string
}

const neon = '#d4ff3f'
const darkBg = '#09090b'

export function LuxeSellerOnboardingPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const userName = user?.name ?? 'Merchant'
  const userAvatar = user ? avatarUrlForEmail(user.email) : ''

  const [applications, setApplications] = useState<SellerApplicationRow[]>([])
  const [shop, setShop] = useState<ShopRow | null>(null)
  const [loadingState, setLoadingState] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [businessType, setBusinessType] = useState<'perorangan' | 'perusahaan'>(
    'perorangan',
  )
  const [storeName, setStoreName] = useState('')
  const [fullName, setFullName] = useState('')
  const [description, setDescription] = useState('')
  const [ktpNumber, setKtpNumber] = useState('')
  const [ktpImageUrl, setKtpImageUrl] = useState('')
  const [selfieKtpUrl, setSelfieKtpUrl] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNo, setBankAccountNo] = useState('')
  const [hasNib, setHasNib] = useState(false)
  const [nibNumber, setNibNumber] = useState('')
  const [nibImageUrl, setNibImageUrl] = useState('')
  const [hasNpwp, setHasNpwp] = useState(false)
  const [npwpNumber, setNpwpNumber] = useState('')
  const [npwpImageUrl, setNpwpImageUrl] = useState('')
  const [hasDeed, setHasDeed] = useState(false)
  const [deedImageUrl, setDeedImageUrl] = useState('')
  const [supportingDocUrl, setSupportingDocUrl] = useState('')
  const [ktpPreview, setKtpPreview] = useState<string | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  const ktpFileRef = useRef<HTMLInputElement>(null)
  const selfieFileRef = useRef<HTMLInputElement>(null)

  const refreshApplications = useCallback(async () => {
    try {
      const res = await apiJson<{ applications?: SellerApplicationRow[] }>(
        API_PATHS.seller.applicationsMe,
      )
      setApplications(
        Array.isArray(res.applications) ? res.applications : [],
      )
    } catch {
      setApplications([])
    }
  }, [])

  const refreshShop = useCallback(async () => {
    try {
      const res = await apiJson<{ shop: ShopRow }>(API_PATHS.shops.me)
      setShop(res.shop)
    } catch {
      setShop(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoadingState(true)
      await Promise.all([refreshApplications(), refreshShop()])
      if (!cancelled) setLoadingState(false)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [refreshApplications, refreshShop])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const d = JSON.parse(raw) as Partial<DraftShape>
      if (d.businessType === 'perorangan' || d.businessType === 'perusahaan') {
        setBusinessType(d.businessType)
      }
      if (d.storeName) setStoreName(d.storeName)
      if (typeof d.fullName === 'string') setFullName(d.fullName)
      if (typeof d.description === 'string') setDescription(d.description)
      if (d.ktpNumber) setKtpNumber(d.ktpNumber)
      if (d.ktpImageUrl) setKtpImageUrl(d.ktpImageUrl)
      if (d.selfieKtpUrl) setSelfieKtpUrl(d.selfieKtpUrl)
      if (typeof d.companyName === 'string') setCompanyName(d.companyName)
      if (typeof d.companyAddress === 'string') setCompanyAddress(d.companyAddress)
      if (typeof d.bankName === 'string') setBankName(d.bankName)
      if (typeof d.bankAccountNo === 'string') setBankAccountNo(d.bankAccountNo)
      if (typeof d.hasNib === 'boolean') setHasNib(d.hasNib)
      if (typeof d.nibNumber === 'string') setNibNumber(d.nibNumber)
      if (typeof d.nibImageUrl === 'string') setNibImageUrl(d.nibImageUrl)
      if (typeof d.hasNpwp === 'boolean') setHasNpwp(d.hasNpwp)
      if (typeof d.npwpNumber === 'string') setNpwpNumber(d.npwpNumber)
      if (typeof d.npwpImageUrl === 'string') setNpwpImageUrl(d.npwpImageUrl)
      if (typeof d.hasDeed === 'boolean') setHasDeed(d.hasDeed)
      if (typeof d.deedImageUrl === 'string') setDeedImageUrl(d.deedImageUrl)
      if (typeof d.supportingDocUrl === 'string') setSupportingDocUrl(d.supportingDocUrl)
    } catch {
      /* ignore */
    }
  }, [])

  const latestApplication = applications.at(0)

  const hasPending = useMemo(
    () => applications.some((a) => a.status === 'pending'),
    [applications],
  )

  const latestRejected = useMemo(
    () => applications.find((a) => a.status === 'rejected'),
    [applications],
  )

  function persistDraft() {
    const draft: DraftShape = {
      businessType,
      storeName,
      fullName,
      description,
      ktpNumber,
      ktpImageUrl,
      selfieKtpUrl,
      companyName,
      companyAddress,
      bankName,
      bankAccountNo,
      hasNib,
      nibNumber,
      nibImageUrl,
      hasNpwp,
      npwpNumber,
      npwpImageUrl,
      hasDeed,
      deedImageUrl,
      supportingDocUrl,
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    toast.success('Draft disimpan di perangkat ini')
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
  }

  function onKtpFile(files: FileList | null) {
    const f = files?.[0]
    if (!f || !f.type.startsWith('image/')) return
    setKtpPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(f)
    })
    void uploadSellerFile(f, 'ktp_image', setKtpImageUrl)
  }

  function onSelfieFile(files: FileList | null) {
    const f = files?.[0]
    if (!f || !f.type.startsWith('image/')) return
    setSelfiePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(f)
    })
    void uploadSellerFile(f, 'selfie_ktp', setSelfieKtpUrl)
  }

  async function uploadSellerFile(
    file: File,
    kind: string,
    setValue: (url: string) => void,
  ) {
    try {
      setUploadingKey(kind)
      const form = new FormData()
      form.set('file', file)
      form.set('kind', kind)
      const res = await apiJson<{ url: string }>('/api/seller/applications/upload', {
        method: 'POST',
        body: form,
      })
      setValue(res.url)
      toast.success('File berhasil diunggah ke Supabase Storage')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Gagal upload file')
    } finally {
      setUploadingKey((prev) => (prev === kind ? null : prev))
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasPending || shop) return

    const name = storeName.trim()
    if (name.length < 2) {
      toast.error('Nama toko minimal 2 karakter')
      return
    }

    const urlOk = (s: string) => {
      try {
        const u = new URL(s.trim())
        return u.protocol === 'https:' || u.protocol === 'http:'
      } catch {
        return false
      }
    }

    const validateUrlField = (value: string, label: string) => {
      const s = value.trim()
      if (!urlOk(s) || s.length > 512) {
        toast.error(`${label} tidak valid (HTTPS/HTTP, max 512 karakter)`)
        return null
      }
      return s
    }

    let requestBody: Record<string, unknown> = {
      store_name: name,
      store_description: description.trim() === '' ? null : description.trim(),
      business_type: businessType,
    }

    if (businessType === 'perorangan') {
      const personName = fullName.trim()
      if (personName.length < 2) {
        toast.error('Nama pemilik minimal 2 karakter')
        return
      }

      const digits = ktpNumber.replace(/\D/g, '')
      if (digits.length !== 16) {
        toast.error('Nomor KTP harus 16 digit')
        return
      }

      const ktpU = validateUrlField(ktpImageUrl, 'URL gambar KTP')
      if (!ktpU) return
      const selfieU = validateUrlField(selfieKtpUrl, 'URL selfie verifikasi wajah')
      if (!selfieU) return

      requestBody = {
        ...requestBody,
        full_name: personName,
        ktp_number: digits,
        ktp_image: ktpU,
        selfie_ktp: selfieU,
      }
    } else {
      const company = companyName.trim()
      if (company.length < 2) {
        toast.error('Nama perusahaan minimal 2 karakter')
        return
      }
      const address = companyAddress.trim()
      if (address.length < 5) {
        toast.error('Alamat perusahaan minimal 5 karakter')
        return
      }
      const bank = bankName.trim()
      if (bank.length < 2) {
        toast.error('Nama bank minimal 2 karakter')
        return
      }
      const rekening = bankAccountNo.trim()
      if (rekening.length < 5) {
        toast.error('No rekening minimal 5 karakter')
        return
      }

      const supporting = validateUrlField(supportingDocUrl, 'Dokumen pendukung')
      if (!supporting) return

      const nibNo = nibNumber.trim()
      const nibImg = nibImageUrl.trim()
      if (hasNib) {
        if (nibNo.length < 3) {
          toast.error('Nomor NIB wajib diisi')
          return
        }
        if (!validateUrlField(nibImg, 'Bukti NIB')) return
      }

      const npwpNo = npwpNumber.trim()
      const npwpImg = npwpImageUrl.trim()
      if (hasNpwp) {
        if (npwpNo.length < 3) {
          toast.error('Nomor NPWP wajib diisi')
          return
        }
        if (!validateUrlField(npwpImg, 'Bukti NPWP')) return
      }

      const deedImg = deedImageUrl.trim()
      if (hasDeed && !validateUrlField(deedImg, 'Akta pendirian')) return

      requestBody = {
        ...requestBody,
        company_name: company,
        company_address: address,
        bank_name: bank,
        bank_account_no: rekening,
        has_nib: hasNib,
        nib_number: hasNib ? nibNo : null,
        nib_image: hasNib ? nibImg : null,
        has_npwp: hasNpwp,
        npwp_number: hasNpwp ? npwpNo : null,
        npwp_image: hasNpwp ? npwpImg : null,
        has_deed: hasDeed,
        deed_image: hasDeed ? deedImg : null,
        supporting_doc: supporting,
      }
    }

    setSubmitting(true)
    try {
      await apiJson<{ application: SellerApplicationRow }>(
        API_PATHS.seller.applications,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
      )
      clearDraft()
      toast.success('Pengajuan terkirim')
      await refreshApplications()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Gagal mengirim pengajuan')
    } finally {
      setSubmitting(false)
    }
  }

  const submittedLabel = applications.length > 0 ? 'Submitted' : '—'

  return (
    <div
      className="luxe-portal-slide-up flex min-h-screen text-white"
      style={{
        fontFamily: "'Satoshi', system-ui, sans-serif",
        backgroundColor: darkBg,
        ['--neon-lime' as string]: neon,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes luxe-portal-slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .luxe-portal-slide-up { animation: luxe-portal-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .luxe-portal-focus:focus {
            border-color: ${neon};
            box-shadow: 0 0 15px rgba(212, 255, 63, 0.15);
            outline: none;
          }
        `,
        }}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[250px] flex-col border-r border-white/5 bg-[#09090b] p-6 lg:flex">
        <div className="mb-10 pl-2">
          <Link to="/" className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e11d48] shadow-lg shadow-red-500/20">
              <Watch className="h-5 w-5 text-white" aria-hidden />
            </div>
            <span
              className="text-lg font-black uppercase tracking-tighter text-white"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
            >
              LUXE WATCH
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col space-y-1.5">
          <SidebarNavLink to="/" icon={LayoutGrid} label="Dashboard" />
          <SidebarNavLink to="/cart" icon={FileText} label="Orders" />
          <SidebarNavLink to="/products" icon={Package} label="Products" />
          <SidebarNavLink to="/products" icon={Users} label="Customers" />
          <SidebarNavLink to="/forget-password" icon={Settings} label="Settings" />
          <SidebarNavLink to="/products" icon={TrendingUp} label="Marketing" />
          <Link
            to="/portal"
            className="flex items-center gap-3 rounded-xl bg-[#d4ff3f] px-4 py-3 text-[11px] font-black uppercase tracking-widest text-black shadow-[0_0_15px_rgba(212,255,63,0.3)] transition-all"
          >
            <Store className="text-lg" aria-hidden />
            <span>Become a Seller</span>
          </Link>
        </nav>
        <div className="mt-auto">
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:text-white"
          >
            <LogOut className="text-lg" aria-hidden />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:ml-[250px]">
        {/* Top bar */}
        <nav className="fixed left-0 right-0 top-0 z-40 flex h-20 items-center justify-between gap-4 border-b border-white/5 bg-[#09090b] px-4 py-0 sm:px-6 lg:left-[250px] lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 lg:hidden"
            aria-label="Home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e11d48] shadow-lg shadow-red-500/20">
              <Watch className="h-4 w-4 text-white" />
            </span>
          </Link>
          <div className="relative max-w-xl min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              placeholder="Search products..."
              className="luxe-portal-focus w-full rounded-full border border-white/5 bg-zinc-900/50 py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-zinc-600"
            />
          </div>
          <div className="ml-6 flex items-center gap-4 md:gap-6">
            <button
              type="button"
              className="relative text-zinc-400 transition-colors hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-7 w-7" />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <Link
              to="/cart"
              className="relative text-zinc-400 transition-colors hover:text-white"
              aria-label="Cart"
            >
              <ShoppingBag className="h-7 w-7" />
            </Link>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs text-zinc-400">Welcome back</p>
                <p className="text-sm font-bold">{userName}</p>
              </div>
              <img
                src={userAvatar}
                alt=""
                className="h-10 w-10 rounded-xl border border-white/10 bg-zinc-800 object-cover"
              />
            </div>
          </div>
        </nav>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-12 p-6 pb-16 pt-28 md:p-10 md:pt-28">
          <header className="space-y-2">
            <h1
              className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
            >
              Become a <span style={{ color: neon }}>LUXE</span> Seller
            </h1>
            <p className="text-lg font-medium text-zinc-500">
              Join our exclusive merchant community and reach luxury collectors
              worldwide.
            </p>
          </header>

          {shop ? (
            <section
              className="rounded-[2rem] border border-[#d4ff3f]/30 p-10"
              style={{
                background: 'rgba(212, 255, 63, 0.06)',
              }}
            >
              <h2
                className="text-xl font-black uppercase tracking-tight text-[#d4ff3f]"
                style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
              >
                Toko Anda aktif
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {shop.name} ·{' '}
                <Link
                  to="/products"
                  className="font-semibold text-white underline-offset-4 hover:underline"
                >
                  /{shop.slug}
                </Link>
              </p>
              <p className="mt-4 text-xs text-zinc-500">
                Kelola katalog dan pesanan dari dashboard seller (akan terhubung
                ke halaman produk).
              </p>
            </section>
          ) : null}

          {/* Progress */}
          <div className="relative py-4">
            <div
              className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2"
              style={{
                background:
                  'linear-gradient(90deg, #d4ff3f 35%, rgba(255,255,255,0.05) 35%)',
              }}
            />
            <div className="relative flex items-center justify-between">
              <ProgressStep n={1} label="Basic Info" active />
              <ProgressStep n={2} label="Verification" />
              <ProgressStep n={3} label="Final Review" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <form
              className="space-y-8 lg:col-span-2"
              onSubmit={onSubmit}
              aria-busy={submitting || loadingState}
            >
              <section
                className="space-y-8 rounded-[2.5rem] border border-white/5 p-8 backdrop-blur-xl md:p-10"
                style={{ background: 'rgba(18, 18, 20, 0.7)' }}
              >
                <div className="space-y-1">
                  <h2
                    className="text-xl font-black uppercase tracking-tight"
                    style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
                  >
                    Store Information
                  </h2>
                  <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                    Step 1 of 3
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <Field label="Tipe Bisnis">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={hasPending || !!shop}
                        onClick={() => setBusinessType('perorangan')}
                        className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                          businessType === 'perorangan'
                            ? 'border-[#d4ff3f]/70 bg-[#d4ff3f]/10 text-[#d4ff3f]'
                            : 'border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Perorangan
                      </button>
                      <button
                        type="button"
                        disabled={hasPending || !!shop}
                        onClick={() => setBusinessType('perusahaan')}
                        className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                          businessType === 'perusahaan'
                            ? 'border-[#d4ff3f]/70 bg-[#d4ff3f]/10 text-[#d4ff3f]'
                            : 'border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Perusahaan
                      </button>
                    </div>
                  </Field>

                  <Field label="Store Name">
                    <div className="relative">
                      <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                      <input
                        type="text"
                        placeholder="The Heritage Boutique"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        disabled={hasPending || !!shop}
                        maxLength={255}
                        className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                      />
                    </div>
                  </Field>

                  {businessType === 'perorangan' ? (
                    <Field label="Nama Pemilik (Sesuai KTP)">
                      <div className="relative">
                        <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                        <input
                          type="text"
                          placeholder="Nama lengkap sesuai KTP"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={hasPending || !!shop}
                          maxLength={255}
                          className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                        />
                      </div>
                    </Field>
                  ) : null}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Store Description
                      </label>
                      <span className="text-[9px] font-black text-zinc-700">
                        {description.length} / 500
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="Describe your collection and brand heritage..."
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value.slice(0, 500))
                      }
                      disabled={hasPending || !!shop}
                      className="luxe-portal-focus w-full resize-none rounded-2xl border border-white/5 bg-black/40 p-6 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                    />
                    <p className="text-[10px] text-zinc-600">
                      Deskripsi toko ini akan ikut dikirim ke API.
                    </p>
                  </div>
                </div>
              </section>

              <section
                id="ktp-section-scroll"
                className="space-y-8 rounded-[2.5rem] border border-white/5 p-8 backdrop-blur-xl md:p-10"
                style={{ background: 'rgba(18, 18, 20, 0.7)' }}
              >
                <div className="space-y-1">
                  <h2
                    className="text-xl font-black uppercase tracking-tight"
                    style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
                  >
                    {businessType === 'perorangan'
                      ? 'KTP Verification'
                      : 'Company Verification'}
                  </h2>
                  <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                    Step 2 of 3
                  </p>
                </div>

                {businessType === 'perorangan' ? (
                  <div className="space-y-6">
                    <Field label="KTP Number (16 Digits)">
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={24}
                          placeholder="317XXXXXXXXXXXXX"
                          value={ktpNumber}
                          onChange={(e) => setKtpNumber(e.target.value)}
                          disabled={hasPending || !!shop}
                          className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm font-medium tracking-[0.15em] text-white placeholder:text-zinc-600 disabled:opacity-50"
                        />
                      </div>
                    </Field>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <p className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          KTP Image Upload
                        </p>
                        <input
                          ref={ktpFileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => onKtpFile(e.target.files)}
                        />
                        <button
                          type="button"
                          disabled={hasPending || !!shop}
                          onClick={() => ktpFileRef.current?.click()}
                          className="group flex w-full cursor-pointer flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-white/5 p-8 text-center transition-all hover:border-[#d4ff3f]/30 hover:bg-white/2 disabled:pointer-events-none disabled:opacity-50"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-600 transition-colors group-hover:text-[#d4ff3f]">
                            <UploadCloud className="h-7 w-7" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold">Drop KTP image here</p>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                              JPG, PNG (Max 5MB) · preview only
                            </p>
                          </div>
                        </button>
                        {ktpPreview ? (
                          <img
                            src={ktpPreview}
                            alt="KTP preview"
                            className="max-h-40 rounded-xl border border-white/10 object-contain"
                          />
                        ) : null}
                        <Field label="Public URL (HTTPS)">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={ktpImageUrl}
                            onChange={(e) => setKtpImageUrl(e.target.value)}
                            disabled={hasPending || !!shop}
                            maxLength={512}
                            className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 text-xs font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                          />
                          <UploadToSupabaseButton
                            disabled={hasPending || !!shop}
                            loading={uploadingKey === 'ktp_image'}
                            onPick={(file) =>
                              void uploadSellerFile(file, 'ktp_image', setKtpImageUrl)
                            }
                          />
                        </Field>
                      </div>

                      <div className="space-y-3">
                        <p className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Selfie with KTP
                        </p>
                        <input
                          ref={selfieFileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => onSelfieFile(e.target.files)}
                        />
                        <button
                          type="button"
                          disabled={hasPending || !!shop}
                          onClick={() => selfieFileRef.current?.click()}
                          className="group flex w-full cursor-pointer flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-white/5 p-8 text-center transition-all hover:border-[#d4ff3f]/30 hover:bg-white/2 disabled:pointer-events-none disabled:opacity-50"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-600 transition-colors group-hover:text-[#d4ff3f]">
                            <Camera className="h-7 w-7" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold">Capture or Upload</p>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                              Face must be clear · preview only
                            </p>
                          </div>
                        </button>
                        {selfiePreview ? (
                          <img
                            src={selfiePreview}
                            alt="Selfie preview"
                            className="max-h-40 rounded-xl border border-white/10 object-contain"
                          />
                        ) : null}
                        <Field label="Public URL (HTTPS)">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={selfieKtpUrl}
                            onChange={(e) => setSelfieKtpUrl(e.target.value)}
                            disabled={hasPending || !!shop}
                            maxLength={512}
                            className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 text-xs font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                          />
                          <UploadToSupabaseButton
                            disabled={hasPending || !!shop}
                            loading={uploadingKey === 'selfie_ktp'}
                            onPick={(file) =>
                              void uploadSellerFile(file, 'selfie_ktp', setSelfieKtpUrl)
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Field label="Nama Perusahaan">
                        <div className="relative">
                          <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                          <input
                            type="text"
                            placeholder="PT Contoh Sejahtera"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            disabled={hasPending || !!shop}
                            maxLength={255}
                            className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                          />
                        </div>
                      </Field>
                      <Field label="Nama Bank">
                        <div className="relative">
                          <Landmark className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                          <input
                            type="text"
                            placeholder="BCA"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            disabled={hasPending || !!shop}
                            maxLength={255}
                            className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                          />
                        </div>
                      </Field>
                    </div>

                    <Field label="Alamat Perusahaan">
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-4 top-6 h-4 w-4 text-zinc-600" />
                        <textarea
                          rows={3}
                          placeholder="Alamat lengkap perusahaan"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          disabled={hasPending || !!shop}
                          maxLength={1000}
                          className="luxe-portal-focus w-full resize-none rounded-2xl border border-white/5 bg-black/40 p-4 pl-12 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                        />
                      </div>
                    </Field>

                    <Field label="No Rekening">
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                        <input
                          type="text"
                          placeholder="Nomor rekening perusahaan"
                          value={bankAccountNo}
                          onChange={(e) => setBankAccountNo(e.target.value)}
                          disabled={hasPending || !!shop}
                          maxLength={64}
                          className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                        />
                      </div>
                    </Field>

                    <ToggleField
                      label="Memiliki NIB?"
                      value={hasNib}
                      disabled={hasPending || !!shop}
                      onChange={setHasNib}
                    />
                    {hasNib ? (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field label="Nomor NIB">
                          <input
                            type="text"
                            placeholder="Nomor NIB"
                            value={nibNumber}
                            onChange={(e) => setNibNumber(e.target.value)}
                            disabled={hasPending || !!shop}
                            maxLength={64}
                            className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                          />
                        </Field>
                        <Field label="Bukti NIB (URL Gambar)">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={nibImageUrl}
                            onChange={(e) => setNibImageUrl(e.target.value)}
                            disabled={hasPending || !!shop}
                            maxLength={512}
                            className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                          />
                          <UploadToSupabaseButton
                            disabled={hasPending || !!shop}
                            loading={uploadingKey === 'nib_image'}
                            onPick={(file) =>
                              void uploadSellerFile(file, 'nib_image', setNibImageUrl)
                            }
                          />
                        </Field>
                      </div>
                    ) : null}

                    <ToggleField
                      label="Memiliki NPWP?"
                      value={hasNpwp}
                      disabled={hasPending || !!shop}
                      onChange={setHasNpwp}
                    />
                    {hasNpwp ? (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field label="Nomor NPWP">
                          <input
                            type="text"
                            placeholder="Nomor NPWP"
                            value={npwpNumber}
                            onChange={(e) => setNpwpNumber(e.target.value)}
                            disabled={hasPending || !!shop}
                            maxLength={64}
                            className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                          />
                        </Field>
                        <Field label="Bukti NPWP (URL Gambar)">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={npwpImageUrl}
                            onChange={(e) => setNpwpImageUrl(e.target.value)}
                            disabled={hasPending || !!shop}
                            maxLength={512}
                            className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                          />
                          <UploadToSupabaseButton
                            disabled={hasPending || !!shop}
                            loading={uploadingKey === 'npwp_image'}
                            onPick={(file) =>
                              void uploadSellerFile(file, 'npwp_image', setNpwpImageUrl)
                            }
                          />
                        </Field>
                      </div>
                    ) : null}

                    <ToggleField
                      label="Memiliki Akta Pendirian?"
                      value={hasDeed}
                      disabled={hasPending || !!shop}
                      onChange={setHasDeed}
                    />
                    {hasDeed ? (
                      <Field label="Akta Pendirian (URL Gambar)">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={deedImageUrl}
                          onChange={(e) => setDeedImageUrl(e.target.value)}
                          disabled={hasPending || !!shop}
                          maxLength={512}
                          className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                        />
                        <UploadToSupabaseButton
                          disabled={hasPending || !!shop}
                          loading={uploadingKey === 'deed_image'}
                          onPick={(file) =>
                            void uploadSellerFile(file, 'deed_image', setDeedImageUrl)
                          }
                        />
                      </Field>
                    ) : null}

                    <Field label="Dokumen Pendukung Lainnya (URL)">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={supportingDocUrl}
                        onChange={(e) => setSupportingDocUrl(e.target.value)}
                        disabled={hasPending || !!shop}
                        maxLength={512}
                        className="luxe-portal-focus w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-white placeholder:text-zinc-600 disabled:opacity-50"
                      />
                      <UploadToSupabaseButton
                        disabled={hasPending || !!shop}
                        loading={uploadingKey === 'supporting_doc'}
                        onPick={(file) =>
                          void uploadSellerFile(file, 'supporting_doc', setSupportingDocUrl)
                        }
                      />
                    </Field>
                  </div>
                )}
              </section>

              <section
                className="space-y-4 rounded-[2.5rem] border border-white/5 p-8 backdrop-blur-xl md:p-10"
                style={{ background: 'rgba(18, 18, 20, 0.55)' }}
              >
                <h2
                  className="text-lg font-black uppercase tracking-tight text-zinc-300"
                  style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
                >
                  Final Review
                </h2>
                <p className="text-xs text-zinc-500">
                  Pastikan URL gambar dapat diakses reviewer. Unggah file ke
                  storage (mis. Supabase) lalu tempel tautan publik di atas.
                </p>
                <ul className="space-y-2 text-[11px] text-zinc-400">
                  <li>
                    <span className="text-zinc-600">Toko:</span> {storeName || '—'}
                  </li>
                  <li>
                    <span className="text-zinc-600">Tipe Bisnis:</span>{' '}
                    {businessType === 'perorangan' ? 'Perorangan' : 'Perusahaan'}
                  </li>
                  <li>
                    <span className="text-zinc-600">Deskripsi Toko:</span>{' '}
                    {description.trim().length > 0
                      ? description.trim().slice(0, 120) +
                        (description.trim().length > 120 ? '…' : '')
                      : '—'}
                  </li>
                  {businessType === 'perorangan' ? (
                    <li>
                      <span className="text-zinc-600">KTP:</span>{' '}
                      {ktpNumber.replace(/\D/g, '').length === 16
                        ? '•••• •••• •••• ' + ktpNumber.replace(/\D/g, '').slice(12)
                        : '—'}
                    </li>
                  ) : (
                    <>
                      <li>
                        <span className="text-zinc-600">Perusahaan:</span>{' '}
                        {companyName || '—'}
                      </li>
                      <li>
                        <span className="text-zinc-600">NIB:</span>{' '}
                        {hasNib ? 'Ya' : 'Tidak'}
                      </li>
                    </>
                  )}
                </ul>
              </section>

              {hasPending ? (
                <div className="rounded-2xl border border-[#d4ff3f]/25 bg-[#d4ff3f]/5 px-6 py-4 text-sm text-zinc-300">
                  Pengajuan Anda sedang ditinjau. Form dinonaktifkan sampai ada
                  keputusan.
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-4 pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
                    >
                      Cancel Application
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-white/10 bg-zinc-950 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Batalkan pengisian?</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Draft bisa tetap tersimpan di perangkat jika Anda sudah
                        menekan Save as Draft.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/10 bg-transparent">
                        Kembali
                      </AlertDialogCancel>
                      <AlertDialogAction
                        type="button"
                        className="bg-white text-black hover:bg-[#d4ff3f]"
                        onClick={() => void navigate({ to: '/' })}
                      >
                        Tinggalkan halaman
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <button
                  type="button"
                  onClick={persistDraft}
                  disabled={!!shop}
                  className="rounded-2xl border border-white/10 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5 disabled:opacity-40"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={submitting || loadingState || hasPending || !!shop}
                  className="rounded-2xl bg-white px-10 py-5 text-[11px] font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-[#d4ff3f] disabled:opacity-40"
                >
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </form>

            {/* Aside */}
            <aside className="space-y-8">
              <div
                className="space-y-6 rounded-[2rem] border border-white/5 p-8 backdrop-blur-xl"
                style={{ background: 'rgba(18, 18, 20, 0.7)' }}
              >
                <h3
                  className="text-sm font-black uppercase tracking-widest"
                  style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
                >
                  Application Status
                </h3>
                <div className="space-y-4">
                  <ApplicationStatusSummary
                    loadingState={loadingState}
                    latestApplication={latestApplication}
                  />

                  <div className="relative space-y-8 pl-8 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-[2px] before:bg-zinc-800">
                    <TimelineDot
                      active={latestApplication !== undefined}
                      title="Form Submitted"
                      subtitle={submittedLabel}
                    />
                    <TimelineDot
                      active={latestApplication !== undefined}
                      title="Initial Verification"
                      subtitle={
                        latestApplication === undefined
                          ? 'Queued'
                          : latestApplication.status === 'pending'
                            ? 'In progress'
                            : 'Done'
                      }
                      muted={latestApplication === undefined}
                    />
                    <TimelineDot
                      active={
                        latestApplication !== undefined &&
                        (latestApplication.status === 'approved' ||
                          latestApplication.status === 'rejected')
                      }
                      title="Final Approval"
                      subtitle={
                        latestApplication === undefined
                          ? 'Pending'
                          : latestApplication.status === 'approved'
                            ? 'Approved'
                            : latestApplication.status === 'rejected'
                              ? 'Rejected'
                              : 'Pending'
                      }
                      muted={
                        latestApplication === undefined ||
                        latestApplication.status === 'pending'
                      }
                    />
                  </div>
                </div>
              </div>

              {latestRejected != null &&
              latestRejected.rejection_reason != null &&
              latestRejected.rejection_reason.length > 0 ? (
                <div className="space-y-6 rounded-[2rem] border border-red-500/20 bg-red-500/5 p-8 backdrop-blur-xl">
                  <div className="flex items-center gap-3 text-red-500">
                    <AlertCircle className="text-xl" />
                    <h3 className="text-xs font-black uppercase tracking-widest">
                      Need Attention
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold leading-relaxed text-zinc-300">
                      Your previous application was{' '}
                      <span className="text-red-400">Rejected</span> for the
                      following reason:
                    </p>
                    <div className="rounded-xl border border-red-500/10 bg-black/40 p-3 text-[10px] font-medium italic text-red-400">
                      &quot;{latestRejected.rejection_reason}&quot;
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById('ktp-section-scroll')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        })
                      }}
                      className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:text-[#d4ff3f]"
                    >
                      <span>Fix and Resubmit</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-4 rounded-[2rem] border border-white/5 bg-zinc-900/40 p-8">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Merchant Privileges
                </h4>
                <ul className="space-y-4">
                  <Privilege text="Access to verified high-net-worth collectors." />
                  <Privilege text="Global logistics and customs handling." />
                  <Privilege text="Professional product photography service." />
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}

function ApplicationStatusSummary({
  loadingState,
  latestApplication,
}: {
  loadingState: boolean
  latestApplication: SellerApplicationRow | undefined
}) {
  if (loadingState && !latestApplication) {
    return (
      <div className="rounded-2xl border border-white/5 bg-black/30 p-4 text-[11px] text-zinc-500">
        Memuat status…
      </div>
    )
  }

  if (!latestApplication) {
    return (
      <div className="rounded-2xl border border-white/5 bg-black/30 p-4 text-[11px] text-zinc-500">
        Belum ada pengajuan. Isi form dan kirim.
      </div>
    )
  }

  if (latestApplication.status === 'pending') {
    return (
      <div className="flex animate-pulse items-center gap-4 rounded-2xl border border-[#d4ff3f]/20 bg-[#d4ff3f]/5 p-4">
        <div className="h-3 w-3 rounded-full bg-[#d4ff3f]" />
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-widest">
            Status: Pending
          </p>
          <p className="text-[10px] text-zinc-400">
            Awaiting administrative review
          </p>
        </div>
      </div>
    )
  }

  if (latestApplication.status === 'approved') {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <Check className="h-5 w-5 text-emerald-400" />
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-300">
            Approved
          </p>
          <p className="text-[10px] text-zinc-400">
            Selamat — akun seller Anda aktif.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
      <AlertCircle className="h-5 w-5 text-red-400" />
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-red-300">
          Rejected
        </p>
        <p className="text-[10px] text-zinc-400">
          Anda dapat memperbaiki dan mengajukan lagi.
        </p>
      </div>
    </div>
  )
}

function SidebarNavLink({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:text-white"
    >
      <Icon className="text-lg" aria-hidden />
      <span>{label}</span>
    </Link>
  )
}

function ProgressStep({
  n,
  label,
  active,
}: {
  n: number
  label: string
  active?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
          active
            ? 'bg-[#d4ff3f] text-black shadow-[0_0_20px_rgba(212,255,63,0.4)]'
            : 'border border-white/10 bg-zinc-800 text-zinc-500'
        }`}
      >
        {n}
      </div>
      <span
        className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-[#d4ff3f]' : 'text-zinc-500'}`}
      >
        {label}
      </span>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  )
}

function ToggleField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string
  value: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          className={`rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            value
              ? 'border-[#d4ff3f]/70 bg-[#d4ff3f]/10 text-[#d4ff3f]'
              : 'border-white/10 text-zinc-500 hover:text-white'
          }`}
        >
          Ya
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          className={`rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            !value
              ? 'border-[#d4ff3f]/70 bg-[#d4ff3f]/10 text-[#d4ff3f]'
              : 'border-white/10 text-zinc-500 hover:text-white'
          }`}
        >
          Tidak
        </button>
      </div>
    </div>
  )
}

function UploadToSupabaseButton({
  onPick,
  disabled,
  loading,
}: {
  onPick: (file: File) => void
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled || loading}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0]
          if (file) onPick(file)
          e.currentTarget.value = ''
        }}
      />
      <UploadCloud className="h-3.5 w-3.5" />
      <span>{loading ? 'Uploading…' : 'Upload ke Supabase Storage'}</span>
    </label>
  )
}

function TimelineDot({
  active,
  title,
  subtitle,
  muted,
}: {
  active?: boolean
  title: string
  subtitle: string
  muted?: boolean
}) {
  return (
    <div className="relative">
      <div
        className={`absolute left-[-27px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-4 border-[#09090b] ${active ? 'bg-[#d4ff3f]' : 'bg-zinc-800'}`}
      />
      <div className="space-y-1">
        <p
          className={`text-[10px] font-black uppercase tracking-widest ${muted ? 'text-zinc-600' : 'text-white'}`}
        >
          {title}
        </p>
        <p
          className={`text-[9px] font-bold uppercase ${muted ? 'text-zinc-800' : 'text-zinc-600'}`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  )
}

function Privilege({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#d4ff3f]" aria-hidden />
      <span className="text-[11px] leading-tight text-zinc-400">{text}</span>
    </li>
  )
}
