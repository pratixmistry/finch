"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ChartCard } from "@/components/dashboard/chart-card";
import { ASSET_TYPE_LABEL } from "./investment-asset-icon";
import { allocationByAssetType } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters/currency";
import type { Investment, InvestmentAssetType } from "@/types";

const ASSET_TYPE_COLOR: Record<InvestmentAssetType, string> = {
  stock: "#6366f1",
  mutual_fund: "#22c55e",
  etf: "#06b6d4",
  crypto: "#f59e0b",
  fixed_deposit: "#8b5cf6",
  bond: "#ec4899",
  other: "#64748b",
};

export function AllocationChart({ investments, isLoading }: { investments: Investment[]; isLoading: boolean }) {
  const allocation = allocationByAssetType(investments);
  const total = allocation.reduce((sum, e) => sum + e.value, 0);

  return (
    <ChartCard title="Allocation" description="By asset type, current market value">
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : allocation.length === 0 ? (
        <EmptyState
          icon={PieChartIcon}
          title="No holdings yet"
          className="h-64 justify-center border-none py-0"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-52 w-52 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="assetType"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {allocation.map((entry) => (
                    <Cell key={entry.assetType} fill={ASSET_TYPE_COLOR[entry.assetType]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const entry = payload[0].payload as (typeof allocation)[number];
                    return (
                      <div className="bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-xs shadow-md">
                        <p className="font-medium">{ASSET_TYPE_LABEL[entry.assetType]}</p>
                        <p className="text-muted-foreground tabular-nums">
                          {formatCurrency(entry.value)} · {entry.percentage.toFixed(1)}%
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-[11px]">Total</p>
              <p className="text-sm font-semibold tabular-nums">{formatCurrency(total)}</p>
            </div>
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-1.5">
            {allocation.map((entry) => (
              <li key={entry.assetType} className="flex items-center gap-2 px-1.5 py-1 text-xs">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: ASSET_TYPE_COLOR[entry.assetType] }}
                />
                <span className="min-w-0 flex-1 truncate">{ASSET_TYPE_LABEL[entry.assetType]}</span>
                <span className="text-muted-foreground shrink-0 tabular-nums">
                  {entry.percentage.toFixed(0)}%
                </span>
                <span className="w-20 shrink-0 text-right font-medium tabular-nums">
                  {formatCurrency(entry.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
