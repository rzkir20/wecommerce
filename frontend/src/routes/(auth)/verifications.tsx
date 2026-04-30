import { createFileRoute } from '@tanstack/react-router'

import { ArrowLeft, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/(auth)/verifications')({
  component: VerificationPage,
})

function VerificationPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground">
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#d4ff3f]/10 blur-[120px]" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-[#d4ff3f]/5 blur-[150px]" />

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="rounded-[3rem] border border-border bg-card/90 p-10 text-center text-card-foreground backdrop-blur-2xl md:p-12">
          <div className="mb-8 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#d4ff3f]/20 bg-[#d4ff3f]/10">
              <ShieldCheck className="h-10 w-10 text-[#d4ff3f]" />
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-black tracking-tight uppercase md:text-4xl">
            Verify Your Email
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            A 6-digit verification code has been sent to your registered email
            address. Please enter it below to secure your account.
          </p>

          <div className="mb-8 flex justify-between gap-3">
            {[...Array(6)].map((_, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                className="h-16 w-12 rounded-2xl border border-border bg-muted/50 text-center text-2xl font-black text-foreground transition-all focus:border-[#d4ff3f] focus:shadow-[0_0_15px_rgba(212,255,63,0.2)] focus:outline-none md:h-20 md:w-14"
              />
            ))}
          </div>

          <div className="space-y-6">
            <button
              type="button"
              className="w-full rounded-2xl bg-white py-5 text-xs font-black tracking-widest text-black uppercase transition-all duration-300 hover:bg-[#d4ff3f] hover:shadow-[0_0_20px_rgba(212,255,63,0.15)]"
            >
              Verify Account
            </button>

            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Didn't receive the code?
              </p>
              <button
                type="button"
                className="group flex items-center gap-2 text-xs font-black text-white transition-colors hover:text-[#d4ff3f]"
              >
                <span>Resend via Email</span>
                <span className="font-mono text-muted-foreground transition-colors group-hover:text-[#d4ff3f]">
                  (02:45)
                </span>
              </button>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <a
              href="/login"
              className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </a>
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
