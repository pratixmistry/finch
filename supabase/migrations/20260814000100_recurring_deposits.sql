-- Recurring deposits ---------------------------------------------------------
-- Adds a `recurring_deposit` asset type: a fixed monthly installment over a
-- fixed tenure at a fixed interest rate. Unlike other asset types, its value
-- isn't manually priced — quantity/average_buy_price/current_price stay at
-- their defaults and the app derives market value from these columns plus
-- today's date (see lib/calculations/investments.ts: rdMaturityValue/rdProgress).

alter type public.investment_asset_type add value 'recurring_deposit';

alter table public.investments
  add column rd_monthly_amount numeric(14, 2) check (rd_monthly_amount is null or rd_monthly_amount > 0),
  add column rd_interest_rate numeric(5, 2) check (rd_interest_rate is null or rd_interest_rate >= 0),
  add column rd_tenure_months smallint check (rd_tenure_months is null or rd_tenure_months > 0),
  add column rd_start_date date;

comment on column public.investments.rd_monthly_amount is 'Recurring deposit only: fixed monthly installment amount.';
comment on column public.investments.rd_interest_rate is 'Recurring deposit only: annual interest rate, percent.';
comment on column public.investments.rd_tenure_months is 'Recurring deposit only: total tenure in months.';
comment on column public.investments.rd_start_date is 'Recurring deposit only: date of the first installment.';
