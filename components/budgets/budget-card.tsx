"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryIcon } from "@/components/categories/category-icon";
import { Progress } from "@/components/ui/progress";
import { budgetProgress } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters/currency";
import { cn } from "@/lib/utils";
import type { Budget, Transaction } from "@/types";

const PERIOD_LABEL: Record<Budget["period"], string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export function BudgetCard({
  budget,
  transactions,
  onEdit,
  onDelete,
}: {
  budget: Budget;
  transactions: Transaction[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { spent, remaining, percentage, isOverBudget } = budgetProgress(budget, transactions);
  const barWidth = Math.min(100, Math.max(0, percentage));

  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl p-4 shadow-xs ring-1 ring-foreground/10 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${budget.category?.color ?? "#6366f1"}1a`, color: budget.category?.color }}
          >
            <CategoryIcon name={budget.category?.icon ?? "circle"} className="size-4.5" />
          </div>
          <div>
            <p className="text-sm font-medium">{budget.category?.name ?? "Uncategorized"}</p>
            <p className="text-muted-foreground text-xs">{PERIOD_LABEL[budget.period]}</p>
          </div>
        </div>
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
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className={cn("font-semibold tabular-nums", isOverBudget && "text-expense")}>
            {formatCurrency(spent)}
          </span>
          <span className="text-muted-foreground">of {formatCurrency(budget.amount)}</span>
        </div>
        <Progress
          value={barWidth}
          className="h-2"
          indicatorClassName={isOverBudget ? "bg-expense" : "bg-primary"}
        />
        <p className={cn("text-xs", isOverBudget ? "text-expense" : "text-muted-foreground")}>
          {isOverBudget
            ? `${formatCurrency(Math.abs(remaining))} over budget`
            : `${formatCurrency(remaining)} left this period`}
        </p>
      </div>
    </div>
  );
}
