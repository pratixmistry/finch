"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Cell, Pie, PieChart } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/shared/empty-state";
import { ChartCard } from "@/components/dashboard/chart-card";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { useDateRange } from "@/hooks/use-date-range";
import { expenseBreakdownByCategory } from "@/lib/calculations/transactions";
import { formatCurrency } from "@/lib/formatters/currency";
import { toISODateRange } from "@/lib/date-range/presets";

const MAX_SLICES = 6;
const OTHER_COLOR = "var(--muted-foreground)";

export function ExpenseDonutChart() {
  const router = useRouter();
  const { range } = useDateRange();
  const filters = React.useMemo(() => toISODateRange(range), [range]);
  const { data: transactions, isLoading } = useTransactionsForRange(filters);

  const breakdown = React.useMemo(() => {
    const full = expenseBreakdownByCategory(transactions ?? []);
    if (full.length <= MAX_SLICES) return full;
    const top = full.slice(0, MAX_SLICES - 1);
    const rest = full.slice(MAX_SLICES - 1);
    const otherTotal = rest.reduce((sum, e) => sum + e.total, 0);
    const otherPct = rest.reduce((sum, e) => sum + e.percentage, 0);
    return [
      ...top,
      {
        categoryId: "other",
        name: "Other",
        color: OTHER_COLOR,
        icon: "circle",
        total: otherTotal,
        percentage: otherPct,
      },
    ];
  }, [transactions]);

  const chartConfig = React.useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    for (const entry of breakdown) {
      config[entry.categoryId] = { label: entry.name, color: entry.color };
    }
    return config;
  }, [breakdown]);

  const total = breakdown.reduce((sum, e) => sum + e.total, 0);

  return (
    <ChartCard title="Expense Breakdown" description="By category, selected period">
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : breakdown.length === 0 ? (
        <EmptyState
          icon={PieChartIcon}
          title="No expenses in this period"
          className="h-64 justify-center border-none py-0"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative h-52 w-52 shrink-0">
            <ChartContainer config={chartConfig} className="aspect-square h-full w-full">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="var(--card)"
                  onClick={(entry) => {
                    const categoryId = (entry as unknown as { categoryId: string }).categoryId;
                    if (categoryId !== "other") {
                      router.push(`/transactions?category=${categoryId}`);
                    }
                  }}
                  cursor="pointer"
                >
                  {breakdown.map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(_value, _name, item) => {
                        const entry = item.payload as (typeof breakdown)[number];
                        return (
                          <div className="flex w-full items-center gap-2">
                            <span
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground flex-1">{entry.name}</span>
                            <span className="font-medium tabular-nums">
                              {formatCurrency(entry.total)} · {entry.percentage.toFixed(1)}%
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-[11px]">Total</p>
              <p className="text-sm font-semibold tabular-nums">{formatCurrency(total)}</p>
            </div>
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-1.5">
            {breakdown.map((entry) => (
              <li key={entry.categoryId}>
                <button
                  type="button"
                  disabled={entry.categoryId === "other"}
                  onClick={() => router.push(`/transactions?category=${entry.categoryId}`)}
                  className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {entry.percentage.toFixed(0)}%
                  </span>
                  <span className="w-20 shrink-0 text-right font-medium tabular-nums">
                    {formatCurrency(entry.total)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
