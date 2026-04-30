import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle, Circle, EyeOff, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/(auth)/change-password')({
  component: ChangePasswordPage,
})

function ChangePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-[radial-gradient(circle_at_70%_30%,rgba(212,255,63,0.08)_0%,transparent_50%),radial-gradient(circle_at_10%_90%,rgba(212,255,63,0.03)_0%,transparent_40%)] p-8 pt-32 text-foreground md:pt-40 lg:p-12 lg:pt-40">
      <div className="w-full max-w-xl">
        <div className="mb-12">
          <a
            href="#"
            className="group mb-8 inline-flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Security Settings
          </a>
          <h1 className="mb-4 text-4xl leading-none font-black tracking-tight uppercase md:text-5xl">
            Protect Your <br />
            <span className="text-[#d4ff3f]">Heritage.</span>
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Update your password regularly to maintain the security of your LUXE account and
            private collections.
          </p>
        </div>

        <div className="glass-panel rounded-[2.5rem] p-10">
          <form className="space-y-8">
            <div className="space-y-3">
              <label className="ml-1 block text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                Current Security Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-border bg-muted/50 px-6 py-4 text-sm text-foreground transition-all focus:bg-muted"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <EyeOff className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="ml-1 block text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                New Security Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-border bg-muted/50 px-6 py-4 text-sm text-foreground transition-all focus:bg-muted"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <EyeOff className="h-5 w-5" />
                </button>
              </div>

              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                    Security Strength
                  </span>
                  <span className="text-[9px] font-black tracking-widest text-orange-400 uppercase">
                    Moderate
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted">
                  <div className="h-full w-[60%] rounded-full bg-orange-400" />
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-muted/40 p-5">
              <p className="mb-1 text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                Requirements checklist
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#d4ff3f]" />
                  <span className="text-[11px] text-foreground/80">At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#d4ff3f]" />
                  <span className="text-[11px] text-foreground/80">One uppercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-muted-foreground/60" />
                  <span className="text-[11px] text-muted-foreground">One numeric digit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-muted-foreground/60" />
                  <span className="text-[11px] text-muted-foreground">One special character</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="ml-1 block text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                Verify New Security Key
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full rounded-2xl border border-border bg-muted/50 px-6 py-4 text-sm text-foreground transition-all focus:bg-muted"
              />
            </div>

            <div className="space-y-4 pt-4">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-5 text-[11px] font-black tracking-widest text-black uppercase transition-all duration-300 hover:bg-[#d4ff3f] hover:shadow-[0_0_25px_rgba(212,255,63,0.3)]"
              >
                Confirm Password Change
                <ShieldCheck className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="w-full py-2 text-[9px] font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                Cancel & Keep Original
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
