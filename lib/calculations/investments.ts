import { addMonths, differenceInCalendarMonths } from "date-fns";
import type { Investment, InvestmentAssetType } from "@/types";
import { toInputDate } from "@/lib/formatters/date";

// A sell doesn't change the average buy price of what's left — only a buy
// (adding a new lot) shifts the weighted average.
export function applyInvestmentTxn(
  current: { quantity: number; averageBuyPrice: number },
  txn: { type: "buy" | "sell"; quantity: number; price: number }
): { quantity: number; averageBuyPrice: number } {
  if (txn.type === "buy") {
    const quantity = current.quantity + txn.quantity;
    const averageBuyPrice =
      quantity > 0
        ? (current.quantity * current.averageBuyPrice + txn.quantity * txn.price) / quantity
        : 0;
    return { quantity, averageBuyPrice };
  }
  const quantity = Math.max(0, current.quantity - txn.quantity);
  return { quantity, averageBuyPrice: quantity > 0 ? current.averageBuyPrice : 0 };
}

// Standard recurring-deposit maturity formula (quarterly compounding, the
// convention Indian banks use): M = R * [(1+i)^n - 1] / (1 - (1+i)^(-1/3))
// where R is the monthly installment, i the quarterly rate, and n the number
// of quarters. Also used to project the value accrued so far by passing the
// elapsed months in place of the full tenure.
export function rdMaturityValue(monthlyAmount: number, annualRatePercent: number, tenureMonths: number): number {
  if (monthlyAmount <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePercent <= 0) return monthlyAmount * tenureMonths;
  const i = annualRatePercent / 100 / 4;
  const n = tenureMonths / 3;
  return (monthlyAmount * (Math.pow(1 + i, n) - 1)) / (1 - Math.pow(1 + i, -1 / 3));
}

export interface RdProgress {
  elapsedMonths: number;
  remainingMonths: number;
  depositedAmount: number;
  currentValue: number;
  maturityValue: number;
  maturityDate: string;
  isMatured: boolean;
}

export function rdProgress(
  rd: { monthlyAmount: number; annualRatePercent: number; tenureMonths: number; startDate: string },
  asOf: Date = new Date()
): RdProgress {
  const start = new Date(`${rd.startDate}T00:00:00`);
  const elapsedMonths = Math.min(rd.tenureMonths, Math.max(0, differenceInCalendarMonths(asOf, start)));
  const depositedAmount = rd.monthlyAmount * elapsedMonths;
  const maturityValue = rdMaturityValue(rd.monthlyAmount, rd.annualRatePercent, rd.tenureMonths);
  const currentValue = Math.max(
    depositedAmount,
    rdMaturityValue(rd.monthlyAmount, rd.annualRatePercent, elapsedMonths)
  );
  return {
    elapsedMonths,
    remainingMonths: rd.tenureMonths - elapsedMonths,
    depositedAmount,
    currentValue,
    maturityValue,
    maturityDate: toInputDate(addMonths(start, rd.tenureMonths)),
    isMatured: elapsedMonths >= rd.tenureMonths,
  };
}

function rdProgressForInvestment(
  investment: Pick<Investment, "rdMonthlyAmount" | "rdInterestRate" | "rdTenureMonths" | "rdStartDate">
): RdProgress | null {
  const { rdMonthlyAmount, rdInterestRate, rdTenureMonths, rdStartDate } = investment;
  if (!rdMonthlyAmount || rdInterestRate === null || !rdTenureMonths || !rdStartDate) return null;
  return rdProgress({
    monthlyAmount: rdMonthlyAmount,
    annualRatePercent: rdInterestRate,
    tenureMonths: rdTenureMonths,
    startDate: rdStartDate,
  });
}

export interface InvestmentMetrics {
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
}

export function investmentMetrics(
  investment: Pick<
    Investment,
    "assetType" | "quantity" | "averageBuyPrice" | "currentPrice" | "rdMonthlyAmount" | "rdInterestRate" | "rdTenureMonths" | "rdStartDate"
  >
): InvestmentMetrics {
  const rd = investment.assetType === "recurring_deposit" ? rdProgressForInvestment(investment) : null;
  const marketValue = rd ? rd.currentValue : investment.quantity * investment.currentPrice;
  const costBasis = rd ? rd.depositedAmount : investment.quantity * investment.averageBuyPrice;
  const gainLoss = marketValue - costBasis;
  return {
    marketValue,
    costBasis,
    gainLoss,
    gainLossPercent: costBasis > 0 ? (gainLoss / costBasis) * 100 : 0,
  };
}

export interface PortfolioSummary {
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
}

export function portfolioSummary(investments: Investment[]): PortfolioSummary {
  const totals = investments.reduce(
    (acc, inv) => {
      const m = investmentMetrics(inv);
      return { marketValue: acc.marketValue + m.marketValue, costBasis: acc.costBasis + m.costBasis };
    },
    { marketValue: 0, costBasis: 0 }
  );
  const gainLoss = totals.marketValue - totals.costBasis;
  return {
    ...totals,
    gainLoss,
    gainLossPercent: totals.costBasis > 0 ? (gainLoss / totals.costBasis) * 100 : 0,
  };
}

export interface AllocationEntry {
  assetType: InvestmentAssetType;
  value: number;
  percentage: number;
}

export function allocationByAssetType(investments: Investment[]): AllocationEntry[] {
  const byType = new Map<InvestmentAssetType, number>();
  for (const inv of investments) {
    const value = investmentMetrics(inv).marketValue;
    byType.set(inv.assetType, (byType.get(inv.assetType) ?? 0) + value);
  }
  const total = Array.from(byType.values()).reduce((sum, v) => sum + v, 0);
  return Array.from(byType.entries())
    .map(([assetType, value]) => ({
      assetType,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}
