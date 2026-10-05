import { cn } from "@/lib/utils";

// A headline figure above a chart. With `color` it doubles as the series key,
// so the plot needs no separate legend. The value stays in text ink — the dot
// beside the label carries the series identity.
export function ChartStat({
  label,
  value,
  color,
  emphasis = false,
  className,
}: {
  label: string;
  value: string;
  color?: string;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
        {color && (
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </p>
      <p className={cn("mt-0.5 truncate font-semibold", emphasis ? "text-2xl" : "text-lg")}>
        {value}
      </p>
    </div>
  );
}
