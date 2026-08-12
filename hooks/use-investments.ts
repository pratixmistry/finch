"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  createInvestment,
  createInvestmentTransaction,
  getInvestments,
  setInvestmentActive,
  updateInvestment,
  updateInvestmentPosition,
} from "@/lib/queries/investments";
import { applyInvestmentTxn } from "@/lib/calculations";
import type { InvestmentFormValues, InvestmentTxnFormValues } from "@/lib/validations/investment";
import type { Investment } from "@/types";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export function useInvestments(opts: { includeArchived?: boolean } = {}) {
  return useQuery({
    queryKey: ["investments", opts],
    queryFn: () => getInvestments(createClient(), opts),
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: InvestmentFormValues) => {
      const userId = await requireUserId();
      return createInvestment(createClient(), userId, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investments"] }),
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: InvestmentFormValues }) =>
      updateInvestment(createClient(), id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investments"] }),
  });
}

export function useSetInvestmentActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      setInvestmentActive(createClient(), id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investments"] }),
  });
}

export function useLogInvestmentTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ investment, input }: { investment: Investment; input: InvestmentTxnFormValues }) => {
      if (input.type === "sell" && input.quantity > investment.quantity) {
        throw new Error("Cannot sell more than you hold");
      }
      const userId = await requireUserId();
      const supabase = createClient();
      const position = applyInvestmentTxn(investment, input);
      await createInvestmentTransaction(supabase, userId, investment.id, input);
      return updateInvestmentPosition(supabase, investment.id, position);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investments"] }),
  });
}
