"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ChartCard } from "@/components/dashboard/chart-card";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { useDateRange } from "@/hooks/use-date-range";
import { expenseBreakdownByCategory } from "@/lib/calculations/transactions";
import { formatCurrencyCompact } from "@/lib/formatters/currency";
import { toISODateRange } from "@/lib/date-range/presets";
import { ChartTooltip } from "./chart-tooltip";

const TOP_N = 6;

export function TopCategoriesChart() {
  const router = useRouter();
  const { range } = useDateRange();
  const filters = React.useMemo(() => toISODateRange(range), [range]);
  const { data: transactions, isLoading } = useTransactionsForRange(filters);

  const top = React.useMemo(
    () => expenseBreakdownByCategory(transactions ?? []).slice(0, TOP_N),
    [transactions]
  );

  return (
    <ChartCard title="Top Spending Categories" description="Largest categories, selected period">
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : top.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No expenses in this period"
          className="h-64 justify-center border-none py-0"
        />
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, top.length * 40)}>
          <BarChart
            data={top}
            layout="vertical"
            margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
            barCategoryGap={10}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={92}
              tick={{ fontSize: 12, fill: "var(--foreground)" }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
            <Bar
              dataKey="total"
              name="Spent"
              radius={[0, 4, 4, 0]}
              maxBarSize={20}
              onClick={(entry) => {
                const categoryId = (entry as unknown as { categoryId: string }).categoryId;
                router.push(`/transactions?category=${categoryId}`);
              }}
              cursor="pointer"
              label={{
                position: "right",
                fill: "var(--muted-foreground)",
                fontSize: 12,
                formatter: (v: React.ReactNode) => formatCurrencyCompact(Number(v)),
              }}
            >
              {top.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
