"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  categoryHasTransactions,
  createCategory,
  deleteCategory,
  getCategories,
  setCategoryActive,
  updateCategory,
} from "@/lib/queries/categories";
import type { CategoryFormValues } from "@/lib/validations/category";
import type { CategoryType } from "@/types";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export function useCategories(opts: { includeArchived?: boolean; type?: CategoryType } = {}) {
  return useQuery({
    queryKey: ["categories", opts],
    queryFn: () => getCategories(createClient(), opts),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CategoryFormValues) => {
      const userId = await requireUserId();
      return createCategory(createClient(), userId, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CategoryFormValues }) =>
      updateCategory(createClient(), id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useSetCategoryActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      setCategoryActive(createClient(), id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// Archives if the category has history, otherwise hard-deletes. Callers use
// this instead of deleteCategory() directly so the "never delete history"
// rule (spec) is enforced in one place.
export function useRemoveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const hasTransactions = await categoryHasTransactions(supabase, id);
      if (hasTransactions) {
        await setCategoryActive(supabase, id, false);
        return { archived: true as const };
      }
      await deleteCategory(supabase, id);
      return { archived: false as const };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}
