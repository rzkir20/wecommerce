import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import { ArrowRight, Check, Diamond, Eye, Lock, Mail } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../lib/api'

export const Route = createFileRoute('/(auth)/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim(), password)
      await navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-stretch overflow-hidden bg-background text-foreground">
      <section className="relative hidden overflow-hidden bg-black lg:flex lg:w-[60%]">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,255,63,0.15)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(212,255,63,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2000&auto=format&fit=crop"
            alt="Luxury watch"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative z-10 flex w-full flex-col justify-between p-20 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4ff3f]">
              <Diamond className="h-6 w-6 text-black" />
            </div>
            <span className="text-4xl font-black tracking-tighter">LUXE</span>
          </div>

          <div className="max-w-xl">
            <h1 className="mb-8 text-6xl leading-[0.9] font-black tracking-tighter xl:text-8xl">
              Timeless <br />
              Luxury, <br />
              <span className="text-[#d4ff3f]">Modern</span> Design
            </h1>
            <p className="max-w-md text-lg leading-relaxed font-medium text-zinc-400">
              Join the elite circle of enthusiasts and collectors. Experience
              unparalleled craftsmanship and exclusive heritage collections.
            </p>
          </div>

          <div className="flex items-center gap-12 text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">
            <span>Est. 1994</span>
            <div className="h-px w-12 bg-zinc-800" />
            <span>Premium Horology</span>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col items-center justify-center bg-background p-8 md:p-16 lg:w-[40%] lg:p-24">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight uppercase">
              Sign In
            </h2>
            <p className="font-medium text-muted-foreground">
              Welcome back to your curated selection.
            </p>
          </div>

          <form className="space-y-8" onSubmit={onSubmit}>
            {error ? (
              <p
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                >
                  Email Address
                </label>
                <div className="group relative">
                  <div className="absolute inset-y-0 left-5 flex items-center text-muted-foreground transition-colors group-focus-within:text-[#d4ff3f]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder="name@luxe.com"
                    className="w-full rounded-2xl border border-border bg-muted py-5 pr-6 pl-14 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:border-[#d4ff3f] focus:ring-1 focus:ring-[#d4ff3f] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-[10px] font-black tracking-widest text-[#d4ff3f] uppercase hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="group relative">
                  <div className="absolute inset-y-0 left-5 flex items-center text-muted-foreground transition-colors group-focus-within:text-[#d4ff3f]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-border bg-muted py-5 pr-14 pl-14 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:border-[#d4ff3f] focus:ring-1 focus:ring-[#d4ff3f] focus:outline-none"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-5 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <label className="ml-1 flex cursor-pointer items-center gap-3">
              <input type="checkbox" className="peer sr-only" />
              <div className="flex h-5 w-5 items-center justify-center rounded border border-border bg-muted transition-all peer-checked:border-[#d4ff3f] peer-checked:bg-[#d4ff3f]">
                <Check className="h-3 w-3 text-black opacity-0 peer-checked:opacity-100" />
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                Keep me signed in
              </span>
            </label>

            <div className="space-y-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#d4ff3f] py-5 text-xs font-black tracking-widest text-black uppercase transition-all duration-300 hover:bg-[#e5ff80] hover:shadow-[0_0_35px_rgba(212,255,63,0.4)] disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-3">
                  {loading ? 'Memproses…' : 'Sign In to LUXE'}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Or continue with
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="rounded-xl border border-border bg-muted py-4 text-[10px] font-black tracking-widest uppercase transition-colors hover:bg-muted/80"
                >
                  Google
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-border bg-muted py-4 text-[10px] font-black tracking-widest uppercase transition-colors hover:bg-muted/80"
                >
                  Apple
                </button>
              </div>
            </div>
          </form>

          <p className="pt-8 text-center text-xs font-bold text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#d4ff3f] hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
