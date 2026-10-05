import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionFiltersBar } from "@/components/transactions/transaction-filters-bar";
import { TransactionsList } from "@/components/transactions/transactions-list";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";

export const metadata: Metadata = { title: "Transactions — Finch" };

export default function TransactionsPage() {
  return (
    <Suspense>
      <div className="flex flex-col gap-7">
        <PageHeader
          title="Transactions"
          description="Every income, expense, investment, and transfer in one place."
        >
          <AddTransactionButton />
        </PageHeader>

        <div className="flex flex-col gap-3">
          <TransactionFiltersBar />
          <TransactionsList />
        </div>
      </div>
    </Suspense>
  );
}
