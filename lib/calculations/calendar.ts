import type { Transaction } from "@/types";
import { totalExpenses, totalIncome } from "./transactions";

export interface DaySummary {
  date: string;
  income: number;
  expenses: number;
  count: number;
}

// Groups transactions by transaction_date (already an ISO "yyyy-MM-dd" string,
// so no timezone-sensitive parsing needed) for the calendar month grid.
export function groupTransactionsByDay(transactions: Transaction[]): Map<string, DaySummary> {
  const byDay = new Map<string, Transaction[]>();
  for (const txn of transactions) {
    const list = byDay.get(txn.transactionDate);
    if (list) list.push(txn);
    else byDay.set(txn.transactionDate, [txn]);
  }

  const summaries = new Map<string, DaySummary>();
  for (const [date, txns] of byDay) {
    summaries.set(date, {
      date,
      income: totalIncome(txns),
      expenses: totalExpenses(txns),
      count: txns.length,
    });
  }
  return summaries;
}
