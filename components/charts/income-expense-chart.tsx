"use client";

import * as React from "react";
import { subMonths, subQuarters, subYears } from "date-fns";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/shared/empty-state";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { buildCashFlowSeries, CASH_FLOW_BUCKET_LIMIT, type CashFlowGranularity } from "@/lib/calculations/series";
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatters/currency";
import { toISODateRange } from "@/lib/date-range/presets";
import { ChartCard } from "@/components/dashboard/chart-card";
import { ChartStat } from "@/components/dashboard/chart-stat";
import { BarChart3 } from "lucide-react";

const RANGE_BY_GRANULARITY: Record<CashFlowGranularity, (d: Date) => Date> = {
  month: (d) => subMonths(d, 12),
  quarter: (d) => subQuarters(d, 8),
  year: (d) => subYears(d, 5),
};

const chartConfig = {
  income: { label: "Income", color: "var(--income)" },
  expense: { label: "Expenses", color: "var(--expense)" },
  net: { label: "Savings", color: "var(--primary)" },
} satisfies ChartConfig;

export function IncomeExpenseChart() {
  const [granularity, setGranularity] = React.useState<CashFlowGranularity>("month");

  const from = React.useMemo(() => RANGE_BY_GRANULARITY[granularity](new Date()), [granularity]);
  const { data: transactions, isLoading } = useTransactionsForRange({
    from: toISODateRange({ from, to: new Date() }).from,
  });

  const series = React.useMemo(() => {
    const built = buildCashFlowSeries(transactions ?? [], granularity);
    return built.slice(-CASH_FLOW_BUCKET_LIMIT[granularity]);
  }, [transactions, granularity]);

  const hasData = series.some((p) => p.income > 0 || p.expense > 0);
  const totals = React.useMemo(
    () =>
      series.reduce(
        (acc, p) => ({ income: acc.income + p.income, expense: acc.expense + p.expense }),
        { income: 0, expense: 0 }
      ),
    [series]
  );

  return (
    <ChartCard
      title="Income vs Expenses"
      description="Cash flow over time"
      actions={
        <Tabs value={granularity} onValueChange={(v) => setGranularity(v as CashFlowGranularity)}>
          <TabsList>
            <TabsTrigger value="month">Monthly</TabsTrigger>
            <TabsTrigger value="quarter">Quarterly</TabsTrigger>
            <TabsTrigger value="year">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      {isLoading ? (
        <Skeleton className="h-88 w-full" />
      ) : !hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No transactions yet"
          description="Add income and expenses to see your cash flow here."
          className="h-88 py-0"
        />
      ) : (
        <>
          {/* Totals double as the series key, so the plot carries no legend box. */}
          <div className="mb-5 flex flex-wrap gap-x-8 gap-y-3">
            <ChartStat
              label="Savings"
              value={formatCurrency(totals.income - totals.expense)}
              color="var(--primary)"
            />
            <ChartStat label="Income" value={formatCurrency(totals.income)} color="var(--income)" />
            <ChartStat label="Expenses" value={formatCurrency(totals.expense)} color="var(--expense)" />
          </div>

          <ChartContainer config={chartConfig} className="aspect-auto min-h-64 w-full flex-1">
            <ComposedChart
              accessibilityLayer
              data={series}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              barGap={2}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={16}
                tick={{ fontSize: 12 }}
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
                cursor={{ fill: "var(--muted)", radius: 8 }}
                content={<ChartTooltipContent valueFormatter={formatCurrency} />}
              />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
                animationDuration={500}
              />
              <Bar
                dataKey="expense"
                fill="var(--color-expense)"
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
                animationDuration={500}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="var(--color-net)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={{ r: 4, fill: "var(--color-net)", stroke: "var(--card)", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "var(--color-net)", stroke: "var(--card)", strokeWidth: 2 }}
                animationDuration={500}
              />
            </ComposedChart>
          </ChartContainer>
        </>
      )}
    </ChartCard>
  );
}
