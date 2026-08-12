import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CategoryFormValues } from "@/lib/validations/category";
import type { CategoryType } from "@/types";
import { mapCategory } from "./mappers";

type Client = SupabaseClient<Database>;

export async function getCategories(
  supabase: Client,
  opts: { includeArchived?: boolean; type?: CategoryType } = {}
) {
  let query = supabase.from("categories").select("*").order("name", { ascending: true });
  if (!opts.includeArchived) {
    query = query.eq("is_active", true);
  }
  if (opts.type) {
    query = query.eq("type", opts.type);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapCategory);
}

export async function categoryHasTransactions(supabase: Client, categoryId: string) {
  const { count, error } = await supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function createCategory(
  supabase: Client,
  userId: string,
  input: CategoryFormValues
) {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: userId,
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapCategory(data);
}

export async function updateCategory(
  supabase: Client,
  id: string,
  input: CategoryFormValues
) {
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      icon: input.icon,
      color: input.color,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapCategory(data);
}

export async function setCategoryActive(supabase: Client, id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapCategory(data);
}

// Hard-delete is only ever attempted for categories with zero transactions —
// callers must check categoryHasTransactions() first and archive instead.
export async function deleteCategory(supabase: Client, id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
