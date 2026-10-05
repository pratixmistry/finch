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
import { IconTile } from "@/components/shared/icon-tile";
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
    <div className="surface flex flex-col gap-5 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile color={budget.category?.color ?? "#6366f1"}>
            <CategoryIcon name={budget.category?.icon ?? "circle"} />
          </IconTile>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">
              {budget.category?.name ?? "Uncategorized"}
            </p>
            <p className="text-muted-foreground text-sm">{PERIOD_LABEL[budget.period]}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground -mt-1 -mr-2 shrink-0"
              aria-label="More options"
            >
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
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={cn("text-2xl font-semibold tabular-nums", isOverBudget && "text-expense")}
          >
            {formatCurrency(spent)}
          </span>
          <span className="text-muted-foreground text-sm tabular-nums">
            of {formatCurrency(budget.amount)}
          </span>
        </div>
        <Progress
          value={barWidth}
          className="h-2"
          indicatorClassName={isOverBudget ? "bg-expense" : "bg-primary"}
        />
        <p className={cn("text-sm", isOverBudget ? "text-expense" : "text-muted-foreground")}>
          {isOverBudget
            ? `${formatCurrency(Math.abs(remaining))} over budget`
            : `${formatCurrency(remaining)} left this period`}
        </p>
      </div>
    </div>
  );
}
