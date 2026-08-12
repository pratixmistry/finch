import type { Investment, InvestmentAssetType } from "@/types";

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

export interface InvestmentMetrics {
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
}

export function investmentMetrics(
  investment: Pick<Investment, "quantity" | "averageBuyPrice" | "currentPrice">
): InvestmentMetrics {
  const marketValue = investment.quantity * investment.currentPrice;
  const costBasis = investment.quantity * investment.averageBuyPrice;
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
