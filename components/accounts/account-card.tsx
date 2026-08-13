"use client";

import Link from "next/link";
import { ArchiveRestore, Archive as ArchiveIcon, MoreHorizontal, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/formatters/currency";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPE_ICON, ACCOUNT_TYPE_LABEL } from "./account-type-icon";
import type { Account } from "@/types";

export function AccountCard({
  account,
  balance,
  income,
  expenses,
  onEdit,
  onToggleActive,
}: {
  account: Account;
  balance: number;
  income: number;
  expenses: number;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const Icon = ACCOUNT_TYPE_ICON[account.type];
  const isLiability = account.type === "credit_card" || account.type === "loan";

  return (
    <div className="bg-card group relative rounded-xl border p-4 transition-shadow hover:shadow-sm sm:p-5">
      <div className="flex items-start justify-between">
        <Link href={`/accounts/${account.id}`} className="flex min-w-0 items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold">{account.name}</p>
              {!account.isActive && (
                <Badge variant="secondary" className="h-4 shrink-0 px-1.5 text-[10px]">
                  Archived
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs">{ACCOUNT_TYPE_LABEL[account.type]}</p>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive}>
              {account.isActive ? (
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

      <Link href={`/accounts/${account.id}`} className="mt-4 block">
        <p
          className={cn(
            "text-2xl font-semibold tracking-tight tabular-nums",
            isLiability && balance < 0 && "text-expense"
          )}
        >
          {formatCurrency(balance)}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs">
          <span className="text-income flex items-center gap-1 font-medium">
            +{formatCurrency(income)}
          </span>
          <span className="text-expense flex items-center gap-1 font-medium">
            -{formatCurrency(expenses)}
          </span>
          <span className="text-muted-foreground">this month</span>
        </div>
      </Link>
    </div>
  );
}
