import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react'

import { useMemo, useState } from 'react'

import { useAuth } from '../../context/AuthContext'

import { ApiError } from '../../lib/config'

import { registerSchema } from '../../lib/validations'

export const Route = createFileRoute('/(auth)/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const passwordChecks = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    }),
    [password],
  )
  const strengthScore = Object.values(passwordChecks).filter(Boolean).length
  const strengthLevel =
    strengthScore <= 1 ? 'Weak' : strengthScore <= 3 ? 'Medium' : 'Strong'
  const strengthBars = [0, 1, 2, 3]

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    })
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? 'Data pendaftaran tidak valid',
      )
      return
    }

    setLoading(true)
    try {
      await register(parsed.data.name, parsed.data.email, parsed.data.password)
      await navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="fixed top-0 left-0 z-50 h-1 w-full bg-muted">
        <div className="h-full w-[35%] bg-[#d4ff3f] shadow-[0_0_10px_#d4ff3f]" />
      </div>

      <div className="flex min-h-screen flex-col md:flex-row">
        <section className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white md:flex md:w-5/12 md:flex-col md:justify-center lg:w-1/2 lg:p-24">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#d4ff3f]/10 blur-[120px]" />
            <div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="mb-4 inline-block rounded-full border border-border bg-[rgba(18,18,20,0.8)] px-4 py-2 backdrop-blur-xl">
              <p className="text-[10px] font-black tracking-[0.3em] text-[#d4ff3f] uppercase">
                Premium Access
              </p>
            </div>
            <h1 className="text-6xl leading-[0.9] font-black tracking-tighter uppercase lg:text-8xl">
              Craft Your <br />
              Heritage
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-white/70">
              Join the most exclusive community of luxury horology enthusiasts.
              Gain access to limited drops and private viewing events.
            </p>

            <div className="flex items-center gap-6 pt-8">
              <div className="flex -space-x-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  className="h-12 w-12 rounded-full border-4 border-background"
                  alt="Member"
                />
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anya"
                  className="h-12 w-12 rounded-full border-4 border-background"
                  alt="Member"
                />
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Max"
                  className="h-12 w-12 rounded-full border-4 border-background"
                  alt="Member"
                />
              </div>
              <p className="text-xs font-bold tracking-widest text-white/50 uppercase">
                Joined by 12,000+ members
              </p>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 z-10 flex gap-12 text-[10px] font-black tracking-[0.4em] text-white/45 uppercase lg:left-24">
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Concierge
            </a>
          </div>
        </section>

        <section className="flex flex-1 flex-col items-center justify-center bg-linear-to-b from-muted to-background p-6 md:p-12 lg:p-24">
          <div className="w-full max-w-md space-y-10">
            <div className="flex flex-col items-center space-y-2 md:items-start">
              <h2 className="text-3xl font-black tracking-tight uppercase">
                Create Account
              </h2>
              <p className="text-sm text-muted-foreground">
                Experience the new standard of luxury retail.
              </p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              {error ? (
                <p
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <div className="space-y-2">
                <label
                  htmlFor="register-name"
                  className="px-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-2xl border border-border bg-muted/40 py-4 pr-4 pl-12 text-sm font-medium text-foreground transition-all placeholder:text-muted-foreground focus:border-[#d4ff3f] focus:bg-muted focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="register-email"
                  className="px-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder="name@luxury.com"
                    className="w-full rounded-2xl border border-border bg-muted/40 py-4 pr-4 pl-12 text-sm font-medium text-foreground transition-all placeholder:text-muted-foreground focus:border-[#d4ff3f] focus:bg-muted focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="register-password"
                  className="px-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                >
                  Password
                </label>
                <div className="relative mb-3">
                  <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-border bg-muted/40 py-4 pr-12 pl-12 text-sm font-medium text-foreground transition-all placeholder:text-muted-foreground focus:border-[#d4ff3f] focus:bg-muted focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex gap-1.5 px-1">
                  {strengthBars.map((barIndex) => (
                    <div
                      key={barIndex}
                      className={`h-1 flex-1 rounded ${
                        barIndex < strengthScore ? 'bg-[#d4ff3f]' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between px-1">
                  <p className="text-[9px] font-black tracking-widest text-[#d4ff3f] uppercase">
                    {strengthLevel} Strength
                  </p>
                  <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                    8+ chars, upper/lowercase, number
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="register-confirm"
                  className="px-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="register-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(ev) => setConfirmPassword(ev.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-border bg-muted/40 py-4 pr-4 pl-12 text-sm font-medium text-foreground transition-all placeholder:text-muted-foreground focus:border-[#d4ff3f] focus:bg-muted focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? 'Sembunyikan konfirmasi password'
                        : 'Tampilkan konfirmasi password'
                    }
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 px-1 py-2">
                <label className="relative mt-0.5 flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="flex h-5 w-5 items-center justify-center rounded border border-border bg-muted transition-all peer-checked:border-[#d4ff3f] peer-checked:bg-[#d4ff3f]">
                    <Check className="h-3 w-3 scale-0 text-black transition-transform peer-checked:scale-100" />
                  </div>
                </label>
                <p className="text-xs leading-tight text-muted-foreground">
                  I agree to the{' '}
                  <a
                    href="#"
                    className="font-bold text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-[#d4ff3f]"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="#"
                    className="font-bold text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-[#d4ff3f]"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-5 text-xs font-black tracking-widest text-black uppercase transition-all hover:bg-[#d4ff3f] hover:shadow-[0_0_20px_rgba(212,255,63,0.3)] disabled:opacity-60"
              >
                <span>{loading ? 'Memproses…' : 'Initialize Membership'}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="space-y-6 pt-4 text-center">
              <p className="text-xs font-bold text-muted-foreground">
                Already a member?{' '}
                <Link
                  to="/login"
                  className="text-[#d4ff3f] underline-offset-4 hover:underline"
                >
                  Sign In
                </Link>
              </p>

              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[9px] font-black tracking-widest uppercase">
                  Social Access
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="rounded-2xl border border-border bg-card/90 py-4 text-xs font-bold text-muted-foreground transition-all hover:text-foreground"
                >
                  Google
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-border bg-card/90 py-4 text-xs font-bold text-muted-foreground transition-all hover:text-foreground"
                >
                  Apple ID
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
