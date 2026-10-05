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
import { IconTile } from "@/components/shared/icon-tile";
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
  const isLiability = account.type === "credit_card" || account.type === "loan";

  return (
    <div className="surface group relative p-5 transition-[box-shadow,scale] duration-200 ease-out hover:shadow-raised has-[a:active]:scale-[0.99]">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/accounts/${account.id}`}
          className="focus-visible:ring-ring flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-4"
        >
          <IconTile icon={ACCOUNT_TYPE_ICON[account.type]} tone="primary" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-semibold">{account.name}</p>
              {!account.isActive && (
                <Badge variant="secondary" className="shrink-0">
                  Archived
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{ACCOUNT_TYPE_LABEL[account.type]}</p>
          </div>
        </Link>

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
            <DropdownMenuItem onClick={onEdit}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive}>
              {account.isActive ? (
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

      <Link href={`/accounts/${account.id}`} tabIndex={-1} className="mt-5 block outline-none">
        <p
          className={cn(
            "truncate text-2xl font-semibold",
            isLiability && balance < 0 && "text-expense"
          )}
        >
          {formatCurrency(balance)}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="text-income font-medium tabular-nums">+{formatCurrency(income)}</span>
          <span className="text-expense font-medium tabular-nums">-{formatCurrency(expenses)}</span>
          <span className="text-muted-foreground">this month</span>
        </div>
      </Link>
    </div>
  );
}
