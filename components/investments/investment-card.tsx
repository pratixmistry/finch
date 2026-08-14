"use client";

import {
  ArchiveRestore,
  Archive as ArchiveIcon,
  MoreHorizontal,
  Pencil,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ASSET_TYPE_ICON, ASSET_TYPE_LABEL } from "./investment-asset-icon";
import { investmentMetrics, rdProgress } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatMonthYear } from "@/lib/formatters/date";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Investment } from "@/types";

export function InvestmentCard({
  investment,
  onEdit,
  onLogBuy,
  onLogSell,
  onToggleActive,
}: {
  investment: Investment;
  onEdit: () => void;
  onLogBuy: () => void;
  onLogSell: () => void;
  onToggleActive: () => void;
}) {
  const Icon = ASSET_TYPE_ICON[investment.assetType];
  const { marketValue, gainLoss, gainLossPercent } = investmentMetrics(investment);
  const isGain = gainLoss >= 0;
  const isRd = investment.assetType === "recurring_deposit";
  const rd =
    isRd && investment.rdMonthlyAmount && investment.rdInterestRate !== null && investment.rdTenureMonths && investment.rdStartDate
      ? rdProgress({
          monthlyAmount: investment.rdMonthlyAmount,
          annualRatePercent: investment.rdInterestRate,
          tenureMonths: investment.rdTenureMonths,
          startDate: investment.rdStartDate,
        })
      : null;

  return (
    <div className="bg-card rounded-xl p-4 shadow-xs ring-1 ring-foreground/10 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-investment/10 text-investment flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold">{investment.name}</p>
              {!investment.isActive && (
                <Badge variant="secondary" className="h-4 shrink-0 px-1.5 text-[10px]">
                  Archived
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {ASSET_TYPE_LABEL[investment.assetType]}
              {investment.symbol && ` · ${investment.symbol}`}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label="More options">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isRd && (
              <>
                <DropdownMenuItem onClick={onLogBuy}>Log buy</DropdownMenuItem>
                <DropdownMenuItem onClick={onLogSell} disabled={investment.quantity <= 0}>
                  Log sell
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive}>
              {investment.isActive ? (
                <>
                  <ArchiveIcon className="size-4" />
                  Archive
                </>
              ) : (
                <>
                  <ArchiveRestore className="size-4" />
                  Unarchive
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{formatCurrency(marketValue)}</p>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={cn("flex items-center gap-1 font-medium", isGain ? "text-income" : "text-expense")}>
            {isGain ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {formatCurrency(Math.abs(gainLoss))} ({Math.abs(gainLossPercent).toFixed(1)}%)
          </span>
          {!rd && (
            <span className="text-muted-foreground">
              {investment.quantity} @ {formatCurrency(investment.currentPrice)}
            </span>
          )}
        </div>
      </div>

      {rd && (
        <div className="mt-3 space-y-1.5">
          <Progress value={(rd.elapsedMonths / (rd.elapsedMonths + rd.remainingMonths)) * 100} className="h-1.5" />
          <div className="text-muted-foreground flex items-center justify-between text-[11px]">
            <span>
              {formatCurrency(investment.rdMonthlyAmount ?? 0)}/mo · {rd.elapsedMonths}/{rd.elapsedMonths + rd.remainingMonths} mo
            </span>
            <span>
              {rd.isMatured ? "Matured" : `Matures ${formatMonthYear(rd.maturityDate)}`} ·{" "}
              {formatCurrency(rd.maturityValue)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
