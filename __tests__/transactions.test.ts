import { describe, expect, it } from "vitest";
import {
  expenseBreakdownByCategory,
  netCashFlow,
  totalExpenses,
  totalIncome,
  totalInvested,
} from "@/lib/calculations/transactions";
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

describe("totalIncome / totalExpenses / netCashFlow", () => {
  it("returns zero for an empty list", () => {
    expect(totalIncome([])).toBe(0);
    expect(totalExpenses([])).toBe(0);
    expect(netCashFlow([])).toBe(0);
  });

  it("sums only matching transaction types", () => {
    const transactions = [
      txn({ type: "income", amount: 85000 }),
      txn({ type: "expense", amount: 12000 }),
      txn({ type: "expense", amount: 3000 }),
      txn({ type: "investment", amount: 10000 }),
      txn({ type: "transfer", amount: 5000 }),
    ];

    expect(totalIncome(transactions)).toBe(85000);
    expect(totalExpenses(transactions)).toBe(15000);
    expect(totalInvested(transactions)).toBe(10000);
    expect(netCashFlow(transactions)).toBe(70000);
  });

  it("excludes transfers from income and expenses even when large", () => {
    const transactions = [
      txn({ type: "income", amount: 1000 }),
      txn({ type: "transfer", amount: 500_000 }),
    ];

    expect(totalIncome(transactions)).toBe(1000);
    expect(totalExpenses(transactions)).toBe(0);
    expect(netCashFlow(transactions)).toBe(1000);
  });

  it("handles multiple same-day transactions", () => {
    const transactions = [
      txn({ type: "expense", amount: 100, transactionDate: "2026-03-05" }),
      txn({ type: "expense", amount: 250, transactionDate: "2026-03-05" }),
      txn({ type: "income", amount: 5000, transactionDate: "2026-03-05" }),
    ];

    expect(totalExpenses(transactions)).toBe(350);
    expect(netCashFlow(transactions)).toBe(4650);
  });

  it("handles large amounts without precision loss", () => {
    const transactions = [
      txn({ type: "income", amount: 99_999_999 }),
      txn({ type: "expense", amount: 1 }),
    ];

    expect(netCashFlow(transactions)).toBe(99_999_998);
  });
});

describe("expenseBreakdownByCategory", () => {
  it("returns an empty array for no expenses", () => {
    expect(expenseBreakdownByCategory([])).toEqual([]);
  });

  it("groups by category and computes percentages that sum to ~100", () => {
    const transactions = [
      txn({
        type: "expense",
        amount: 300,
        category: { id: "cat-food", name: "Food", icon: "utensils", color: "#f97316" },
      }),
      txn({
        type: "expense",
        amount: 100,
        category: { id: "cat-food", name: "Food", icon: "utensils", color: "#f97316" },
      }),
      txn({
        type: "expense",
        amount: 100,
        category: { id: "cat-rent", name: "Rent", icon: "home", color: "#ef4444" },
      }),
      // non-expense transactions must not leak into the breakdown
      txn({ type: "income", amount: 99999 }),
    ];

    const result = expenseBreakdownByCategory(transactions);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Food");
    expect(result[0].total).toBe(400);
    expect(result[0].percentage).toBeCloseTo(80);
    expect(result[1].name).toBe("Rent");
    expect(result[1].percentage).toBeCloseTo(20);
  });

  it("buckets transactions with no category under Uncategorized", () => {
    const result = expenseBreakdownByCategory([txn({ type: "expense", amount: 50 })]);
    expect(result[0].name).toBe("Uncategorized");
  });
});
