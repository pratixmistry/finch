import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TrendResult } from "@/lib/calculations/trends";

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  trend,
  isGoodWhenUp = true,
  comparisonLabel = "vs last period",
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: TrendResult;
  isGoodWhenUp?: boolean;
  comparisonLabel?: string;
  loading?: boolean;
}) {
  const isGood =
    trend && trend.direction !== "flat" ? (trend.direction === "up") === isGoodWhenUp : null;

  return (
    <div className="bg-card rounded-xl p-4 shadow-xs ring-1 ring-foreground/10 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <div className={cn("flex size-8 items-center justify-center rounded-lg", iconClassName)}>
          <Icon className="size-4" strokeWidth={2} />
        </div>
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-8 w-28" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      )}

      {!loading && trend && (
        <div className="mt-1.5 flex items-center gap-1 text-xs">
          {trend.direction === "flat" || trend.percentage === null ? (
            <span className="text-muted-foreground flex items-center gap-1">
              <Minus className="size-3" />
              {trend.percentage === null ? "New this period" : "No change"}
            </span>
          ) : (
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                isGood ? "text-income" : "text-expense"
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
              {Math.abs(trend.percentage).toFixed(1)}%
            </span>
          )}
          <span className="text-muted-foreground">{comparisonLabel}</span>
        </div>
      )}
    </div>
  );
}
