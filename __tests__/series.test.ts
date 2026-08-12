import { describe, expect, it } from "vitest";
import {
  buildCashFlowSeries,
  buildSpendingTrendSeries,
  trendGranularityForRangeDays,
} from "@/lib/calculations/series";
import type { Transaction } from "@/types";

function txn(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    userId: "user-1",
    accountId: "account-1",
    categoryId: null,
    transferAccountId: null,
    type: "expense",
    amount: 0,
    transactionDate: "2026-01-01",
    description: "",
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildCashFlowSeries", () => {
  it("returns an empty array for no transactions", () => {
    expect(buildCashFlowSeries([], "month")).toEqual([]);
  });

  it("buckets by month and computes net per bucket", () => {
    const transactions = [
      txn({ type: "income", amount: 1000, transactionDate: "2026-01-05" }),
      txn({ type: "expense", amount: 300, transactionDate: "2026-01-20" }),
      txn({ type: "income", amount: 2000, transactionDate: "2026-02-01" }),
      txn({ type: "transfer", amount: 5000, transactionDate: "2026-01-10" }),
    ];

    const series = buildCashFlowSeries(transactions, "month");
    expect(series).toHaveLength(2);
    expect(series[0]).toMatchObject({ income: 1000, expense: 300, net: 700 });
    expect(series[1]).toMatchObject({ income: 2000, expense: 0, net: 2000 });
  });

  it("buckets by quarter across year boundaries in sorted order", () => {
    const transactions = [
      txn({ type: "income", amount: 100, transactionDate: "2025-11-15" }), // Q4 2025
      txn({ type: "income", amount: 200, transactionDate: "2026-01-15" }), // Q1 2026
    ];
    const series = buildCashFlowSeries(transactions, "quarter");
    expect(series.map((p) => p.key)).toEqual(["2025-Q4", "2026-Q1"]);
  });

  it("buckets by year", () => {
    const transactions = [
      txn({ type: "expense", amount: 50, transactionDate: "2024-06-01" }),
      txn({ type: "expense", amount: 75, transactionDate: "2026-06-01" }),
    ];
    const series = buildCashFlowSeries(transactions, "year");
    expect(series.map((p) => p.key)).toEqual(["2024", "2026"]);
  });
});

describe("trendGranularityForRangeDays", () => {
  it("picks daily for short ranges, weekly for medium, monthly for long", () => {
    expect(trendGranularityForRangeDays(7)).toBe("day");
    expect(trendGranularityForRangeDays(31)).toBe("day");
    expect(trendGranularityForRangeDays(90)).toBe("week");
    expect(trendGranularityForRangeDays(365)).toBe("month");
  });
});

describe("buildSpendingTrendSeries", () => {
  it("only includes expenses, grouped by day", () => {
    const transactions = [
      txn({ type: "expense", amount: 100, transactionDate: "2026-03-05" }),
      txn({ type: "expense", amount: 50, transactionDate: "2026-03-05" }),
      txn({ type: "income", amount: 9999, transactionDate: "2026-03-05" }),
    ];
    const series = buildSpendingTrendSeries(transactions, "day");
    expect(series).toHaveLength(1);
    expect(series[0].amount).toBe(150);
  });
});
