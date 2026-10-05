"use client";

import {
  ArchiveRestore,
  Archive as ArchiveIcon,
  MinusCircle,
  MoreHorizontal,
  Pencil,
  PlusCircle,
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
import { IconTile } from "@/components/shared/icon-tile";
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
    <div className="surface p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={ASSET_TYPE_ICON[investment.assetType]} tone="investment" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-semibold">{investment.name}</p>
              {!investment.isActive && (
                <Badge variant="secondary" className="shrink-0">
                  Archived
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground truncate text-sm">
              {ASSET_TYPE_LABEL[investment.assetType]}
              {investment.symbol && ` · ${investment.symbol}`}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground -mt-1 -mr-2 shrink-0"
              aria-label="More options"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isRd && (
              <>
                <DropdownMenuItem onClick={onLogBuy}>
                  <PlusCircle />
                  Log buy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogSell} disabled={investment.quantity <= 0}>
                  <MinusCircle />
                  Log sell
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={onEdit}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive}>
              {investment.isActive ? (
                <>
                  <ArchiveIcon />
                  Archive
                </>
              ) : (
                <>
                  <ArchiveRestore />
                  Unarchive
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5">
        <p className="truncate text-2xl font-semibold">{formatCurrency(marketValue)}</p>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
          <span
            className={cn(
              "flex items-center gap-1 font-medium tabular-nums",
              isGain ? "text-income" : "text-expense"
            )}
          >
            {isGain ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            {formatCurrency(Math.abs(gainLoss))} ({Math.abs(gainLossPercent).toFixed(1)}%)
          </span>
          {!rd && (
            <span className="text-muted-foreground tabular-nums">
              {investment.quantity} @ {formatCurrency(investment.currentPrice)}
            </span>
          )}
        </div>
      </div>

      {rd && (
        <div className="mt-4 space-y-2">
          <Progress value={(rd.elapsedMonths / (rd.elapsedMonths + rd.remainingMonths)) * 100} />
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-xs tabular-nums">
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
