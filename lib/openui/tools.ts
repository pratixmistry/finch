/**
 * The agent's tools. They are read-only and run on the server with the
 * signed-in user's Supabase session, so row-level security scopes every query
 * to that user. Writes never go through the model — see TransactionDraft.
 *
 * Each tool is a thin wrapper over the existing query and calculation layer,
 * returning small, already-aggregated JSON the model can drop into components.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { tool } from "ai";
import { z } from "zod/v4";
import {
  accountBalance,
  allocationByAssetType,
  budgetProgress,
  buildCashFlowSeries,
  CASH_FLOW_BUCKET_LIMIT,
  currentPeriodRange,
  expenseBreakdownByCategory,
  investmentMetrics,
  netWorth,
  percentChange,
  portfolioSummary,
  totalBalance,
  totalExpenses,
  totalIncome,
  totalLiabilities,
} from "@/lib/calculations";
import { getDateRangeForPreset, getPreviousPeriod, toISODateRange } from "@/lib/date-range/presets";
import { getAccounts } from "@/lib/queries/accounts";
import { getBudgets } from "@/lib/queries/budgets";
import { getCategories } from "@/lib/queries/categories";
import { getInvestments } from "@/lib/queries/investments";
import { getTransactionsForRange } from "@/lib/queries/transactions";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const PERIODS = ["this-month", "last-month", "this-quarter", "this-year", "last-year"] as const;

const periodInput = {
  period: z
    .enum(PERIODS)
    .optional()
    .describe("Calendar period. Defaults to this-month. Ignored when from and to are given."),
  from: z.string().optional().describe("Custom range start, YYYY-MM-DD. Use together with to."),
  to: z.string().optional().describe("Custom range end, YYYY-MM-DD. Use together with from."),
};

function resolvePeriod(input: { period?: (typeof PERIODS)[number]; from?: string; to?: string }) {
  if (input.from && input.to) {
    const range = { from: new Date(`${input.from}T00:00:00`), to: new Date(`${input.to}T00:00:00`) };
    return {
      label: `${input.from} to ${input.to}`,
      current: { from: input.from, to: input.to },
      previous: toISODateRange(getPreviousPeriod(range, "custom")),
    };
  }
  const preset = input.period ?? "this-month";
  const range = getDateRangeForPreset(preset);
  return {
    label: preset,
    current: toISODateRange(range),
    previous: toISODateRange(getPreviousPeriod(range, preset)),
  };
}

const round = (value: number) => Math.round(value * 100) / 100;

export function createFinchTools(supabase: Client, context: { currency: string }) {
  const { currency } = context;

  async function accountsWithBalances() {
    const [accounts, transactions] = await Promise.all([
      getAccounts(supabase),
      getTransactionsForRange(supabase, {}),
    ]);
    return accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: round(accountBalance(account, transactions)),
    }));
  }

  return {
    get_overview: tool({
      description:
        "Headline figures: total balance, liabilities and net worth today, plus income, expenses and savings for a period compared with the period before it. Start here for broad questions like 'how am I doing?'.",
      inputSchema: z.object(periodInput),
      execute: async (input) => {
        const period = resolvePeriod(input);
        const [accounts, current, previous] = await Promise.all([
          accountsWithBalances(),
          getTransactionsForRange(supabase, period.current),
          getTransactionsForRange(supabase, period.previous),
        ]);
        const income = totalIncome(current);
        const expenses = totalExpenses(current);
        const previousIncome = totalIncome(previous);
        const previousExpenses = totalExpenses(previous);
        return {
          currency,
          period: { label: period.label, ...period.current },
          totalBalance: round(totalBalance(accounts)),
          totalLiabilities: round(totalLiabilities(accounts)),
          netWorth: round(netWorth(accounts)),
          accountCount: accounts.length,
          income: round(income),
          expenses: round(expenses),
          savings: round(income - expenses),
          transactionCount: current.length,
          comparedWithPreviousPeriod: {
            ...period.previous,
            income: round(previousIncome),
            expenses: round(previousExpenses),
            incomeChange: percentChange(income, previousIncome),
            expensesChange: percentChange(expenses, previousExpenses),
          },
        };
      },
    }),

    list_accounts: tool({
      description:
        "Every active account with its id, type and current balance. Call this before emitting a TransactionDraft so accountId is real.",
      inputSchema: z.object({}),
      execute: async () => ({ currency, accounts: await accountsWithBalances() }),
    }),

    list_categories: tool({
      description:
        "Active categories with id, icon and color. Call this before emitting a TransactionDraft for an expense or income so categoryId is real.",
      inputSchema: z.object({
        type: z.enum(["expense", "income"]).optional().describe("Limit to one kind."),
      }),
      execute: async ({ type }) => {
        const categories = await getCategories(supabase, { type });
        return {
          categories: categories.map(({ id, name, type: kind, icon, color }) => ({
            id,
            name,
            type: kind,
            icon,
            color,
          })),
        };
      },
    }),

    list_transactions: tool({
      description:
        "Individual transactions, newest first, optionally filtered by period, type, account, category or a description search. Returns at most `limit` rows plus the total match count.",
      inputSchema: z.object({
        ...periodInput,
        type: z.enum(["income", "expense", "investment", "transfer"]).optional(),
        accountId: z.string().optional(),
        categoryId: z.string().optional(),
        search: z.string().optional().describe("Text to find in the description."),
        limit: z.number().int().min(1).max(50).optional().describe("Defaults to 20."),
      }),
      execute: async ({ type, accountId, categoryId, search, limit, ...rest }) => {
        const period = resolvePeriod(rest);
        const transactions = await getTransactionsForRange(supabase, {
          ...period.current,
          type,
          accountId,
          categoryId,
          search,
        });
        return {
          currency,
          period: { label: period.label, ...period.current },
          totalMatches: transactions.length,
          transactions: transactions.slice(0, limit ?? 20).map((txn) => ({
            id: txn.id,
            date: txn.transactionDate,
            type: txn.type,
            amount: txn.amount,
            description: txn.description,
            category: txn.category?.name ?? null,
            account: txn.account?.name ?? null,
            transferTo: txn.transferAccount?.name ?? null,
          })),
        };
      },
    }),

    get_spending_by_category: tool({
      description:
        "Expenses for a period grouped by category, largest first, with each category's icon, color and share of the total.",
      inputSchema: z.object(periodInput),
      execute: async (input) => {
        const period = resolvePeriod(input);
        const transactions = await getTransactionsForRange(supabase, period.current);
        const breakdown = expenseBreakdownByCategory(transactions);
        return {
          currency,
          period: { label: period.label, ...period.current },
          totalExpenses: round(totalExpenses(transactions)),
          categories: breakdown.map((entry) => ({
            name: entry.name,
            amount: round(entry.total),
            percentage: round(entry.percentage),
            icon: entry.icon,
            // Uncategorized spending falls back to a CSS variable, which the
            // model cannot use as a component color.
            color: entry.color.startsWith("#") ? entry.color : null,
          })),
        };
      },
    }),

    get_cash_flow: tool({
      description:
        "Income, expenses and net savings over time, bucketed by month, quarter or year. Use for trends and comparisons across periods.",
      inputSchema: z.object({
        granularity: z.enum(["month", "quarter", "year"]).optional().describe("Defaults to month."),
      }),
      execute: async ({ granularity = "month" }) => {
        const transactions = await getTransactionsForRange(supabase, {});
        const series = buildCashFlowSeries(transactions, granularity).slice(
          -CASH_FLOW_BUCKET_LIMIT[granularity]
        );
        return {
          currency,
          granularity,
          periods: series.map((point) => ({
            label: point.label,
            income: round(point.income),
            expenses: round(point.expense),
            savings: round(point.net),
          })),
        };
      },
    }),

    list_budgets: tool({
      description:
        "Every budget with its limit, amount spent in the current period, amount remaining, and the category's icon and color.",
      inputSchema: z.object({}),
      execute: async () => {
        const [budgets, transactions] = await Promise.all([
          getBudgets(supabase),
          getTransactionsForRange(supabase, {}),
        ]);
        return {
          currency,
          budgets: budgets.map((budget) => {
            const progress = budgetProgress(budget, transactions);
            return {
              category: budget.category?.name ?? "Uncategorized",
              icon: budget.category?.icon ?? null,
              color: budget.category?.color ?? null,
              period: budget.period,
              currentPeriod: currentPeriodRange(budget.period),
              limit: budget.amount,
              spent: round(progress.spent),
              remaining: round(progress.remaining),
              isOverBudget: progress.isOverBudget,
            };
          }),
        };
      },
    }),

    list_investments: tool({
      description:
        "Investment holdings with market value, cost and gain or loss, plus portfolio totals and allocation by asset type.",
      inputSchema: z.object({}),
      execute: async () => {
        const investments = await getInvestments(supabase);
        const summary = portfolioSummary(investments);
        return {
          currency,
          summary: {
            invested: round(summary.costBasis),
            marketValue: round(summary.marketValue),
            gainLoss: round(summary.gainLoss),
            gainLossPercent: round(summary.gainLossPercent),
          },
          allocation: allocationByAssetType(investments).map((entry) => ({
            assetType: entry.assetType,
            value: round(entry.value),
            percentage: round(entry.percentage),
          })),
          holdings: investments.map((investment) => {
            const metrics = investmentMetrics(investment);
            return {
              name: investment.name,
              assetType: investment.assetType,
              symbol: investment.symbol,
              quantity: investment.quantity,
              currentPrice: investment.currentPrice,
              marketValue: round(metrics.marketValue),
              gainLoss: round(metrics.gainLoss),
              gainLossPercent: round(metrics.gainLossPercent),
            };
          }),
        };
      },
    }),
  };
}
