import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'

import { ApiError } from '#/lib/config'

import {
  PWD_RESET_EMAIL_KEY,
  PWD_RESET_TOKEN_KEY,
} from '#/lib/password-reset-keys'

import { resetPasswordSchema } from '#/lib/validations'

import { resetForgottenPassword } from '#/service/auth.service'

export const Route = createFileRoute('/(auth)/change-password')({
  component: ChangePasswordPage,
})

function ChangePasswordPage() {
  const navigate = useNavigate()
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [returnEmail, setReturnEmail] = useState('')

  useEffect(() => {
    setReturnEmail(sessionStorage.getItem(PWD_RESET_EMAIL_KEY) ?? '')
  }, [])

  useEffect(() => {
    const token = sessionStorage.getItem(PWD_RESET_TOKEN_KEY)
    if (!token) {
      void navigate({ to: '/forget-password', replace: true })
      return
    }
    setResetToken(token)
  }, [navigate])

  const passwordChecks = useMemo(
    () => ({
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
    }),
    [newPassword],
  )

  const strengthScore = Object.values(passwordChecks).filter(Boolean).length
  const strengthLevel =
    strengthScore <= 1 ? 'Weak' : strengthScore <= 3 ? 'Medium' : 'Strong'
  const strengthColor =
    strengthScore <= 1
      ? 'bg-red-400'
      : strengthScore <= 3
        ? 'bg-orange-400'
        : 'bg-[#d4ff3f]'
  const strengthWidth = `${(strengthScore / 4) * 100}%`

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const token = resetToken ?? sessionStorage.getItem(PWD_RESET_TOKEN_KEY)
    if (!token) {
      void navigate({ to: '/forget-password', replace: true })
      return
    }

    const parsed = resetPasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Data tidak valid')
      return
    }

    setLoading(true)
    try {
      await resetForgottenPassword({
        resetToken: token,
        newPassword: parsed.data.newPassword,
        confirmPassword: parsed.data.confirmPassword,
      })
      sessionStorage.removeItem(PWD_RESET_TOKEN_KEY)
      sessionStorage.removeItem(PWD_RESET_EMAIL_KEY)
      setSuccess('Password berhasil diubah. Silakan masuk dengan password baru.')
      setNewPassword('')
      setConfirmPassword('')
      setResetToken(null)
      window.setTimeout(() => {
        void navigate({ to: '/login', replace: true })
      }, 2000)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Gagal mengubah password.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (!resetToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Memuat…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-[radial-gradient(circle_at_70%_30%,rgba(212,255,63,0.08)_0%,transparent_50%),radial-gradient(circle_at_10%_90%,rgba(212,255,63,0.03)_0%,transparent_40%)] py-4 text-foreground">
      <div className="w-full max-w-xl px-4">
        <div className="mb-12">
          {returnEmail ? (
            <Link
              to="/verifications"
              search={{ email: returnEmail, flow: 'forgot-password' }}
              className="group mb-8 inline-flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Kembali ke verifikasi
            </Link>
          ) : (
            <Link
              to="/forget-password"
              className="group mb-8 inline-flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Mulai dari awal
            </Link>
          )}
          <h1 className="mb-4 text-4xl leading-none font-black tracking-tight uppercase md:text-5xl">
            Password <br />
            <span className="text-[#d4ff3f]">Baru.</span>
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Setelah OTP terverifikasi, tetapkan password baru yang kuat untuk
            akun LUXE Anda.
          </p>
        </div>

        <div className="glass-panel rounded-[2.5rem] p-10">
          <form className="space-y-8" onSubmit={onSubmit}>
            {error ? (
              <p
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {success ? (
              <p
                className="rounded-xl border border-[#d4ff3f]/30 bg-[#d4ff3f]/10 px-4 py-3 text-sm text-foreground"
                role="status"
              >
                {success}
              </p>
            ) : null}

            <div className="space-y-3">
              <label className="ml-1 block text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                New Security Key
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(ev) => setNewPassword(ev.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-border bg-muted/50 px-6 py-4 pr-14 text-sm text-foreground transition-all focus:bg-muted focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showNew ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showNew ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                    Security Strength
                  </span>
                  <span
                    className={`text-[9px] font-black tracking-widest uppercase ${
                      strengthScore <= 1
                        ? 'text-red-400'
                        : strengthScore <= 3
                          ? 'text-orange-400'
                          : 'text-[#d4ff3f]'
                    }`}
                  >
                    {strengthLevel}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${strengthColor}`}
                    style={{ width: strengthWidth }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-muted/40 p-5">
              <p className="mb-1 text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                Requirements checklist
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  {passwordChecks.minLength ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#d4ff3f]" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  )}
                  <span className="text-[11px] text-foreground/80">
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordChecks.hasUpper ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#d4ff3f]" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  )}
                  <span className="text-[11px] text-foreground/80">
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordChecks.hasLower ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#d4ff3f]" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  )}
                  <span className="text-[11px] text-foreground/80">
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordChecks.hasNumber ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#d4ff3f]" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  )}
                  <span className="text-[11px] text-foreground/80">
                    One numeric digit
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="ml-1 block text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                Verify New Security Key
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(ev) => setConfirmPassword(ev.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-border bg-muted/50 px-6 py-4 pr-14 text-sm text-foreground transition-all focus:bg-muted focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showConfirm ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-5 text-[11px] font-black tracking-widest text-black uppercase transition-all duration-300 hover:bg-[#d4ff3f] hover:shadow-[0_0_25px_rgba(212,255,63,0.3)] disabled:opacity-60"
              >
                {loading ? 'Memproses…' : 'Simpan password baru'}
                <ShieldCheck className="h-5 w-5" />
              </button>
              <Link
                to="/login"
                className="block w-full py-2 text-center text-[9px] font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                Batal — ke Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
