import { describe, expect, it } from "vitest";
import { budgetProgress, currentPeriodRange } from "@/lib/calculations/budgets";
import type { Transaction } from "@/types";

function txn(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    userId: "user-1",
    accountId: "account-1",
    categoryId: "cat-groceries",
    transferAccountId: null,
    type: "expense",
    amount: 0,
    transactionDate: "2026-08-15",
    description: "",
    notes: null,
    createdAt: "2026-08-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("currentPeriodRange", () => {
  // Constructed from local y/m/d components (not an ISO string) so this
  // isn't sensitive to the test runner's timezone offset.
  const reference = new Date(2026, 7, 15);

  it("returns the calendar month for a monthly budget", () => {
    expect(currentPeriodRange("monthly", reference)).toEqual({
      from: "2026-08-01",
      to: "2026-08-31",
    });
  });

  it("returns the calendar quarter for a quarterly budget", () => {
    expect(currentPeriodRange("quarterly", reference)).toEqual({
      from: "2026-07-01",
      to: "2026-09-30",
    });
  });

  it("returns the calendar year for a yearly budget", () => {
    expect(currentPeriodRange("yearly", reference)).toEqual({
      from: "2026-01-01",
      to: "2026-12-31",
    });
  });
});

describe("budgetProgress", () => {
  const budget = { categoryId: "cat-groceries", amount: 5000, period: "monthly" as const };

  it("sums only expense transactions in the matching category within the current period", () => {
    const transactions = [
      txn({ amount: 1500, transactionDate: "2026-08-05" }),
      txn({ amount: 800, transactionDate: "2026-08-20" }),
      txn({ amount: 999, categoryId: "cat-other", transactionDate: "2026-08-10" }), // wrong category
      txn({ amount: 999, type: "income", transactionDate: "2026-08-10" }), // wrong type
      txn({ amount: 999, transactionDate: "2026-07-31" }), // outside period
    ];

    const progress = budgetProgress(budget, transactions);
    expect(progress.spent).toBe(2300);
    expect(progress.remaining).toBe(2700);
    expect(progress.isOverBudget).toBe(false);
  });

  it("flags overspend once spent exceeds the budget amount", () => {
    const transactions = [txn({ amount: 6000 })];
    const progress = budgetProgress(budget, transactions);
    expect(progress.isOverBudget).toBe(true);
    expect(progress.remaining).toBe(-1000);
    expect(progress.percentage).toBe(120);
  });

  it("percentage is 0 when nothing has been spent", () => {
    expect(budgetProgress(budget, []).percentage).toBe(0);
  });
});
