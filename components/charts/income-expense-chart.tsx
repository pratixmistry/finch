"use client";

import * as React from "react";
import { subMonths, subQuarters, subYears } from "date-fns";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { buildCashFlowSeries, CASH_FLOW_BUCKET_LIMIT, type CashFlowGranularity } from "@/lib/calculations/series";
import { formatCurrencyCompact } from "@/lib/formatters/currency";
import { toISODateRange } from "@/lib/date-range/presets";
import { ChartCard } from "@/components/dashboard/chart-card";
import { ChartTooltip } from "./chart-tooltip";
import { BarChart3 } from "lucide-react";

const RANGE_BY_GRANULARITY: Record<CashFlowGranularity, (d: Date) => Date> = {
  month: (d) => subMonths(d, 12),
  quarter: (d) => subQuarters(d, 8),
  year: (d) => subYears(d, 5),
};

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
        <Skeleton className="h-72 w-full" />
      ) : !hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No transactions yet"
          description="Add income and expenses to see your cash flow here."
          className="h-72 justify-center border-none py-0"
        />
      ) : (
        <ResponsiveContainer width="100%" height={288}>
          <ComposedChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => formatCurrencyCompact(v)}
              width={56}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
            />
            <Bar dataKey="income" name="Income" fill="var(--income)" radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="expense" name="Expenses" fill="var(--expense)" radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Line
              type="monotone"
              dataKey="net"
              name="Savings"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
