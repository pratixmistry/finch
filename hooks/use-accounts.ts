"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  createAccount,
  getAccounts,
  setAccountActive,
  updateAccount,
} from "@/lib/queries/accounts";
import type { AccountFormValues } from "@/lib/validations/account";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export function useAccounts(opts: { includeArchived?: boolean } = {}) {
  return useQuery({
    queryKey: ["accounts", opts],
    queryFn: () => getAccounts(createClient(), opts),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AccountFormValues) => {
      const userId = await requireUserId();
      return createAccount(createClient(), userId, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: AccountFormValues }) =>
      updateAccount(createClient(), id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useSetAccountActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      setAccountActive(createClient(), id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}
