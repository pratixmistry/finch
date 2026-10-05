import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconTileTone = "neutral" | "primary" | "income" | "expense" | "investment" | "transfer";

const TONE: Record<IconTileTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary dark:bg-primary/20",
  income: "bg-income/10 text-income dark:bg-income/20",
  expense: "bg-expense/10 text-expense dark:bg-expense/20",
  investment: "bg-investment/10 text-investment dark:bg-investment/25",
  transfer: "bg-transfer/10 text-transfer dark:bg-transfer/20",
};

// sm is the 28px list icon; md and lg are for card headers and hero rows.
const SIZE = {
  sm: "size-7 rounded-[8px] [&>svg]:size-4",
  md: "size-9 rounded-[10px] [&>svg]:size-5",
  lg: "size-11 rounded-[12px] [&>svg]:size-6",
  xl: "size-14 rounded-[16px] [&>svg]:size-7",
} as const;

// The one container every leading icon sits in. Pass `tone` for semantic
// colors, or `color` for a user-chosen (category) hex.
export function IconTile({
  icon: Icon,
  children,
  tone = "neutral",
  color,
  size = "md",
  className,
}: {
  icon?: LucideIcon;
  children?: React.ReactNode;
  tone?: IconTileTone;
  color?: string;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center",
        SIZE[size],
        !color && TONE[tone],
        className
      )}
      style={
        color
          ? { backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`, color }
          : undefined
      }
    >
      {Icon ? <Icon /> : children}
    </div>
  );
}
