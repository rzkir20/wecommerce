import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import { ArrowLeft, Info, Mail, Send } from 'lucide-react'

import { useState } from 'react'

import { ApiError } from '#/lib/config'

import { forgotPasswordEmailSchema } from '#/lib/validations'

import { requestForgotPassword } from '#/service/auth.service'

export const Route = createFileRoute('/(auth)/forget-password')({
  component: ForgetPasswordPage,
})

function ForgetPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = forgotPasswordEmailSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Email tidak valid')
      return
    }

    setLoading(true)
    try {
      await requestForgotPassword(parsed.data.email)
      await navigate({
        to: '/verifications',
        search: { email: parsed.data.email, flow: 'forgot-password' },
      })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Gagal mengirim kode verifikasi.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground md:flex-row">
      <section className="relative hidden h-screen overflow-hidden md:flex md:w-1/2 lg:w-[55%]">
        <img
          src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1920&auto=format&fit=crop"
          alt="Luxury watch craftsmanship"
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-tr from-background via-background/40 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between p-16 text-white">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">LUXE</h1>
          </div>

          <div className="max-w-md">
            <p className="mb-4 text-[10px] font-black tracking-[0.4em] text-[#d4ff3f] uppercase">
              Heritage Excellence
            </p>
            <h2 className="mb-6 text-5xl leading-none font-black tracking-tight">
              Precision in Every <br />
              Moment.
            </h2>
            <p className="text-sm leading-relaxed text-white/75">
              Secure your account and return to the world of fine horology. Your
              collection awaits your return.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
              © 2024 LUXE INTERNATIONALE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>

        <div className="absolute top-1/2 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4ff3f]/10 blur-[100px]" />
      </section>

      <section className="relative flex flex-1 items-center justify-center bg-background p-8 md:p-16 lg:p-24">
        <div className="absolute top-8 left-8 md:hidden">
          <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase">
            LUXE
          </h1>
        </div>

        <div className="w-full max-w-md space-y-10">
          <div className="space-y-3">
            <h3 className="text-4xl font-black tracking-tight text-foreground">
              Forgot Password
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Masukkan email terdaftar. Kami mengirimkan kode OTP 6 digit untuk
              verifikasi, lalu Anda dapat mengatur password baru.
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
              <div className="group space-y-2">
                <label
                  htmlFor="email"
                  className="text-[10px] font-black tracking-widest text-muted-foreground uppercase transition-colors group-focus-within:text-[#d4ff3f]"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-5 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-[#d4ff3f]" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder="name@luxury.com"
                    className="w-full rounded-2xl border border-border bg-muted/50 py-4 pr-6 pl-14 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-[#d4ff3f]/30 focus:ring-1 focus:ring-[#d4ff3f]/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4">
                <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-[11px] leading-normal text-muted-foreground">
                  Langkah berikutnya: halaman verifikasi kode, lalu atur password
                  baru. Kode berlaku sekitar 10 menit.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-5 text-xs font-black tracking-widest text-black uppercase transition-all duration-300 active:scale-[0.98] hover:bg-[#d4ff3f] hover:shadow-[0_0_25px_rgba(212,255,63,0.15)] disabled:opacity-60"
              >
                <span>{loading ? 'Mengirim…' : 'Kirim kode OTP'}</span>
                <Send className="h-4 w-4" />
              </button>

              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase transition-all hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>

          <div className="flex justify-center gap-6 border-t border-border pt-8">
            <a
              href="#"
              className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Support
            </a>
            <a
              href="#"
              className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Terms
            </a>
          </div>
        </div>

        <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#d4ff3f]/5 blur-[100px]" />
      </section>
    </div>
  )
}
