"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TransactionType } from "@/types";

export interface TransactionFiltersState {
  q: string;
  type: TransactionType | "all";
  accountId: string | "all";
  categoryId: string | "all";
  from: string;
  to: string;
  page: number;
}

const DEFAULTS: TransactionFiltersState = {
  q: "",
  type: "all",
  accountId: "all",
  categoryId: "all",
  from: "",
  to: "",
  page: 1,
};

// URL-synced filter state for the Transactions table — shareable/bookmarkable
// and survives a refresh, same pattern as useDateRange.
export function useTransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: TransactionFiltersState = {
    q: searchParams.get("q") ?? DEFAULTS.q,
    type: (searchParams.get("type") as TransactionType | null) ?? DEFAULTS.type,
    accountId: searchParams.get("account") ?? DEFAULTS.accountId,
    categoryId: searchParams.get("category") ?? DEFAULTS.categoryId,
    from: searchParams.get("from") ?? DEFAULTS.from,
    to: searchParams.get("to") ?? DEFAULTS.to,
    page: Number(searchParams.get("page") ?? DEFAULTS.page),
  };

  const update = React.useCallback(
    (patch: Partial<TransactionFiltersState>, opts: { resetPage?: boolean } = { resetPage: true }) => {
      const params = new URLSearchParams(searchParams.toString());
      const next = { ...state, ...patch, ...(opts.resetPage ? { page: 1 } : {}) };

      const set = (key: string, value: string) => {
        if (!value || value === "all") params.delete(key);
        else params.set(key, value);
      };

      set("q", next.q);
      set("type", next.type);
      set("account", next.accountId);
      set("category", next.categoryId);
      set("from", next.from);
      set("to", next.to);
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, router, searchParams]
  );

  const clear = React.useCallback(() => router.push(pathname, { scroll: false }), [pathname, router]);

  const hasActiveFilters =
    !!state.q || state.type !== "all" || state.accountId !== "all" || state.categoryId !== "all" || !!state.from || !!state.to;

  return { ...state, update, clear, hasActiveFilters };
}
