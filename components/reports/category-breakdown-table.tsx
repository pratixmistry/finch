"use client";

import { PieChart } from "lucide-react";
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
import { IconTile } from "@/components/shared/icon-tile";
import { CategoryIcon } from "@/components/categories/category-icon";
import { expenseBreakdownByCategory } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters/currency";
import type { Transaction } from "@/types";

export function CategoryBreakdownTable({
  transactions,
  isLoading,
}: {
  transactions: Transaction[];
  isLoading: boolean;
}) {
  const breakdown = expenseBreakdownByCategory(transactions);
  const total = breakdown.reduce((sum, e) => sum + e.total, 0);

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  if (breakdown.length === 0) {
    return (
      <EmptyState
        icon={PieChart}
        title="No expenses in this period"
        className="surface"
      />
    );
  }

  return (
    <div className="surface overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">% of total</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {breakdown.map((entry) => (
            <TableRow key={entry.categoryId}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <IconTile color={entry.color} size="sm">
                    <CategoryIcon name={entry.icon} />
                  </IconTile>
                  {entry.name}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-right tabular-nums">
                {entry.percentage.toFixed(1)}%
              </TableCell>
              <TableCell className="text-expense text-right font-medium tabular-nums">
                {formatCurrency(entry.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-semibold">Total</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">100%</TableCell>
            <TableCell className="text-expense text-right font-semibold tabular-nums">
              {formatCurrency(total)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
