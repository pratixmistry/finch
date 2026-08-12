-- Extensions -----------------------------------------------------------
create extension if not exists "pgcrypto" with schema extensions;

-- Enums -------------------------------------------------------------------

create type public.account_type as enum (
  'cash',
  'bank',
  'credit_card',
  'wallet',
  'investment',
  'other_asset',
  'loan'
);

create type public.category_type as enum (
  'income',
  'expense'
);

create type public.transaction_type as enum (
  'income',
  'expense',
  'investment',
  'transfer'
);

create type public.investment_asset_type as enum (
  'stock',
  'mutual_fund',
  'etf',
  'crypto',
  'fixed_deposit',
  'bond',
  'other'
);

create type public.investment_txn_type as enum (
  'buy',
  'sell'
);

create type public.budget_period as enum (
  'monthly',
  'quarterly',
  'yearly'
);
