"use client";

import { ArrowDownCircle, ArrowUpCircle, Gem, Wallet2 } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { useDateRange } from "@/hooks/use-date-range";
import {
  accountBalance,
  netWorth,
  percentChange,
  totalBalance,
  totalExpenses,
  totalIncome,
} from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters/currency";
import { toISODateRange, type DateRangePreset } from "@/lib/date-range/presets";
import { KpiCard } from "./kpi-card";

const COMPARISON_LABEL: Record<DateRangePreset, string> = {
  today: "vs yesterday",
  "this-week": "vs last week",
  "this-month": "vs last month",
  "last-month": "vs prior month",
  "this-quarter": "vs last quarter",
  "this-year": "vs last year",
  "last-year": "vs prior year",
  custom: "vs previous period",
};

export function KpiSection() {
  const { preset, range, previousRange } = useDateRange();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  const { data: allTransactions, isLoading: allLoading } = useTransactionsForRange({});
  const { data: currentTxns, isLoading: currentLoading } = useTransactionsForRange(
    toISODateRange(range)
  );
  const { data: previousTxns, isLoading: previousLoading } = useTransactionsForRange(
    toISODateRange(previousRange)
  );

  const loading = accountsLoading || allLoading || currentLoading || previousLoading;

  const accountsList = accounts ?? [];
  const allTxnsList = allTransactions ?? [];

  const currentBalances = accountsList.map((account) => ({
    type: account.type,
    balance: accountBalance(account, allTxnsList),
  }));
  const previousCutoff = toISODateRange(previousRange).to;
  const previousBalances = accountsList.map((account) => ({
    type: account.type,
    balance: accountBalance(
      account,
      allTxnsList.filter((t) => t.transactionDate <= previousCutoff)
    ),
  }));

  const currentBalance = totalBalance(currentBalances);
  const previousBalanceValue = totalBalance(previousBalances);
  const currentNetWorth = netWorth(currentBalances);
  const previousNetWorth = netWorth(previousBalances);

  const income = totalIncome(currentTxns ?? []);
  const previousIncome = totalIncome(previousTxns ?? []);
  const expenses = totalExpenses(currentTxns ?? []);
  const previousExpenses = totalExpenses(previousTxns ?? []);

  const comparisonLabel = COMPARISON_LABEL[preset];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total Balance"
        value={formatCurrency(currentBalance)}
        icon={Wallet2}
        iconClassName="bg-primary/10 text-primary"
        trend={percentChange(currentBalance, previousBalanceValue)}
        comparisonLabel={comparisonLabel}
        loading={loading}
      />
      <KpiCard
        label="Income"
        value={formatCurrency(income)}
        icon={ArrowUpCircle}
        iconClassName="bg-income/10 text-income"
        trend={percentChange(income, previousIncome)}
        comparisonLabel={comparisonLabel}
        loading={loading}
      />
      <KpiCard
        label="Expenses"
        value={formatCurrency(expenses)}
        icon={ArrowDownCircle}
        iconClassName="bg-expense/10 text-expense"
        trend={percentChange(expenses, previousExpenses)}
        isGoodWhenUp={false}
        comparisonLabel={comparisonLabel}
        loading={loading}
      />
      <KpiCard
        label="Net Worth"
        value={formatCurrency(currentNetWorth)}
        icon={Gem}
        iconClassName="bg-primary/10 text-primary"
        trend={percentChange(currentNetWorth, previousNetWorth)}
        comparisonLabel={comparisonLabel}
        loading={loading}
      />
    </div>
  );
}
