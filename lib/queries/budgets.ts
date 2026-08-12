import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { BudgetFormValues } from "@/lib/validations/budget";
import { mapBudget } from "./mappers";

type Client = SupabaseClient<Database>;

const BUDGET_SELECT = "*, category:categories(id,name,icon,color)";

export async function getBudgets(supabase: Client) {
  const { data, error } = await supabase
    .from("budgets")
    .select(BUDGET_SELECT)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(mapBudget);
}

export async function createBudget(supabase: Client, userId: string, input: BudgetFormValues) {
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: userId,
      category_id: input.categoryId,
      amount: input.amount,
      period: input.period,
      start_date: input.startDate,
    })
    .select(BUDGET_SELECT)
    .single();
  if (error) throw error;
  return mapBudget(data);
}

export async function updateBudget(supabase: Client, id: string, input: BudgetFormValues) {
  const { data, error } = await supabase
    .from("budgets")
    .update({
      category_id: input.categoryId,
      amount: input.amount,
      period: input.period,
      start_date: input.startDate,
    })
    .eq("id", id)
    .select(BUDGET_SELECT)
    .single();
  if (error) throw error;
  return mapBudget(data);
}

export async function deleteBudget(supabase: Client, id: string) {
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) throw error;
}
