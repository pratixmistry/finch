import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { mapProfile } from "./mappers";

type Client = SupabaseClient<Database>;

export async function getProfile(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function updateProfile(
  supabase: Client,
  userId: string,
  input: Partial<{ fullName: string; currency: string; timezone: string }>
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      currency: input.currency,
      timezone: input.timezone,
    })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return mapProfile(data);
}
