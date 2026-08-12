"use client";

import * as React from "react";
import { startOfMonth } from "date-fns";
import { Landmark, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { AccountCard } from "@/components/accounts/account-card";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { useAccounts, useSetAccountActive } from "@/hooks/use-accounts";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { accountBalance, totalExpenses, totalIncome } from "@/lib/calculations";
import { toInputDate } from "@/lib/formatters/date";
import type { Account } from "@/types";

export default function AccountsPage() {
  const [showArchived, setShowArchived] = React.useState(false);
  const [editing, setEditing] = React.useState<Account | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  const { data: accounts, isLoading: accountsLoading } = useAccounts({ includeArchived: showArchived });
  const { data: allTransactions, isLoading: txnsLoading } = useTransactionsForRange({});
  const setActive = useSetAccountActive();

  const monthStart = toInputDate(startOfMonth(new Date()));
  const isLoading = accountsLoading || txnsLoading;

  async function handleToggleActive(account: Account) {
    try {
      await setActive.mutateAsync({ id: account.id, isActive: !account.isActive });
      toast.success(account.isActive ? "Account archived" : "Account unarchived");
    } catch {
      toast.error("Couldn't update this account");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground text-sm">
            Your cash, bank, card, wallet, and liability accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
            <Label htmlFor="show-archived" className="text-muted-foreground text-sm font-normal">
              Show archived
            </Label>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add account
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No accounts yet"
          description="Add your first bank, cash, or card account to start tracking balances."
          action={<Button onClick={() => setAddOpen(true)}>Add account</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const allTxnsList = allTransactions ?? [];
            const balance = accountBalance(account, allTxnsList);
            const monthTxns = allTxnsList.filter(
              (t) => t.accountId === account.id && t.transactionDate >= monthStart
            );
            return (
              <AccountCard
                key={account.id}
                account={account}
                balance={balance}
                income={totalIncome(monthTxns)}
                expenses={totalExpenses(monthTxns)}
                onEdit={() => setEditing(account)}
                onToggleActive={() => handleToggleActive(account)}
              />
            );
          })}
        </div>
      )}

      <AccountFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <AccountFormDialog
        account={editing ?? undefined}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
    </div>
  );
}
