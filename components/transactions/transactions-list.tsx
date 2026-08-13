"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { useTransactionsPage, useDeleteTransaction } from "@/hooks/use-transactions";
import { useTransactionFilters } from "@/hooks/use-transaction-filters";
import { useTransactionSheet } from "@/components/transactions/transaction-sheet-context";
import { TransactionTypeBadge, transactionAmountClass, transactionAmountSign } from "./transaction-type-badge";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatRelativeDate } from "@/lib/formatters/date";
import type { Transaction } from "@/types";

const PAGE_SIZE = 20;

export function TransactionsList() {
  const filters = useTransactionFilters();
  const { openEdit } = useTransactionSheet();
  const deleteTransaction = useDeleteTransaction();
  const [pendingDelete, setPendingDelete] = React.useState<Transaction | null>(null);

  const { data, isLoading, isPlaceholderData } = useTransactionsPage(
    {
      from: filters.from || undefined,
      to: filters.to || undefined,
      accountId: filters.accountId !== "all" ? filters.accountId : undefined,
      categoryId: filters.categoryId !== "all" ? filters.categoryId : undefined,
      type: filters.type !== "all" ? filters.type : undefined,
      search: filters.q || undefined,
    },
    { page: filters.page, pageSize: PAGE_SIZE }
  );

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteTransaction.mutateAsync(pendingDelete.id);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Couldn't delete this transaction");
    } finally {
      setPendingDelete(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title={filters.hasActiveFilters ? "No matching transactions" : "No transactions yet"}
        description={
          filters.hasActiveFilters
            ? "Try adjusting or clearing your filters."
            : "Start tracking your finances by adding your first transaction."
        }
      />
    );
  }

  return (
    <div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
      {/* Desktop table */}
      <div className="bg-card hidden overflow-x-auto rounded-xl shadow-xs ring-1 ring-foreground/10 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id} className="group">
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatRelativeDate(txn.transactionDate)}
                </TableCell>
                <TableCell className="max-w-56 truncate font-medium">
                  {txn.description || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {txn.type === "transfer" ? (
                    <span>→ {txn.transferAccount?.name ?? "—"}</span>
                  ) : (
                    (txn.category?.name ?? "—")
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{txn.account?.name ?? "—"}</TableCell>
                <TableCell>
                  <TransactionTypeBadge type={txn.type} />
                </TableCell>
                <TableCell
                  className={`text-right font-medium tabular-nums ${transactionAmountClass(txn.type)}`}
                >
                  {transactionAmountSign(txn.type)}
                  {formatCurrency(txn.amount)}
                </TableCell>
                <TableCell>
                  <RowActions
                    onEdit={() => openEdit(txn)}
                    onDelete={() => setPendingDelete(txn)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-2 md:hidden">
        {transactions.map((txn) => (
          <li key={txn.id} className="bg-card flex items-center gap-3 rounded-xl p-3 shadow-xs ring-1 ring-foreground/10">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{txn.description || "—"}</p>
              <p className="text-muted-foreground truncate text-xs">
                {formatRelativeDate(txn.transactionDate)} ·{" "}
                {txn.type === "transfer"
                  ? `→ ${txn.transferAccount?.name ?? "—"}`
                  : (txn.category?.name ?? txn.account?.name ?? "—")}
              </p>
            </div>
            <p className={`shrink-0 text-sm font-semibold tabular-nums ${transactionAmountClass(txn.type)}`}>
              {transactionAmountSign(txn.type)}
              {formatCurrency(txn.amount)}
            </p>
            <RowActions onEdit={() => openEdit(txn)} onDelete={() => setPendingDelete(txn)} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            Page {filters.page} of {totalPages} · {total} transactions
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => filters.update({ page: filters.page - 1 }, { resetPage: false })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page >= totalPages}
              onClick={() => filters.update({ page: filters.page + 1 }, { resetPage: false })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{pendingDelete?.description || "this transaction"}
              &quot; and update your account balances. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label="More options">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
