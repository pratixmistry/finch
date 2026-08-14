import type { Database } from "@/types/database";
import type { Account, Budget, Category, Investment, Profile, Transaction } from "@/types";

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"] & {
  category?: Pick<CategoryRow, "id" | "name" | "icon" | "color"> | null;
};
type InvestmentRow = Database["public"]["Tables"]["investments"]["Row"] & {
  account?: Pick<AccountRow, "id" | "name"> | null;
};
type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"] & {
  account?: Pick<AccountRow, "id" | "name" | "type"> | null;
  category?: Pick<CategoryRow, "id" | "name" | "icon" | "color"> | null;
  transfer_account?: Pick<AccountRow, "id" | "name"> | null;
};

export function mapAccount(row: AccountRow): Account {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    currency: row.currency,
    openingBalance: Number(row.opening_balance),
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    color: row.color,
    isActive: row.is_active,
    isDefault: row.is_default,
  };
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    currency: row.currency,
    timezone: row.timezone,
    dateFormat: row.date_format,
    weekStartDay: row.week_start_day,
  };
}

export function mapBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    amount: Number(row.amount),
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    category: row.category ?? undefined,
  };
}

export function mapInvestment(row: InvestmentRow): Investment {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    name: row.name,
    assetType: row.asset_type,
    symbol: row.symbol,
    quantity: Number(row.quantity),
    averageBuyPrice: Number(row.average_buy_price),
    currentPrice: Number(row.current_price),
    rdMonthlyAmount: row.rd_monthly_amount === null ? null : Number(row.rd_monthly_amount),
    rdInterestRate: row.rd_interest_rate === null ? null : Number(row.rd_interest_rate),
    rdTenureMonths: row.rd_tenure_months,
    rdStartDate: row.rd_start_date,
    isActive: row.is_active,
    account: row.account ?? undefined,
  };
}

export function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    categoryId: row.category_id,
    transferAccountId: row.transfer_account_id,
    type: row.type,
    amount: Number(row.amount),
    transactionDate: row.transaction_date,
    description: row.description,
    notes: row.notes,
    createdAt: row.created_at,
    account: row.account ?? undefined,
    category: row.category ?? undefined,
    transferAccount: row.transfer_account ?? undefined,
  };
}
