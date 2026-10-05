"use client";

import * as React from "react";
import { differenceInCalendarDays } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/shared/empty-state";
import { ChartCard } from "@/components/dashboard/chart-card";
import { ChartStat } from "@/components/dashboard/chart-stat";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { useDateRange } from "@/hooks/use-date-range";
import {
  buildSpendingTrendSeries,
  trendGranularityForRangeDays,
  type TrendGranularity,
} from "@/lib/calculations/series";
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatters/currency";
import { toISODateRange } from "@/lib/date-range/presets";

const chartConfig = {
  amount: { label: "Expenses", color: "var(--expense)" },
} satisfies ChartConfig;

const PEAK_LABEL: Record<TrendGranularity, string> = {
  day: "Highest day",
  week: "Highest week",
  month: "Highest month",
};

export function SpendingTrendChart() {
  const fillId = React.useId();
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
  const total = series.reduce((sum, p) => sum + p.amount, 0);
  const peak = series.reduce((max, p) => (p.amount > max.amount ? p : max), series[0]);

  return (
    <ChartCard title="Spending Trend" description="Expenses across the selected period">
      {isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : !hasData ? (
        <EmptyState icon={TrendingUp} title="No expenses in this period" className="h-80 py-0" />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-end gap-x-8 gap-y-3">
            <ChartStat label="Total spent" value={formatCurrency(total)} emphasis />
            <ChartStat
              label={PEAK_LABEL[granularity]}
              value={`${formatCurrency(peak.amount)} · ${peak.label}`}
            />
          </div>

          {/* Absolutely positioned: a percentage height won't resolve against a
              flex item that only has a min-height. */}
          <div className="relative min-h-56 flex-1">
          <ChartContainer config={chartConfig} className="absolute inset-0 aspect-auto h-full w-full">
            <AreaChart
              accessibilityLayer
              data={series}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-amount)" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="var(--color-amount)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={24}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => formatCurrencyCompact(v)}
                width={56}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--input)", strokeWidth: 1 }}
                content={<ChartTooltipContent valueFormatter={formatCurrency} />}
              />
              <Area
                type="monotone"
                dataKey="amount"
                name="Expenses"
                stroke="var(--color-amount)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={`url(#${fillId})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)", fill: "var(--color-amount)" }}
                animationDuration={500}
              />
            </AreaChart>
          </ChartContainer>
          </div>
        </>
      )}
    </ChartCard>
  );
}
