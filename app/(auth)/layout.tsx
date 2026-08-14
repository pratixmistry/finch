import Image from "next/image";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-6">
      <Image
        src="/auth-illustration-v2.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">
        <Logo className="[&_span]:text-white" />

        <div className="dark w-full rounded-2xl border border-white/15 bg-card/75 p-8 text-card-foreground shadow-2xl backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
