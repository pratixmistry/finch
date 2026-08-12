import type { Account, AccountType, Transaction } from "@/types";

export const LIABILITY_ACCOUNT_TYPES: readonly AccountType[] = [
  "credit_card",
  "loan",
];

export function isLiabilityAccountType(type: AccountType): boolean {
  return (LIABILITY_ACCOUNT_TYPES as AccountType[]).includes(type);
}

// A single account's running balance: opening balance plus every transaction
// that touches it. Income adds, expense/investment subtract (money leaving
// the account). Transfers net out per-account so the two legs of a transfer
// always sum to zero across the accounts involved — transfers never change
// the sum of all balances, only which account holds the money.
//
// Liability accounts (credit card, loan) use the same formula: an expense
// charged to a credit card pushes its balance further negative, which is the
// correct representation of "amount owed" — no separate sign-flip needed.
export function accountBalance(
  account: Pick<Account, "id" | "openingBalance">,
  transactions: Pick<
    Transaction,
    "accountId" | "transferAccountId" | "type" | "amount"
  >[]
): number {
  return transactions.reduce((balance, txn) => {
    if (txn.type === "transfer") {
      if (txn.accountId === account.id) return balance - txn.amount;
      if (txn.transferAccountId === account.id) return balance + txn.amount;
      return balance;
    }

    if (txn.accountId !== account.id) return balance;

    return txn.type === "income" ? balance + txn.amount : balance - txn.amount;
  }, account.openingBalance);
}

export interface AccountWithBalance {
  type: AccountType;
  balance: number;
}

// Sum of every non-liability account — the "you have this much money" figure.
export function totalBalance(accounts: AccountWithBalance[]): number {
  return accounts
    .filter((a) => !isLiabilityAccountType(a.type))
    .reduce((sum, a) => sum + a.balance, 0);
}

// Sum of what's owed across credit cards and loans, always >= 0. A liability
// account with a positive balance (e.g. a credit card in credit) contributes
// nothing here — it isn't debt.
export function totalLiabilities(accounts: AccountWithBalance[]): number {
  return accounts
    .filter((a) => isLiabilityAccountType(a.type))
    .reduce((sum, a) => sum + Math.max(-a.balance, 0), 0);
}

// Net Worth = Assets - Liabilities. Investment holdings (beyond the cash
// sitting in an "investment" type account) are added on top once the
// Investments module ships in Phase 2.
export function netWorth(accounts: AccountWithBalance[]): number {
  return totalBalance(accounts) - totalLiabilities(accounts);
}
