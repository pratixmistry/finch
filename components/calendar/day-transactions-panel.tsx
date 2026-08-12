"use client";

import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useTransactionSheet } from "@/components/transactions/transaction-sheet-context";
import {
  TransactionTypeBadge,
  transactionAmountClass,
  transactionAmountSign,
} from "@/components/transactions/transaction-type-badge";
import { totalExpenses, totalIncome } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { Transaction } from "@/types";

export function DayTransactionsPanel({
  date,
  transactions,
  isLoading,
}: {
  date: string;
  transactions: Transaction[];
  isLoading: boolean;
}) {
  const { openCreate, openEdit } = useTransactionSheet();
  const income = totalIncome(transactions);
  const expenses = totalExpenses(transactions);

  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl border p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{formatDate(date, "EEEE, d MMM yyyy")}</h3>
          {(income > 0 || expenses > 0) && (
            <p className="text-muted-foreground text-xs">
              {income > 0 && <span className="text-income">+{formatCurrency(income)}</span>}
              {income > 0 && expenses > 0 && " · "}
              {expenses > 0 && <span className="text-expense">-{formatCurrency(expenses)}</span>}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => openCreate("expense", date)}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nothing on this day"
          description="No transactions recorded yet."
          className="py-8"
        />
      ) : (
        <ul className="space-y-2">
          {transactions.map((txn) => (
            <li key={txn.id}>
              <button
                type="button"
                onClick={() => openEdit(txn)}
                className="hover:bg-muted flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-medium">{txn.description || "—"}</p>
                  <TransactionTypeBadge type={txn.type} />
                </div>
                <p className={`shrink-0 text-sm font-semibold tabular-nums ${transactionAmountClass(txn.type)}`}>
                  {transactionAmountSign(txn.type)}
                  {formatCurrency(txn.amount)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
