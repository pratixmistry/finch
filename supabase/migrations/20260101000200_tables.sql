-- profiles -----------------------------------------------------------------
-- 1:1 with auth.users, auto-created by the handle_new_user trigger (see
-- 20260101000400_functions_and_triggers.sql).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  currency text not null default 'INR',
  timezone text not null default 'Asia/Kolkata',
  date_format text not null default 'dd/MM/yyyy',
  week_start_day smallint not null default 1 check (week_start_day between 0 and 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per user, mirrors auth.users. Holds display + locale preferences.';

-- accounts -------------------------------------------------------------------

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  type public.account_type not null,
  currency text not null default 'INR',
  opening_balance numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.accounts is 'Cash/bank/card/investment/liability accounts owned by a user. Archived (soft-deleted) via is_active.';

-- categories -------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  type public.category_type not null,
  icon text not null default 'circle',
  color text not null default '#6366f1' check (color ~* '^#[0-9a-f]{6}$'),
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name, type)
);

comment on table public.categories is 'Income/expense categories. Archived (soft-deleted) via is_active, never hard-deleted while referenced by transactions.';

-- transactions -------------------------------------------------------------------

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete restrict,
  category_id uuid references public.categories (id) on delete restrict,
  transfer_account_id uuid references public.accounts (id) on delete restrict,
  type public.transaction_type not null,
  amount numeric(14, 2) not null check (amount > 0),
  transaction_date date not null default current_date,
  description text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_category_matches_type check (
    (type in ('transfer', 'investment') and category_id is null)
    or (type in ('income', 'expense') and category_id is not null)
  ),
  constraint transactions_transfer_account_matches_type check (
    (type = 'transfer' and transfer_account_id is not null and transfer_account_id <> account_id)
    or (type <> 'transfer' and transfer_account_id is null)
  )
);

comment on table public.transactions is 'Single ledger for income, expense, investment-linked, and transfer entries. Amount is always stored positive; type/account determine sign.';

-- investments -------------------------------------------------------------------

create table public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete restrict,
  name text not null check (char_length(btrim(name)) > 0),
  asset_type public.investment_asset_type not null,
  symbol text,
  quantity numeric(18, 6) not null default 0 check (quantity >= 0),
  average_buy_price numeric(14, 4) not null default 0 check (average_buy_price >= 0),
  current_price numeric(14, 4) not null default 0 check (current_price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.investments is 'A holding (position) in an investment account. Manually priced in Phase 1; current_price is user-updated.';

-- investment_transactions -------------------------------------------------------------------

create table public.investment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  investment_id uuid not null references public.investments (id) on delete restrict,
  type public.investment_txn_type not null,
  quantity numeric(18, 6) not null check (quantity > 0),
  price numeric(14, 4) not null check (price >= 0),
  fees numeric(14, 2) not null default 0 check (fees >= 0),
  transaction_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.investment_transactions is 'Buy/sell lots for an investment. Immutable financial history — investments can only be archived, never hard-deleted while lots exist.';

-- budgets -------------------------------------------------------------------

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  period public.budget_period not null default 'monthly',
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, period, start_date),
  constraint budgets_end_after_start check (end_date is null or end_date >= start_date)
);

comment on table public.budgets is 'A spending limit for a category over a recurring period.';
