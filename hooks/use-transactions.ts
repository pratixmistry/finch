"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  createTransaction,
  deleteTransaction,
  getTransactionsForRange,
  getTransactionsPage,
  updateTransaction,
  type TransactionFilters,
  type TransactionPage,
} from "@/lib/queries/transactions";
import type { TransactionFormValues } from "@/lib/validations/transaction";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export function useTransactionsForRange(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", "range", filters],
    queryFn: () => getTransactionsForRange(createClient(), filters),
  });
}

export function useTransactionsPage(filters: TransactionFilters, page: TransactionPage) {
  return useQuery({
    queryKey: ["transactions", "page", filters, page],
    queryFn: () => getTransactionsPage(createClient(), filters, page),
    placeholderData: (previous) => previous,
  });
}

function useInvalidateTransactions() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    // balances/dashboard aggregates depend on the accounts list too
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };
}

export function useCreateTransaction() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: async (input: TransactionFormValues) => {
      const userId = await requireUserId();
      return createTransaction(createClient(), userId, input);
    },
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TransactionFormValues }) => {
      const userId = await requireUserId();
      return updateTransaction(createClient(), id, userId, input);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: async (id: string) => deleteTransaction(createClient(), id),
    onSuccess: invalidate,
  });
}
