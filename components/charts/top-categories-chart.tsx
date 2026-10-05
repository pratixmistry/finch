"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { IconTile } from "@/components/shared/icon-tile";
import { CategoryIcon } from "@/components/categories/category-icon";
import { ChartCard } from "@/components/dashboard/chart-card";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { useDateRange } from "@/hooks/use-date-range";
import { expenseBreakdownByCategory } from "@/lib/calculations/transactions";
import { formatCurrency } from "@/lib/formatters/currency";
import { toISODateRange } from "@/lib/date-range/presets";

const TOP_N = 6;

// A ranked bar list rather than a plotted chart: every bar is directly labeled
// with its category and amount, so nothing depends on hover or an axis.
export function TopCategoriesChart() {
  const { range } = useDateRange();
  const filters = React.useMemo(() => toISODateRange(range), [range]);
  const { data: transactions, isLoading } = useTransactionsForRange(filters);

  const top = React.useMemo(
    () => expenseBreakdownByCategory(transactions ?? []).slice(0, TOP_N),
    [transactions]
  );
  const max = top[0]?.total ?? 0;

  return (
    <ChartCard title="Top Spending Categories" description="Largest categories, selected period">
      {isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : top.length === 0 ? (
        <EmptyState icon={BarChart3} title="No expenses in this period" className="h-80 py-0" />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {top.map((entry) => {
            const content = (
              <>
                <IconTile color={entry.color} size="sm">
                  <CategoryIcon name={entry.icon} />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-base font-medium">{entry.name}</span>
                    <span className="shrink-0 text-base font-medium tabular-nums">
                      {formatCurrency(entry.total)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-[width] duration-500 ease-out"
                        style={{
                          width: `${max > 0 ? Math.max(2, (entry.total / max) * 100) : 0}%`,
                          backgroundColor: entry.color,
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground w-10 shrink-0 text-right text-sm tabular-nums">
                      {entry.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </>
            );

            return (
              <li key={entry.categoryId}>
                {entry.categoryId === "uncategorized" ? (
                  <div className="flex items-center gap-3 px-2 py-3">{content}</div>
                ) : (
                  <Link
                    href={`/transactions?category=${entry.categoryId}`}
                    className="group/row hover:bg-foreground/[0.03] focus-visible:ring-ring flex items-center gap-3 rounded-xl px-2 py-3 transition-colors duration-150 outline-none focus-visible:ring-4"
                  >
                    {content}
                    <ChevronRight className="text-muted-foreground/50 group-hover/row:text-muted-foreground size-4 shrink-0 transition-colors" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </ChartCard>
  );
}
