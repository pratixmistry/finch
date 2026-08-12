import type { Metadata } from "next";
import { Suspense } from "react";
import { TransactionFiltersBar } from "@/components/transactions/transaction-filters-bar";
import { TransactionsList } from "@/components/transactions/transactions-list";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";

export const metadata: Metadata = { title: "Transactions — Finch" };

export default function TransactionsPage() {
  return (
    <Suspense>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground text-sm">
              Every income, expense, investment, and transfer in one place.
            </p>
          </div>
          <AddTransactionButton />
        </div>

        <TransactionFiltersBar />
        <TransactionsList />
      </div>
    </Suspense>
  );
}
