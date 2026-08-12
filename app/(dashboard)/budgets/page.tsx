"use client";

import * as React from "react";
import { PiggyBank, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { useBudgets, useDeleteBudget } from "@/hooks/use-budgets";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import type { Budget } from "@/types";

export default function BudgetsPage() {
  const [editing, setEditing] = React.useState<Budget | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<Budget | null>(null);

  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: transactions, isLoading: txnsLoading } = useTransactionsForRange({});
  const deleteBudget = useDeleteBudget();

  const isLoading = budgetsLoading || txnsLoading;

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteBudget.mutateAsync(pendingDelete.id);
      toast.success("Budget deleted");
    } catch {
      toast.error("Couldn't delete this budget");
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground text-sm">
            Spending limits for your categories, tracked against this period.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add budget
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : !budgets || budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets yet"
          description="Set a spending limit for a category to start tracking against it."
          action={<Button onClick={() => setAddOpen(true)}>Add budget</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              transactions={transactions ?? []}
              onEdit={() => setEditing(budget)}
              onDelete={() => setPendingDelete(budget)}
            />
          ))}
        </div>
      )}

      <BudgetFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <BudgetFormDialog
        budget={editing ?? undefined}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete budget?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the {pendingDelete?.category?.name ?? "this"} budget. This can&apos;t
              be undone.
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
