import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { IconTile, type IconTileTone } from "@/components/shared/icon-tile";
import { cn } from "@/lib/utils";
import type { TrendResult } from "@/lib/calculations/trends";

export function KpiCard({
  label,
  value,
  icon,
  tone = "primary",
  trend,
  isGoodWhenUp = true,
  comparisonLabel = "vs last period",
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: IconTileTone;
  trend?: TrendResult;
  isGoodWhenUp?: boolean;
  comparisonLabel?: string;
  loading?: boolean;
}) {
  const isGood =
    trend && trend.direction !== "flat" ? (trend.direction === "up") === isGoodWhenUp : null;

  return (
    <div className="surface @container p-5">
      <div className="flex items-center gap-2.5">
        <IconTile icon={icon} tone={tone} size="sm" />
        <p className="text-muted-foreground truncate text-sm font-medium">{label}</p>
      </div>

      {loading ? (
        <Skeleton className="mt-4 h-[2.125rem] w-32" />
      ) : (
        <p
          title={value}
          className="mt-4 truncate text-2xl font-semibold tabular-nums @max-[12.5rem]:text-xl @max-[12.5rem]:leading-[2.125rem]"
        >
          {value}
        </p>
      )}

      {!loading && trend && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-sm">
          {trend.direction === "flat" || trend.percentage === null ? (
            <span className="text-muted-foreground flex items-center gap-1">
              <Minus className="size-4" />
              {trend.percentage === null ? "New this period" : "No change"}
            </span>
          ) : (
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium tabular-nums",
                isGood ? "text-income" : "text-expense"
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUp className="size-4 stroke-2" />
              ) : (
                <ArrowDown className="size-4 stroke-2" />
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
