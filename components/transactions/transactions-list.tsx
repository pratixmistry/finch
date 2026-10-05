"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Receipt, Trash2 } from "lucide-react";
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
import {
  TRANSACTION_TYPE_META,
  TransactionIcon,
  transactionAmountClass,
  transactionAmountSign,
} from "./transaction-type-badge";
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
      <div className="surface space-y-3 p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
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
        className="surface"
      />
    );
  }

  return (
    <div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
      {/* Desktop table */}
      <div className="surface hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-14">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <TransactionIcon transaction={txn} size="sm" />
                    <span className="max-w-64 truncate text-base font-medium">
                      {txn.description || "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {txn.type === "transfer"
                    ? `Transfer → ${txn.transferAccount?.name ?? "—"}`
                    : (txn.category?.name ?? TRANSACTION_TYPE_META[txn.type].label)}
                </TableCell>
                <TableCell className="text-muted-foreground">{txn.account?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeDate(txn.transactionDate)}
                </TableCell>
                <TableCell
                  className={`text-right text-base font-medium tabular-nums ${transactionAmountClass(txn.type)}`}
                >
                  {transactionAmountSign(txn.type)}
                  {formatCurrency(txn.amount)}
                </TableCell>
                <TableCell className="py-1 pr-3 pl-0 text-right">
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

      {/* Mobile list */}
      <ul className="surface py-1 md:hidden">
        {transactions.map((txn) => (
          <li key={txn.id} className="group/row flex items-center gap-3 pr-2 pl-4">
            <TransactionIcon transaction={txn} />
            <div className="flex min-w-0 flex-1 items-center gap-2 border-b py-3 group-last/row:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium">{txn.description || "—"}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {formatRelativeDate(txn.transactionDate)} ·{" "}
                  {txn.type === "transfer"
                    ? `→ ${txn.transferAccount?.name ?? "—"}`
                    : (txn.category?.name ?? txn.account?.name ?? "—")}
                </p>
              </div>
              <p
                className={`shrink-0 text-base font-medium tabular-nums ${transactionAmountClass(txn.type)}`}
              >
                {transactionAmountSign(txn.type)}
                {formatCurrency(txn.amount)}
              </p>
              <RowActions onEdit={() => openEdit(txn)} onDelete={() => setPendingDelete(txn)} />
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm tabular-nums">
            Page {filters.page} of {totalPages} · {total} transactions
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => filters.update({ page: filters.page - 1 }, { resetPage: false })}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="pr-3 has-[>svg]:pl-4"
              disabled={filters.page >= totalPages}
              onClick={() => filters.update({ page: filters.page + 1 }, { resetPage: false })}
            >
              Next
              <ChevronRight />
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
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0" aria-label="More options">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
