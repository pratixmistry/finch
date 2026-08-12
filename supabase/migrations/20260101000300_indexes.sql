-- accounts
create index accounts_user_id_idx on public.accounts (user_id);
create index accounts_user_active_idx on public.accounts (user_id, is_active);

-- categories
create index categories_user_id_idx on public.categories (user_id);
create index categories_user_type_active_idx on public.categories (user_id, type, is_active);

-- transactions
create index transactions_user_date_idx on public.transactions (user_id, transaction_date desc);
create index transactions_user_account_idx on public.transactions (user_id, account_id);
create index transactions_user_category_idx on public.transactions (user_id, category_id);
create index transactions_user_type_idx on public.transactions (user_id, type);
create index transactions_transfer_account_idx on public.transactions (transfer_account_id)
  where transfer_account_id is not null;

-- investments
create index investments_user_id_idx on public.investments (user_id);
create index investments_account_id_idx on public.investments (account_id);

-- investment_transactions
create index investment_transactions_investment_id_idx on public.investment_transactions (investment_id);
create index investment_transactions_user_id_idx on public.investment_transactions (user_id);
create index investment_transactions_user_date_idx on public.investment_transactions (user_id, transaction_date desc);

-- budgets
create index budgets_user_id_idx on public.budgets (user_id);
create index budgets_category_id_idx on public.budgets (category_id);
