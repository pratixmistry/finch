import { format, parseISO, startOfWeek } from "date-fns";
import type { Transaction } from "@/types";

export type CashFlowGranularity = "month" | "quarter" | "year";
export type TrendGranularity = "day" | "week" | "month";

export interface CashFlowPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

function cashFlowBucketKey(date: Date, granularity: CashFlowGranularity): string {
  if (granularity === "month") return format(date, "yyyy-MM");
  if (granularity === "quarter") return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
  return format(date, "yyyy");
}

function cashFlowBucketLabel(key: string, date: Date, granularity: CashFlowGranularity): string {
  if (granularity === "month") return format(date, "MMM ''yy");
  if (granularity === "quarter") return key.replace("-", " ");
  return key;
}

// Groups income/expense transactions into time buckets for the Income vs
// Expenses chart. Investment and transfer transactions are excluded — same
// rule as totalIncome/totalExpenses.
export function buildCashFlowSeries(
  transactions: Pick<Transaction, "type" | "amount" | "transactionDate">[],
  granularity: CashFlowGranularity
): CashFlowPoint[] {
  const buckets = new Map<string, CashFlowPoint>();

  for (const txn of transactions) {
    if (txn.type !== "income" && txn.type !== "expense") continue;
    const date = parseISO(txn.transactionDate);
    const key = cashFlowBucketKey(date, granularity);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { key, label: cashFlowBucketLabel(key, date, granularity), income: 0, expense: 0, net: 0 };
      buckets.set(key, bucket);
    }
    if (txn.type === "income") bucket.income += txn.amount;
    else bucket.expense += txn.amount;
    bucket.net = bucket.income - bucket.expense;
  }

  return Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export const CASH_FLOW_BUCKET_LIMIT: Record<CashFlowGranularity, number> = {
  month: 12,
  quarter: 8,
  year: 5,
};

export interface TrendPoint {
  key: string;
  label: string;
  amount: number;
}

function trendBucketKey(date: Date, granularity: TrendGranularity): string {
  if (granularity === "day") return format(date, "yyyy-MM-dd");
  if (granularity === "week") return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
  return format(date, "yyyy-MM");
}

function trendBucketLabel(date: Date, granularity: TrendGranularity): string {
  if (granularity === "day") return format(date, "d MMM");
  if (granularity === "week") return format(date, "d MMM");
  return format(date, "MMM yy");
}

// Picks a sensible bucket size for the Spending Trend line chart based on how
// wide the selected date range is — daily is unreadable over a year, monthly
// is too coarse for a single week.
export function trendGranularityForRangeDays(days: number): TrendGranularity {
  if (days <= 31) return "day";
  if (days <= 120) return "week";
  return "month";
}

export function buildSpendingTrendSeries(
  transactions: Pick<Transaction, "type" | "amount" | "transactionDate">[],
  granularity: TrendGranularity
): TrendPoint[] {
  const buckets = new Map<string, TrendPoint>();

  for (const txn of transactions) {
    if (txn.type !== "expense") continue;
    const date = parseISO(txn.transactionDate);
    const key = trendBucketKey(date, granularity);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { key, label: trendBucketLabel(date, granularity), amount: 0 };
      buckets.set(key, bucket);
    }
    bucket.amount += txn.amount;
  }

  return Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));
}
