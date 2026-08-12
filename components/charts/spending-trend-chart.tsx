"use client";

import * as React from "react";
import { differenceInCalendarDays } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ChartCard } from "@/components/dashboard/chart-card";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { useDateRange } from "@/hooks/use-date-range";
import { buildSpendingTrendSeries, trendGranularityForRangeDays } from "@/lib/calculations/series";
import { formatCurrencyCompact } from "@/lib/formatters/currency";
import { toISODateRange } from "@/lib/date-range/presets";
import { ChartTooltip } from "./chart-tooltip";

export function SpendingTrendChart() {
  const { range } = useDateRange();
  const filters = React.useMemo(() => toISODateRange(range), [range]);
  const { data: transactions, isLoading } = useTransactionsForRange(filters);

  const granularity = trendGranularityForRangeDays(
    differenceInCalendarDays(range.to, range.from) + 1
  );

  const series = React.useMemo(
    () => buildSpendingTrendSeries(transactions ?? [], granularity),
    [transactions, granularity]
  );

  const hasData = series.some((p) => p.amount > 0);

  return (
    <ChartCard title="Spending Trend" description="Expenses across the selected period">
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !hasData ? (
        <EmptyState
          icon={TrendingUp}
          title="No expenses in this period"
          className="h-64 justify-center border-none py-0"
        />
      ) : (
        <ResponsiveContainer width="100%" height={256}>
          <AreaChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--expense)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--expense)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => formatCurrencyCompact(v)}
              width={56}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
            <Area
              type="monotone"
              dataKey="amount"
              name="Expenses"
              stroke="var(--expense)"
              strokeWidth={2}
              fill="url(#spendingFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)", fill: "var(--expense)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
