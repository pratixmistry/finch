-- Row Level Security --------------------------------------------------------
-- Every user-owned table is locked down to auth.uid(). The anon/authenticated
-- roles never see another user's rows, regardless of what the client sends.
-- Policies use `(select auth.uid())` so Postgres can evaluate it once per
-- statement instead of once per row.

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.investments enable row level security;
alter table public.investment_transactions enable row level security;
alter table public.budgets enable row level security;

-- profiles --------------------------------------------------------------
-- keyed by id (= auth.users.id), not user_id.

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- accounts --------------------------------------------------------------

create policy "accounts_select_own" on public.accounts
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "accounts_insert_own" on public.accounts
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "accounts_update_own" on public.accounts
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "accounts_delete_own" on public.accounts
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- categories --------------------------------------------------------------

create policy "categories_select_own" on public.categories
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "categories_insert_own" on public.categories
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "categories_update_own" on public.categories
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "categories_delete_own" on public.categories
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- transactions --------------------------------------------------------------

create policy "transactions_select_own" on public.transactions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "transactions_insert_own" on public.transactions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "transactions_update_own" on public.transactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "transactions_delete_own" on public.transactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- investments --------------------------------------------------------------

create policy "investments_select_own" on public.investments
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "investments_insert_own" on public.investments
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "investments_update_own" on public.investments
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "investments_delete_own" on public.investments
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- investment_transactions ---------------------------------------------------

create policy "investment_transactions_select_own" on public.investment_transactions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "investment_transactions_insert_own" on public.investment_transactions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "investment_transactions_update_own" on public.investment_transactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "investment_transactions_delete_own" on public.investment_transactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- budgets --------------------------------------------------------------

create policy "budgets_select_own" on public.budgets
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "budgets_insert_own" on public.budgets
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "budgets_update_own" on public.budgets
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "budgets_delete_own" on public.budgets
  for delete to authenticated
  using (user_id = (select auth.uid()));
