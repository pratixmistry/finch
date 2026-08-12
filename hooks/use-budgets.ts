"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createBudget, deleteBudget, getBudgets, updateBudget } from "@/lib/queries/budgets";
import type { BudgetFormValues } from "@/lib/validations/budget";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: () => getBudgets(createClient()),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BudgetFormValues) => {
      const userId = await requireUserId();
      return createBudget(createClient(), userId, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: BudgetFormValues }) =>
      updateBudget(createClient(), id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteBudget(createClient(), id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}
