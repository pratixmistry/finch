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
import { investmentMetrics } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters/currency";
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
            <DropdownMenuItem onClick={onLogBuy}>Log buy</DropdownMenuItem>
            <DropdownMenuItem onClick={onLogSell} disabled={investment.quantity <= 0}>
              Log sell
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
          <span className="text-muted-foreground">
            {investment.quantity} @ {formatCurrency(investment.currentPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
