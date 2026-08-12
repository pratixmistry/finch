import { describe, expect, it } from "vitest";
import {
  accountBalance,
  isLiabilityAccountType,
  netWorth,
  totalBalance,
  totalLiabilities,
} from "@/lib/calculations/accounts";
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

describe("accountBalance", () => {
  const account = { id: "acc-1", openingBalance: 1000 };

  it("returns the opening balance when there are zero transactions", () => {
    expect(accountBalance(account, [])).toBe(1000);
  });

  it("adds income and subtracts expense/investment", () => {
    const transactions = [
      txn({ accountId: "acc-1", type: "income", amount: 500 }),
      txn({ accountId: "acc-1", type: "expense", amount: 200 }),
      txn({ accountId: "acc-1", type: "investment", amount: 100 }),
    ];
    // 1000 + 500 - 200 - 100
    expect(accountBalance(account, transactions)).toBe(1200);
  });

  it("ignores transactions belonging to other accounts", () => {
    const transactions = [txn({ accountId: "some-other-account", type: "income", amount: 99999 })];
    expect(accountBalance(account, transactions)).toBe(1000);
  });

  it("subtracts the outgoing leg and adds the incoming leg of a transfer", () => {
    const outgoing = txn({
      accountId: "acc-1",
      transferAccountId: "acc-2",
      type: "transfer",
      amount: 300,
    });
    expect(accountBalance(account, [outgoing])).toBe(700);

    const incoming = txn({
      accountId: "acc-2",
      transferAccountId: "acc-1",
      type: "transfer",
      amount: 300,
    });
    expect(accountBalance(account, [incoming])).toBe(1300);
  });

  it("keeps the sum of both legs of a transfer conserved across two accounts", () => {
    const accA = { id: "acc-a", openingBalance: 5000 };
    const accB = { id: "acc-b", openingBalance: 2000 };
    const transfer = txn({
      accountId: "acc-a",
      transferAccountId: "acc-b",
      type: "transfer",
      amount: 1500,
    });

    const balanceA = accountBalance(accA, [transfer]);
    const balanceB = accountBalance(accB, [transfer]);

    expect(balanceA + balanceB).toBe(accA.openingBalance + accB.openingBalance);
  });

  it("handles a negative opening balance (e.g. a credit card already in debt)", () => {
    const creditCard = { id: "cc-1", openingBalance: -2000 };
    const expense = txn({ accountId: "cc-1", type: "expense", amount: 500 });
    expect(accountBalance(creditCard, [expense])).toBe(-2500);
  });
});

describe("liability helpers / netWorth", () => {
  it("classifies credit_card and loan as liabilities, everything else as assets", () => {
    expect(isLiabilityAccountType("credit_card")).toBe(true);
    expect(isLiabilityAccountType("loan")).toBe(true);
    expect(isLiabilityAccountType("bank")).toBe(false);
    expect(isLiabilityAccountType("cash")).toBe(false);
    expect(isLiabilityAccountType("investment")).toBe(false);
  });

  it("totalBalance sums only non-liability accounts", () => {
    const accounts = [
      { type: "bank" as const, balance: 50000 },
      { type: "cash" as const, balance: 3000 },
      { type: "credit_card" as const, balance: -4000 },
    ];
    expect(totalBalance(accounts)).toBe(53000);
  });

  it("totalLiabilities sums only the owed (negative) portion of liability accounts", () => {
    const accounts = [
      { type: "credit_card" as const, balance: -4000 },
      { type: "loan" as const, balance: -200000 },
      { type: "bank" as const, balance: 50000 },
    ];
    expect(totalLiabilities(accounts)).toBe(204000);
  });

  it("a liability account in credit (positive balance) contributes zero debt", () => {
    const accounts = [{ type: "credit_card" as const, balance: 500 }];
    expect(totalLiabilities(accounts)).toBe(0);
  });

  it("netWorth = assets - liabilities", () => {
    const accounts = [
      { type: "bank" as const, balance: 100000 },
      { type: "cash" as const, balance: 5000 },
      { type: "credit_card" as const, balance: -15000 },
      { type: "loan" as const, balance: -300000 },
    ];
    // (100000 + 5000) - (15000 + 300000)
    expect(netWorth(accounts)).toBe(-210000);
  });

  it("netWorth is zero for no accounts", () => {
    expect(netWorth([])).toBe(0);
  });
});
