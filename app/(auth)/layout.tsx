import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#060714] p-6">
      <div aria-hidden className="auth-backdrop">
        <div className="auth-backdrop-fields" />
        <div className="auth-backdrop-glow" />
        <div className="auth-backdrop-vignette" />
        <div className="auth-backdrop-grain" />
      </div>

      <div className="relative z-10 flex w-full max-w-[26rem] flex-col items-center gap-8">
        <Logo className="[&_span]:text-white" />

        <div className="dark w-full rounded-3xl border border-white/12 bg-white/[0.06] p-7 text-card-foreground shadow-[0_32px_80px_-24px_rgb(0_0_0/0.7)] backdrop-blur-2xl backdrop-saturate-150 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
