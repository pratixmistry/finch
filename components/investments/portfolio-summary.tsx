"use client";

import { Landmark, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { portfolioSummary } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters/currency";
import type { Investment } from "@/types";

export function PortfolioSummary({
  investments,
  loading,
}: {
  investments: Investment[];
  loading: boolean;
}) {
  const { marketValue, costBasis, gainLoss, gainLossPercent } = portfolioSummary(investments);
  const isGain = gainLoss >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <KpiCard
        label="Invested"
        value={formatCurrency(costBasis)}
        icon={Wallet}
        tone="primary"
        loading={loading}
      />
      <KpiCard
        label="Market Value"
        value={formatCurrency(marketValue)}
        icon={Landmark}
        tone="investment"
        loading={loading}
      />
      <KpiCard
        label="Gain / Loss"
        value={`${isGain ? "+" : "-"}${formatCurrency(Math.abs(gainLoss))}`}
        icon={isGain ? TrendingUp : TrendingDown}
        tone={isGain ? "income" : "expense"}
        trend={{ percentage: gainLossPercent, direction: isGain ? "up" : gainLoss < 0 ? "down" : "flat" }}
        comparisonLabel="of invested amount"
        loading={loading}
      />
    </div>
  );
}
