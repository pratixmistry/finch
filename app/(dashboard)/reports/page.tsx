"use client";

import * as React from "react";
import { differenceInCalendarDays } from "date-fns";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart";
import { CashFlowTable } from "@/components/reports/cash-flow-table";
import { CategoryBreakdownTable } from "@/components/reports/category-breakdown-table";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { useDateRange } from "@/hooks/use-date-range";
import { toISODateRange } from "@/lib/date-range/presets";

export default function ReportsPage() {
  const { range } = useDateRange();
  const filters = React.useMemo(() => toISODateRange(range), [range]);
  const { data: transactions, isLoading } = useTransactionsForRange(filters);
  const rangeDays = differenceInCalendarDays(range.to, range.from) + 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-sm">
            Breakdowns and exports for the selected period.
          </p>
        </div>
        <ExportCsvButton transactions={transactions ?? []} from={filters.from} to={filters.to} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-muted-foreground text-sm font-medium">Period</h2>
        <DateRangeSelector />
      </div>

      <IncomeExpenseChart />

      <div>
        <h2 className="mb-3 text-sm font-semibold">Cash flow by period</h2>
        <CashFlowTable transactions={transactions ?? []} rangeDays={rangeDays} isLoading={isLoading} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Expenses by category</h2>
        <CategoryBreakdownTable transactions={transactions ?? []} isLoading={isLoading} />
      </div>
    </div>
  );
}
