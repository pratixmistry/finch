"use client";

import { BarChart3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { buildCashFlowSeries, type CashFlowGranularity } from "@/lib/calculations/series";
import { formatCurrency } from "@/lib/formatters/currency";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

function granularityForRangeDays(days: number): CashFlowGranularity {
  if (days <= 731) return "month";
  if (days <= 2192) return "quarter";
  return "year";
}

export function CashFlowTable({
  transactions,
  rangeDays,
  isLoading,
}: {
  transactions: Transaction[];
  rangeDays: number;
  isLoading: boolean;
}) {
  const granularity = granularityForRangeDays(rangeDays);
  const series = buildCashFlowSeries(transactions, granularity);
  const totals = series.reduce(
    (acc, p) => ({ income: acc.income + p.income, expense: acc.expense + p.expense }),
    { income: 0, expense: 0 }
  );

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  if (series.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No transactions in this period"
        className="rounded-xl border py-14"
      />
    );
  }

  return (
    <div className="bg-card overflow-x-auto rounded-xl shadow-xs ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Income</TableHead>
            <TableHead className="text-right">Expenses</TableHead>
            <TableHead className="text-right">Net</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {series.map((point) => (
            <TableRow key={point.key}>
              <TableCell className="font-medium">{point.label}</TableCell>
              <TableCell className="text-income text-right tabular-nums">
                {formatCurrency(point.income)}
              </TableCell>
              <TableCell className="text-expense text-right tabular-nums">
                {formatCurrency(point.expense)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium tabular-nums",
                  point.net >= 0 ? "text-income" : "text-expense"
                )}
              >
                {formatCurrency(point.net)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-semibold">Total</TableCell>
            <TableCell className="text-income text-right font-semibold tabular-nums">
              {formatCurrency(totals.income)}
            </TableCell>
            <TableCell className="text-expense text-right font-semibold tabular-nums">
              {formatCurrency(totals.expense)}
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-semibold tabular-nums",
                totals.income - totals.expense >= 0 ? "text-income" : "text-expense"
              )}
            >
              {formatCurrency(totals.income - totals.expense)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
