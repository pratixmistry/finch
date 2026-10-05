"use client";

import * as React from "react";
import { differenceInCalendarDays } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
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
    <div className="flex flex-col gap-7">
      <PageHeader title="Reports" description="Breakdowns and exports for the selected period.">
        <ExportCsvButton transactions={transactions ?? []} from={filters.from} to={filters.to} />
      </PageHeader>

      <div>
        <DateRangeSelector />
      </div>

      <IncomeExpenseChart />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Cash flow by period</h2>
        <CashFlowTable transactions={transactions ?? []} rangeDays={rangeDays} isLoading={isLoading} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Expenses by category</h2>
        <CategoryBreakdownTable transactions={transactions ?? []} isLoading={isLoading} />
      </section>
    </div>
  );
}
