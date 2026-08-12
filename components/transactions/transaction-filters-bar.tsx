"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useTransactionFilters } from "@/hooks/use-transaction-filters";
import { TRANSACTION_TYPE_OPTIONS } from "@/lib/validations/transaction";

export function TransactionFiltersBar() {
  const filters = useTransactionFilters();
  const [q, setQ] = React.useState(filters.q);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories({ includeArchived: true });

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (q !== filters.q) filters.update({ q });
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search transactions…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={filters.type}
          onValueChange={(v) => filters.update({ type: v as typeof filters.type })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {TRANSACTION_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.accountId}
          onValueChange={(v) => filters.update({ accountId: v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId}
          onValueChange={(v) => filters.update({ categoryId: v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="w-40">
          <DatePickerField value={filters.from} onChange={(v) => filters.update({ from: v })} />
        </div>
        <span className="text-muted-foreground text-xs">to</span>
        <div className="w-40">
          <DatePickerField value={filters.to} onChange={(v) => filters.update({ to: v })} />
        </div>

        {filters.hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("");
              filters.clear();
            }}
            className="text-muted-foreground h-8"
          >
            <X className="size-3.5" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
