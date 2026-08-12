import type { Transaction } from "@/types";

// Transfers move money between the user's own accounts — they are never
// income or expense, so every aggregate below simply ignores type==="transfer".

export function totalIncome(transactions: Pick<Transaction, "type" | "amount">[]): number {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function totalExpenses(transactions: Pick<Transaction, "type" | "amount">[]): number {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function totalInvested(transactions: Pick<Transaction, "type" | "amount">[]): number {
  return transactions
    .filter((t) => t.type === "investment")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function netCashFlow(transactions: Pick<Transaction, "type" | "amount">[]): number {
  return totalIncome(transactions) - totalExpenses(transactions);
}

export interface CategoryBreakdownEntry {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  percentage: number;
}

// Groups expense transactions by category for the dashboard donut chart.
// Transactions without a resolved category (shouldn't happen for expenses,
// but data can be mid-migration) are bucketed under "Uncategorized".
export function expenseBreakdownByCategory(
  transactions: Transaction[]
): CategoryBreakdownEntry[] {
  const expenseTxns = transactions.filter((t) => t.type === "expense");
  const total = totalExpenses(expenseTxns);

  const byCategory = new Map<string, CategoryBreakdownEntry>();
  for (const txn of expenseTxns) {
    const key = txn.category?.id ?? "uncategorized";
    const existing = byCategory.get(key);
    if (existing) {
      existing.total += txn.amount;
    } else {
      byCategory.set(key, {
        categoryId: key,
        name: txn.category?.name ?? "Uncategorized",
        color: txn.category?.color ?? "var(--muted-foreground)",
        icon: txn.category?.icon ?? "circle",
        total: txn.amount,
        percentage: 0,
      });
    }
  }

  return Array.from(byCategory.values())
    .map((entry) => ({
      ...entry,
      percentage: total > 0 ? (entry.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
