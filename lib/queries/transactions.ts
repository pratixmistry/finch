import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { TransactionFormValues } from "@/lib/validations/transaction";
import type { TransactionType } from "@/types";
import { mapTransaction } from "./mappers";

type Client = SupabaseClient<Database>;

const TRANSACTION_SELECT =
  "*, account:accounts!transactions_account_id_fkey(id,name,type), category:categories(id,name,icon,color), transfer_account:accounts!transactions_transfer_account_id_fkey(id,name)";

export interface TransactionFilters {
  from?: string;
  to?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  search?: string;
}

export interface TransactionPage {
  page?: number;
  pageSize?: number;
  sortBy?: "transaction_date" | "amount";
  sortDir?: "asc" | "desc";
}

// The Supabase query builder's type narrows on every chained call, which
// makes an incrementally-built query impossible to type precisely without
// dropping to `any` at the boundary — the return value of each exported
// function below is still fully typed via mapTransaction().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: TransactionFilters) {
  if (filters.from) query = query.gte("transaction_date", filters.from);
  if (filters.to) query = query.lte("transaction_date", filters.to);
  if (filters.accountId) query = query.eq("account_id", filters.accountId);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.search) query = query.ilike("description", `%${filters.search}%`);
  return query;
}

// Used by the dashboard/reports: every matching transaction for a period,
// unpaginated (date-range queries stay small enough that this is cheap and
// avoids a second round trip just to sum things client-side).
export async function getTransactionsForRange(supabase: Client, filters: TransactionFilters) {
  let query = supabase
    .from("transactions")
    .select(TRANSACTION_SELECT)
    .order("transaction_date", { ascending: false });
  query = applyFilters(query, filters);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapTransaction);
}

// Used by the Transactions table: filtered, sorted, paginated.
export async function getTransactionsPage(
  supabase: Client,
  filters: TransactionFilters,
  page: TransactionPage = {}
) {
  const { page: pageNum = 1, pageSize = 25, sortBy = "transaction_date", sortDir = "desc" } = page;
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("transactions")
    .select(TRANSACTION_SELECT, { count: "exact" })
    .order(sortBy, { ascending: sortDir === "asc" })
    .range(from, to);
  query = applyFilters(query, filters);

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    transactions: data.map(mapTransaction),
    total: count ?? 0,
    page: pageNum,
    pageSize,
  };
}

export async function getTransactionById(supabase: Client, id: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select(TRANSACTION_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapTransaction(data);
}

function toInsertPayload(userId: string, input: TransactionFormValues) {
  return {
    user_id: userId,
    account_id: input.accountId,
    type: input.type,
    amount: input.amount,
    transaction_date: input.transactionDate,
    description: input.description ?? "",
    notes: input.notes || null,
    category_id: input.type === "income" || input.type === "expense" ? input.categoryId : null,
    transfer_account_id: input.type === "transfer" ? input.transferAccountId : null,
  };
}

export async function createTransaction(
  supabase: Client,
  userId: string,
  input: TransactionFormValues
) {
  const { data, error } = await supabase
    .from("transactions")
    .insert(toInsertPayload(userId, input))
    .select(TRANSACTION_SELECT)
    .single();
  if (error) throw error;
  return mapTransaction(data);
}

export async function updateTransaction(
  supabase: Client,
  id: string,
  userId: string,
  input: TransactionFormValues
) {
  const { data, error } = await supabase
    .from("transactions")
    .update(toInsertPayload(userId, input))
    .eq("id", id)
    .select(TRANSACTION_SELECT)
    .single();
  if (error) throw error;
  return mapTransaction(data);
}

export async function deleteTransaction(supabase: Client, id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}
