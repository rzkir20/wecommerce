import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import { ArrowLeft, ShieldCheck } from 'lucide-react'

import { useEffect, useRef, useState } from 'react'

import { z } from 'zod'

import { ApiError } from '#/lib/config'

import {
  PWD_RESET_EMAIL_KEY,
  PWD_RESET_TOKEN_KEY,
} from '#/lib/password-reset-keys'

import {
  requestForgotPassword,
  verifyForgotPasswordOtp,
} from '#/service/auth.service'

const verificationsSearchSchema = z.object({
  email: z.string().optional().default(''),
  flow: z.string().optional().default(''),
})

export const Route = createFileRoute('/(auth)/verifications')({
  validateSearch: (search) => verificationsSearchSchema.parse(search),
  component: VerificationPage,
})

const RESEND_COOLDOWN_SEC = 60

function VerificationPage() {
  const navigate = useNavigate()
  const { email: emailParam, flow } = Route.useSearch()
  const [parts, setParts] = useState<string[]>(() => Array(6).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const email = emailParam.trim()

  useEffect(() => {
    if (flow !== 'forgot-password' || !email) {
      void navigate({ to: '/forget-password', replace: true })
    }
  }, [flow, email, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [cooldown])

  const otp = parts.join('')

  function setDigit(index: number, raw: string) {
    const d = raw.replace(/\D/g, '').slice(-1)
    setParts((prev) => {
      const next = [...prev]
      next[index] = d
      return next
    })
    if (d && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function onKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !parts[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const next = text.split('')
    while (next.length < 6) next.push('')
    setParts(next)
    const lastIdx = Math.min(text.length, 5)
    inputRefs.current[lastIdx]?.focus()
  }

  async function onVerify() {
    setError(null)
    if (otp.length !== 6) {
      setError('Masukkan 6 digit kode dari email.')
      return
    }

    setLoading(true)
    try {
      const res = await verifyForgotPasswordOtp(email, otp)
      sessionStorage.setItem(PWD_RESET_EMAIL_KEY, email)
      sessionStorage.setItem(PWD_RESET_TOKEN_KEY, res.resetToken)
      void navigate({ to: '/change-password', replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Verifikasi gagal. Coba lagi.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function onResend() {
    if (cooldown > 0 || resendLoading) return
    setError(null)
    setResendLoading(true)
    try {
      await requestForgotPassword(email)
      setCooldown(RESEND_COOLDOWN_SEC)
      setParts(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Gagal mengirim ulang kode.',
      )
    } finally {
      setResendLoading(false)
    }
  }

  if (flow !== 'forgot-password' || !email) {
    return null
  }

  const mm = String(Math.floor(cooldown / 60)).padStart(2, '0')
  const ss = String(cooldown % 60).padStart(2, '0')

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground">
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#d4ff3f]/10 blur-[120px]" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-[#d4ff3f]/5 blur-[150px]" />

      <div className="relative z-10 w-full max-w-2xl p-6">
        <div className="rounded-[3rem] border border-border bg-card/90 p-10 text-center text-card-foreground backdrop-blur-2xl md:p-12">
          <div className="mb-8 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#d4ff3f]/20 bg-[#d4ff3f]/10">
              <ShieldCheck className="h-10 w-10 text-[#d4ff3f]" />
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-black tracking-tight uppercase md:text-4xl">
            Verifikasi kode
          </h1>
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            Kode 6 digit telah dikirim ke{' '}
            <span className="font-semibold text-foreground">{email}</span>.
            Masukkan kode untuk melanjutkan reset password.
          </p>

          {error ? (
            <p
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400"
              role="alert"
            >
              {error}
            </p>
          ) : (
            <div className="mb-8" />
          )}

          <div
            className="mb-8 flex justify-between gap-2 md:gap-3"
            onPaste={onPaste}
          >
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${idx + 1}`}
                value={parts[idx] ?? ''}
                onChange={(e) => setDigit(idx, e.target.value)}
                onKeyDown={(e) => onKeyDown(idx, e)}
                className="h-16 w-10 rounded-2xl border border-border bg-muted/50 text-center text-2xl font-black text-foreground transition-all focus:border-[#d4ff3f] focus:shadow-[0_0_15px_rgba(212,255,63,0.2)] focus:outline-none md:h-20 md:w-14"
              />
            ))}
          </div>

          <div className="space-y-6">
            <button
              type="button"
              onClick={() => void onVerify()}
              disabled={loading}
              className="w-full rounded-2xl bg-white py-5 text-xs font-black tracking-widest text-black uppercase transition-all duration-300 hover:bg-[#d4ff3f] hover:shadow-[0_0_20px_rgba(212,255,63,0.15)] disabled:opacity-60"
            >
              {loading ? 'Memverifikasi…' : 'Lanjutkan'}
            </button>

            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Tidak menerima kode?
              </p>
              <button
                type="button"
                disabled={cooldown > 0 || resendLoading}
                onClick={() => void onResend()}
                className="group flex items-center gap-2 text-xs font-black text-foreground transition-colors hover:text-[#d4ff3f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Kirim ulang ke email</span>
                {cooldown > 0 ? (
                  <span className="font-mono text-muted-foreground">
                    ({mm}:{ss})
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <Link
              to="/forget-password"
              className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Ubah email
            </Link>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8">
          <span className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">
            LUXE HERITAGE
          </span>
          <span className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">
            EST. 1924
          </span>
        </div>
      </div>
    </div>
  )
}
