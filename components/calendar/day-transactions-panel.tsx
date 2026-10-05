"use client";

import { CalendarDays, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useTransactionSheet } from "@/components/transactions/transaction-sheet-context";
import {
  TRANSACTION_TYPE_META,
  TransactionIcon,
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
    <section className="surface flex flex-col">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-lg font-semibold">{formatDate(date, "EEEE, d MMM yyyy")}</h3>
          {(income > 0 || expenses > 0) && (
            <p className="text-muted-foreground text-sm tabular-nums">
              {income > 0 && <span className="text-income">+{formatCurrency(income)}</span>}
              {income > 0 && expenses > 0 && " · "}
              {expenses > 0 && <span className="text-expense">-{formatCurrency(expenses)}</span>}
            </p>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={() => openCreate("expense", date)}>
          <Plus />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 px-5 pb-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nothing on this day"
          description="No transactions recorded yet."
          className="py-10"
        />
      ) : (
        <ul className="pb-2">
          {transactions.map((txn) => (
            <li key={txn.id} className="group/row">
              <button
                type="button"
                onClick={() => openEdit(txn)}
                className="hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.03] active:bg-foreground/[0.06] flex w-full items-center gap-3 px-5 text-left transition-colors duration-150 outline-none"
              >
                <TransactionIcon transaction={txn} size="sm" />
                <div className="flex min-w-0 flex-1 items-center gap-3 border-b py-3 group-last/row:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium">{txn.description || "—"}</p>
                    <p className="text-muted-foreground truncate text-sm">
                      {txn.category?.name ?? TRANSACTION_TYPE_META[txn.type].label}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-base font-medium tabular-nums ${transactionAmountClass(txn.type)}`}
                  >
                    {transactionAmountSign(txn.type)}
                    {formatCurrency(txn.amount)}
                  </p>
                  <ChevronRight className="text-muted-foreground/60 size-4 shrink-0" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
