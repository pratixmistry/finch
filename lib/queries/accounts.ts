import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AccountFormValues } from "@/lib/validations/account";
import { mapAccount } from "./mappers";

type Client = SupabaseClient<Database>;

export async function getAccounts(supabase: Client, opts: { includeArchived?: boolean } = {}) {
  let query = supabase.from("accounts").select("*").order("created_at", { ascending: true });
  if (!opts.includeArchived) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapAccount);
}

export async function getAccountById(supabase: Client, id: string) {
  const { data, error } = await supabase.from("accounts").select("*").eq("id", id).single();
  if (error) throw error;
  return mapAccount(data);
}

export async function createAccount(
  supabase: Client,
  userId: string,
  input: AccountFormValues
) {
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      name: input.name,
      type: input.type,
      opening_balance: input.openingBalance,
      currency: input.currency,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapAccount(data);
}

export async function updateAccount(
  supabase: Client,
  id: string,
  input: AccountFormValues
) {
  const { data, error } = await supabase
    .from("accounts")
    .update({
      name: input.name,
      type: input.type,
      opening_balance: input.openingBalance,
      currency: input.currency,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapAccount(data);
}

export async function setAccountActive(supabase: Client, id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("accounts")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapAccount(data);
}
