-- ============================================================================
-- SUBDIU — Subscription Tracker | Database schema
-- Run once in the Supabase SQL Editor.
-- ============================================================================

-- For gen_random_uuid() (usually preinstalled on Supabase)
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1) ENUM types
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'billing_cycle') then
    create type public.billing_cycle as enum ('weekly', 'monthly', 'quarterly', 'yearly');
  end if;
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum ('active', 'paused', 'cancelled');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- 2) Shared: updated_at auto-touch
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3) PROFILES (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  email            text,
  full_name        text,
  avatar_url       text,
  default_currency text not null default 'TRY',
  theme            text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4) SUBSCRIPTIONS
--    Note: next_billing_date is NOT stored; it is computed in the view.
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  name               text not null check (char_length(name) between 1 and 120),
  price              numeric(12, 2) not null check (price >= 0),
  currency           text not null default 'USD',
  billing_cycle      public.billing_cycle not null default 'monthly',
  category           text not null default 'Other',
  first_billing_date date not null,
  status             public.subscription_status not null default 'active',
  logo_url           text,
  color              text,
  cancel_url         text,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create index if not exists idx_subscriptions_user_id  on public.subscriptions (user_id);
create index if not exists idx_subscriptions_status   on public.subscriptions (user_id, status);
create index if not exists idx_subscriptions_category on public.subscriptions (user_id, category);

-- ----------------------------------------------------------------------------
-- 5) Next billing date calculation
-- ----------------------------------------------------------------------------
create or replace function public.calc_next_billing_date(
  p_first date,
  p_cycle public.billing_cycle
)
returns date
language plpgsql
stable
as $$
declare
  v_interval interval;
  v_next     date := p_first;
begin
  v_interval := case p_cycle
    when 'weekly'    then interval '1 week'
    when 'monthly'   then interval '1 month'
    when 'quarterly' then interval '3 months'
    when 'yearly'    then interval '1 year'
  end;

  while v_next < current_date loop
    v_next := (v_next + v_interval)::date;
  end loop;

  return v_next;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6) subscriptions_view — powers the dashboard
--    next_billing_date + normalized monthly_price / yearly_price
-- ----------------------------------------------------------------------------
create or replace view public.subscriptions_view
with (security_invoker = true)
as
select
  s.*,
  public.calc_next_billing_date(s.first_billing_date, s.billing_cycle) as next_billing_date,
  round(
    case s.billing_cycle
      when 'weekly'    then s.price * 52.0 / 12.0
      when 'monthly'   then s.price
      when 'quarterly' then s.price / 3.0
      when 'yearly'    then s.price / 12.0
    end, 2
  ) as monthly_price,
  round(
    case s.billing_cycle
      when 'weekly'    then s.price * 52.0
      when 'monthly'   then s.price * 12.0
      when 'quarterly' then s.price * 4.0
      when 'yearly'    then s.price
    end, 2
  ) as yearly_price
from public.subscriptions s;

-- ============================================================================
-- 7) ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- SUBSCRIPTIONS
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select using (auth.uid() = user_id);

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own"
  on public.subscriptions for insert with check (auth.uid() = user_id);

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own"
  on public.subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "subscriptions_delete_own" on public.subscriptions;
create policy "subscriptions_delete_own"
  on public.subscriptions for delete using (auth.uid() = user_id);
