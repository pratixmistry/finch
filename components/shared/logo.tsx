import { Wallet2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className
      )}
    >
      <Wallet2 className="size-4.5" strokeWidth={2.25} />
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-base font-semibold tracking-tight">Finch</span>
    </div>
  );
}
