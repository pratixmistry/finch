import Image from "next/image";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#0b1030] p-6">
      {/* The scene sits in the lower half of the artwork, so anchor it to the
          bottom and let the open night sky sit behind the form. */}
      <Image
        src="/auth-ruins-at-dusk.webp"
        alt=""
        fill
        priority
        unoptimized
        className="object-cover object-bottom"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#0b1030]/50 via-[#0b1030]/10 to-[#0b1030]/35" />

      <div className="relative z-10 flex w-full max-w-[26rem] flex-col items-center gap-8">
        <Logo className="[&_span]:text-white" />

        <div className="dark w-full rounded-3xl border border-white/15 bg-[#12173a]/55 p-7 text-card-foreground shadow-[0_32px_80px_-24px_rgb(0_0_0/0.7)] backdrop-blur-2xl backdrop-saturate-150 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
