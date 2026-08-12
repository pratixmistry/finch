-- ============================================================================
-- DEMO / SEED DATA — clearly-labeled fake data for trying the app out.
-- This is NOT real financial data and does not come from any external source.
--
-- Supabase does not allow creating auth.users rows from plain SQL (passwords
-- are hashed by the Auth service), so this script seeds data for a user that
-- ALREADY EXISTS. To use it:
--
--   1. Sign up once through the running app (or Supabase Studio > Authentication).
--   2. Copy that user's UUID from Authentication > Users in the Supabase dashboard.
--   3. Replace the placeholder UUID below with it.
--   4. Run this file in the Supabase SQL editor.
--
-- It creates 4 accounts, ~8 months of recurring transactions, a couple of
-- transfers, 3 sample investment holdings, and 5 category budgets. The
-- default categories referenced here are created automatically by the
-- `handle_new_user` trigger the moment the account signs up.
-- ============================================================================

do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- <-- REPLACE ME
  v_bank uuid;
  v_cash uuid;
  v_credit uuid;
  v_invest_acct uuid;
  v_month date;
begin
  if v_user_id = '00000000-0000-0000-0000-000000000000' then
    raise exception 'supabase/seed.sql: set v_user_id to a real auth.users id before running this script.';
  end if;

  if not exists (select 1 from public.profiles where id = v_user_id) then
    raise exception 'supabase/seed.sql: no profile found for user %. Sign up through the app first.', v_user_id;
  end if;

  -- Accounts -----------------------------------------------------------
  insert into public.accounts (user_id, name, type, opening_balance)
  values (v_user_id, 'HDFC Bank', 'bank', 45000)
  returning id into v_bank;

  insert into public.accounts (user_id, name, type, opening_balance)
  values (v_user_id, 'Cash Wallet', 'cash', 3000)
  returning id into v_cash;

  insert into public.accounts (user_id, name, type, opening_balance)
  values (v_user_id, 'ICICI Credit Card', 'credit_card', 0)
  returning id into v_credit;

  insert into public.accounts (user_id, name, type, opening_balance)
  values (v_user_id, 'Zerodha', 'investment', 0)
  returning id into v_invest_acct;

  -- Recurring transactions for the last 8 months ------------------------
  for v_month in
    select generate_series(
      date_trunc('month', current_date) - interval '7 months',
      date_trunc('month', current_date),
      interval '1 month'
    )::date
  loop
    insert into public.transactions (user_id, account_id, category_id, type, amount, transaction_date, description)
    values
      (v_user_id, v_bank, (select id from public.categories where user_id = v_user_id and name = 'Salary' and type = 'income'), 'income', 85000, v_month + 0, 'Monthly salary'),
      (v_user_id, v_bank, (select id from public.categories where user_id = v_user_id and name = 'Rent' and type = 'expense'), 'expense', 18000, v_month + 4, 'Rent'),
      (v_user_id, v_bank, (select id from public.categories where user_id = v_user_id and name = 'Utilities' and type = 'expense'), 'expense', 2400, v_month + 6, 'Electricity + Wi-Fi'),
      (v_user_id, v_cash, (select id from public.categories where user_id = v_user_id and name = 'Groceries' and type = 'expense'), 'expense', 4200, v_month + 9, 'Groceries'),
      (v_user_id, v_credit, (select id from public.categories where user_id = v_user_id and name = 'Food' and type = 'expense'), 'expense', 2600, v_month + 12, 'Dining out'),
      (v_user_id, v_credit, (select id from public.categories where user_id = v_user_id and name = 'Shopping' and type = 'expense'), 'expense', 3100, v_month + 15, 'Online shopping'),
      (v_user_id, v_bank, (select id from public.categories where user_id = v_user_id and name = 'Transport' and type = 'expense'), 'expense', 1800, v_month + 18, 'Cab rides'),
      (v_user_id, v_bank, (select id from public.categories where user_id = v_user_id and name = 'Subscriptions' and type = 'expense'), 'expense', 999, v_month + 2, 'Streaming subscriptions');
  end loop;

  -- A couple of transfers -------------------------------------------------
  insert into public.transactions (user_id, account_id, transfer_account_id, type, amount, transaction_date, description)
  values
    (v_user_id, v_bank, v_cash, 'transfer', 5000, current_date - 20, 'ATM withdrawal'),
    (v_user_id, v_bank, v_invest_acct, 'transfer', 10000, current_date - 10, 'Moved to investment account');

  -- Investment holdings -----------------------------------------------------
  insert into public.investments (user_id, account_id, name, asset_type, symbol, quantity, average_buy_price, current_price)
  values
    (v_user_id, v_invest_acct, 'Nifty 50 Index Fund', 'mutual_fund', 'NIFTYBEES', 120.5, 210.40, 235.10),
    (v_user_id, v_invest_acct, 'HDFC Bank Ltd', 'stock', 'HDFCBANK', 15, 1520.00, 1650.75),
    (v_user_id, v_invest_acct, 'Fixed Deposit - HDFC', 'fixed_deposit', null, 1, 100000.00, 106500.00);

  -- Budgets ------------------------------------------------------------
  insert into public.budgets (user_id, category_id, amount, period, start_date)
  select
    v_user_id,
    id,
    case name
      when 'Food' then 8000
      when 'Groceries' then 6000
      when 'Shopping' then 5000
      when 'Transport' then 3000
      else 2000
    end,
    'monthly',
    date_trunc('month', current_date)::date
  from public.categories
  where user_id = v_user_id and type = 'expense' and name in ('Food', 'Groceries', 'Shopping', 'Transport', 'Entertainment');

end $$;
