import { cn } from "@/lib/utils";

// The mark: an "F" drawn as three feathers — each bar is square on the stem
// side and swept into a quarter-round at its tip. Keep in sync with
// app/icon.svg and app/apple-icon.png.
export function LogoGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M9 7.5h9.5a5.5 5.5 0 0 1 5.5 5.5H9Z" />
      <path d="M9 15h6a4.5 4.5 0 0 1 4.5 4.5H9Z" />
      <path d="M9 21.5h5V22a3 3 0 0 1-3 3H9Z" />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-[10px] bg-primary bg-linear-to-b from-white/20 to-transparent text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.15)]",
        className
      )}
    >
      <LogoGlyph className="size-full" />
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-[-0.02em]">Finch</span>
    </div>
  );
}
