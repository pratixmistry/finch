// Domain types used throughout the app. These mirror the `Row` shapes in
// types/database.ts but with Postgres `numeric` columns parsed to `number` —
// the parsing happens once, at the query layer (lib/queries), so components
// never juggle numeric strings.

import type {
  AccountType,
  BudgetPeriod,
  CategoryType,
  InvestmentAssetType,
  InvestmentTxnType,
  TransactionType,
} from "./database";

export type {
  AccountType,
  BudgetPeriod,
  CategoryType,
  InvestmentAssetType,
  InvestmentTxnType,
  TransactionType,
};

export interface Profile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  currency: string;
  timezone: string;
  dateFormat: string;
  weekStartDay: number;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: number;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  transferAccountId: string | null;
  type: TransactionType;
  amount: number;
  transactionDate: string;
  description: string;
  notes: string | null;
  createdAt: string;
  // populated by joined queries; undefined when not selected
  account?: Pick<Account, "id" | "name" | "type">;
  category?: Pick<Category, "id" | "name" | "icon" | "color"> | null;
  transferAccount?: Pick<Account, "id" | "name"> | null;
}

export interface Investment {
  id: string;
  userId: string;
  accountId: string;
  name: string;
  assetType: InvestmentAssetType;
  symbol: string | null;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  // Recurring deposit only — null for every other asset type.
  rdMonthlyAmount: number | null;
  rdInterestRate: number | null;
  rdTenureMonths: number | null;
  rdStartDate: string | null;
  isActive: boolean;
  account?: Pick<Account, "id" | "name">;
}

export interface InvestmentTransaction {
  id: string;
  userId: string;
  investmentId: string;
  type: InvestmentTxnType;
  quantity: number;
  price: number;
  fees: number;
  transactionDate: string;
  notes: string | null;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string | null;
  category?: Pick<Category, "id" | "name" | "icon" | "color">;
}
