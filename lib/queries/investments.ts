import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { InvestmentFormValues, InvestmentTxnFormValues } from "@/lib/validations/investment";
import { mapInvestment } from "./mappers";

type Client = SupabaseClient<Database>;

const INVESTMENT_SELECT = "*, account:accounts(id,name)";

export async function getInvestments(supabase: Client, opts: { includeArchived?: boolean } = {}) {
  let query = supabase.from("investments").select(INVESTMENT_SELECT).order("created_at", { ascending: true });
  if (!opts.includeArchived) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapInvestment);
}

function rdColumns(input: InvestmentFormValues) {
  const isRd = input.assetType === "recurring_deposit";
  return {
    rd_monthly_amount: isRd ? input.rdMonthlyAmount : null,
    rd_interest_rate: isRd ? input.rdInterestRate : null,
    rd_tenure_months: isRd ? input.rdTenureMonths : null,
    rd_start_date: isRd ? input.rdStartDate || null : null,
  };
}

export async function createInvestment(supabase: Client, userId: string, input: InvestmentFormValues) {
  const { data, error } = await supabase
    .from("investments")
    .insert({
      user_id: userId,
      account_id: input.accountId,
      name: input.name,
      asset_type: input.assetType,
      symbol: input.symbol || null,
      quantity: input.quantity,
      average_buy_price: input.averageBuyPrice,
      current_price: input.currentPrice,
      ...rdColumns(input),
    })
    .select(INVESTMENT_SELECT)
    .single();
  if (error) throw error;
  return mapInvestment(data);
}

export async function updateInvestment(supabase: Client, id: string, input: InvestmentFormValues) {
  const { data, error } = await supabase
    .from("investments")
    .update({
      account_id: input.accountId,
      name: input.name,
      asset_type: input.assetType,
      symbol: input.symbol || null,
      quantity: input.quantity,
      average_buy_price: input.averageBuyPrice,
      current_price: input.currentPrice,
      ...rdColumns(input),
    })
    .eq("id", id)
    .select(INVESTMENT_SELECT)
    .single();
  if (error) throw error;
  return mapInvestment(data);
}

// Used internally after logging a buy/sell — updates just the position,
// leaving the rest of the holding's fields untouched.
export async function updateInvestmentPosition(
  supabase: Client,
  id: string,
  position: { quantity: number; averageBuyPrice: number }
) {
  const { data, error } = await supabase
    .from("investments")
    .update({ quantity: position.quantity, average_buy_price: position.averageBuyPrice })
    .eq("id", id)
    .select(INVESTMENT_SELECT)
    .single();
  if (error) throw error;
  return mapInvestment(data);
}

export async function setInvestmentActive(supabase: Client, id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("investments")
    .update({ is_active: isActive })
    .eq("id", id)
    .select(INVESTMENT_SELECT)
    .single();
  if (error) throw error;
  return mapInvestment(data);
}

export async function createInvestmentTransaction(
  supabase: Client,
  userId: string,
  investmentId: string,
  input: InvestmentTxnFormValues
) {
  const { error } = await supabase.from("investment_transactions").insert({
    user_id: userId,
    investment_id: investmentId,
    type: input.type,
    quantity: input.quantity,
    price: input.price,
    fees: input.fees,
    transaction_date: input.transactionDate,
    notes: input.notes || null,
  });
  if (error) throw error;
}
