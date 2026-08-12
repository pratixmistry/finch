"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArchiveRestore, Archive as ArchiveIcon, ArrowLeft, Pencil, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { ACCOUNT_TYPE_ICON, ACCOUNT_TYPE_LABEL } from "@/components/accounts/account-type-icon";
import {
  TransactionTypeBadge,
  transactionAmountClass,
  transactionAmountSign,
} from "@/components/transactions/transaction-type-badge";
import { useAccounts, useSetAccountActive } from "@/hooks/use-accounts";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { accountBalance, totalExpenses, totalIncome } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatRelativeDate } from "@/lib/formatters/date";

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);

  const { data: accounts, isLoading: accountsLoading } = useAccounts({ includeArchived: true });
  const { data: allTransactions, isLoading: txnsLoading } = useTransactionsForRange({});
  const setActive = useSetAccountActive();

  const account = accounts?.find((a) => a.id === params.id);
  const isLoading = accountsLoading || txnsLoading;

  const accountTxns = React.useMemo(
    () => (allTransactions ?? []).filter((t) => t.accountId === params.id || t.transferAccountId === params.id),
    [allTransactions, params.id]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!account) {
    return (
      <EmptyState
        icon={Receipt}
        title="Account not found"
        description="It may have been removed."
        action={
          <Button variant="outline" asChild>
            <Link href="/accounts">Back to accounts</Link>
          </Button>
        }
      />
    );
  }

  const Icon = ACCOUNT_TYPE_ICON[account.type];
  const balance = accountBalance(account, allTransactions ?? []);

  async function handleToggleActive() {
    if (!account) return;
    try {
      await setActive.mutateAsync({ id: account.id, isActive: !account.isActive });
      toast.success(account.isActive ? "Account archived" : "Account unarchived");
    } catch {
      toast.error("Couldn't update this account");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.push("/accounts")}>
        <ArrowLeft className="size-4" />
        Accounts
      </Button>

      <div className="bg-card rounded-xl border p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
              <Icon className="size-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{account.name}</h1>
              <p className="text-muted-foreground text-sm">{ACCOUNT_TYPE_LABEL[account.type]}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleToggleActive}>
              {account.isActive ? (
                <>
                  <ArchiveIcon className="size-4" />
                  Archive
                </>
              ) : (
                <>
                  <ArchiveRestore className="size-4" />
                  Unarchive
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Current balance" value={formatCurrency(balance)} />
          <Stat label="Opening balance" value={formatCurrency(account.openingBalance)} />
          <Stat label="Total income" value={formatCurrency(totalIncome(accountTxns))} className="text-income" />
          <Stat label="Total expenses" value={formatCurrency(totalExpenses(accountTxns))} className="text-expense" />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Transaction history</h2>
        {accountTxns.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions for this account yet" />
        ) : (
          <ul className="divide-y rounded-xl border">
            {accountTxns
              .slice()
              .sort((a, b) => (a.transactionDate < b.transactionDate ? 1 : -1))
              .map((txn) => (
                <li key={txn.id} className="flex items-center gap-3 p-3 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{txn.description || "—"}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatRelativeDate(txn.transactionDate)}
                      {txn.type === "transfer" && txn.accountId !== account.id
                        ? ` · from ${txn.account?.name ?? "—"}`
                        : txn.type === "transfer"
                          ? ` · to ${txn.transferAccount?.name ?? "—"}`
                          : txn.category
                            ? ` · ${txn.category.name}`
                            : ""}
                    </p>
                  </div>
                  <TransactionTypeBadge type={txn.type} />
                  <p
                    className={`w-28 shrink-0 text-right text-sm font-semibold tabular-nums ${
                      txn.type === "transfer" && txn.accountId !== account.id
                        ? "text-income"
                        : transactionAmountClass(txn.type)
                    }`}
                  >
                    {txn.type === "transfer"
                      ? txn.accountId === account.id
                        ? "-"
                        : "+"
                      : transactionAmountSign(txn.type)}
                    {formatCurrency(txn.amount)}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </div>

      <AccountFormDialog account={account} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${className ?? ""}`}>{value}</p>
    </div>
  );
}
