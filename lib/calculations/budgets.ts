import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "date-fns";
import type { Budget, Transaction } from "@/types";
import { toInputDate } from "@/lib/formatters/date";

// Budgets recur every period from their start_date — this resolves the
// window for "now" rather than tracking discrete period instances.
export function currentPeriodRange(period: Budget["period"], reference: Date = new Date()) {
  switch (period) {
    case "quarterly":
      return { from: toInputDate(startOfQuarter(reference)), to: toInputDate(endOfQuarter(reference)) };
    case "yearly":
      return { from: toInputDate(startOfYear(reference)), to: toInputDate(endOfYear(reference)) };
    case "monthly":
    default:
      return { from: toInputDate(startOfMonth(reference)), to: toInputDate(endOfMonth(reference)) };
  }
}

export interface BudgetProgress {
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export function budgetProgress(
  budget: Pick<Budget, "categoryId" | "amount" | "period">,
  transactions: Transaction[]
): BudgetProgress {
  const { from, to } = currentPeriodRange(budget.period);
  const spent = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.categoryId === budget.categoryId &&
        t.transactionDate >= from &&
        t.transactionDate <= to
    )
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    spent,
    remaining: budget.amount - spent,
    percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
    isOverBudget: spent > budget.amount,
  };
}
