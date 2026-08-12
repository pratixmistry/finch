"use client";

import { Landmark, TrendingDown, TrendingUp, Wallet2 } from "lucide-react";
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiCard
        label="Invested"
        value={formatCurrency(costBasis)}
        icon={Wallet2}
        iconClassName="bg-primary/10 text-primary"
        loading={loading}
      />
      <KpiCard
        label="Market Value"
        value={formatCurrency(marketValue)}
        icon={Landmark}
        iconClassName="bg-investment/10 text-investment"
        loading={loading}
      />
      <KpiCard
        label="Gain / Loss"
        value={`${isGain ? "+" : "-"}${formatCurrency(Math.abs(gainLoss))}`}
        icon={isGain ? TrendingUp : TrendingDown}
        iconClassName={isGain ? "bg-income/10 text-income" : "bg-expense/10 text-expense"}
        trend={{ percentage: gainLossPercent, direction: isGain ? "up" : gainLoss < 0 ? "down" : "flat" }}
        comparisonLabel="of invested amount"
        loading={loading}
      />
    </div>
  );
}
