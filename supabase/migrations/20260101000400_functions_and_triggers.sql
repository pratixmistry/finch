-- updated_at maintenance ---------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.accounts
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.transactions
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.investments
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.budgets
  for each row execute function public.set_updated_at();

-- new user bootstrap: profile row + default categories --------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, currency)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'INR');

  insert into public.categories (user_id, name, type, icon, color, is_default)
  values
    (new.id, 'Food', 'expense', 'utensils', '#f97316', true),
    (new.id, 'Groceries', 'expense', 'shopping-cart', '#84cc16', true),
    (new.id, 'Rent', 'expense', 'home', '#ef4444', true),
    (new.id, 'Utilities', 'expense', 'plug', '#eab308', true),
    (new.id, 'Transport', 'expense', 'car', '#06b6d4', true),
    (new.id, 'Fuel', 'expense', 'fuel', '#f59e0b', true),
    (new.id, 'Shopping', 'expense', 'shopping-bag', '#ec4899', true),
    (new.id, 'Entertainment', 'expense', 'clapperboard', '#a855f7', true),
    (new.id, 'Healthcare', 'expense', 'heart-pulse', '#f43f5e', true),
    (new.id, 'Education', 'expense', 'graduation-cap', '#3b82f6', true),
    (new.id, 'Travel', 'expense', 'plane', '#14b8a6', true),
    (new.id, 'Subscriptions', 'expense', 'repeat', '#8b5cf6', true),
    (new.id, 'Insurance', 'expense', 'shield', '#64748b', true),
    (new.id, 'Personal Care', 'expense', 'sparkles', '#d946ef', true),
    (new.id, 'Other', 'expense', 'more-horizontal', '#78716c', true),
    (new.id, 'Salary', 'income', 'wallet', '#22c55e', true),
    (new.id, 'Freelance', 'income', 'laptop', '#16a34a', true),
    (new.id, 'Business', 'income', 'briefcase', '#15803d', true),
    (new.id, 'Interest', 'income', 'percent', '#059669', true),
    (new.id, 'Dividends', 'income', 'trending-up', '#10b981', true),
    (new.id, 'Gifts', 'income', 'gift', '#0d9488', true),
    (new.id, 'Other', 'income', 'more-horizontal', '#78716c', true);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
