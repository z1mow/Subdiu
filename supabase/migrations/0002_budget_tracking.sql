-- ============================================================================
-- Bütçe takibi: gelir/gider defteri (ledger) + tekrarlı kurallar.
-- Supabase SQL Editor'da çalıştır.
-- ============================================================================

-- 1) ENUM: işlem türü
do $$
begin
  if not exists (select 1 from pg_type where typname = 'transaction_type') then
    create type public.transaction_type as enum ('income', 'expense');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- 2) RECURRING_RULES — maaş, kira gibi tekrarlı gelir/gider kuralları.
--    billing_cycle ve subscription_status enum'ları (subscriptions'dan) tekrar kullanılır.
-- ----------------------------------------------------------------------------
create table if not exists public.recurring_rules (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  type          public.transaction_type not null,
  name          text not null check (char_length(name) between 1 and 120),
  amount        numeric(12, 2) not null check (amount >= 0),
  currency      text not null default 'TRY',
  category      text not null default 'Diğer',
  billing_cycle public.billing_cycle not null default 'monthly',
  start_date    date not null,
  status        public.subscription_status not null default 'active',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_recurring_rules_updated_at on public.recurring_rules;
create trigger trg_recurring_rules_updated_at
  before update on public.recurring_rules
  for each row execute function public.set_updated_at();

create index if not exists idx_recurring_rules_user_id on public.recurring_rules (user_id);
create index if not exists idx_recurring_rules_status   on public.recurring_rules (user_id, status);

-- ----------------------------------------------------------------------------
-- 3) TRANSACTIONS — gerçek, tarihli defter kaydı. Elle girilen tek seferlik
--    kayıtlar, recurring_rules'tan üretilenler ve abonelik ödemelerinden
--    üretilenler (subscription_id) burada birleşir.
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  type              public.transaction_type not null,
  amount            numeric(12, 2) not null check (amount >= 0),
  currency          text not null default 'TRY',
  category          text not null default 'Diğer',
  occurred_on       date not null,
  notes             text,
  subscription_id   uuid references public.subscriptions (id) on delete set null,
  recurring_rule_id uuid references public.recurring_rules (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint transactions_single_origin check (subscription_id is null or recurring_rule_id is null)
);

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

create index if not exists idx_transactions_user_id   on public.transactions (user_id, occurred_on desc);
create index if not exists idx_transactions_user_type on public.transactions (user_id, type, occurred_on);

-- Aynı abonelik/kural için aynı döneme iki kez satır üretilmesini engeller
-- (generate_due_transactions_core'un "ON CONFLICT DO NOTHING" ile idempotent olmasını sağlar).
create unique index if not exists uq_transactions_subscription_period
  on public.transactions (subscription_id, occurred_on)
  where subscription_id is not null;

create unique index if not exists uq_transactions_rule_period
  on public.transactions (recurring_rule_id, occurred_on)
  where recurring_rule_id is not null;

-- ----------------------------------------------------------------------------
-- 4) ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.recurring_rules enable row level security;
alter table public.transactions    enable row level security;

drop policy if exists "recurring_rules_select_own" on public.recurring_rules;
create policy "recurring_rules_select_own"
  on public.recurring_rules for select using (auth.uid() = user_id);

drop policy if exists "recurring_rules_insert_own" on public.recurring_rules;
create policy "recurring_rules_insert_own"
  on public.recurring_rules for insert with check (auth.uid() = user_id);

drop policy if exists "recurring_rules_update_own" on public.recurring_rules;
create policy "recurring_rules_update_own"
  on public.recurring_rules for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "recurring_rules_delete_own" on public.recurring_rules;
create policy "recurring_rules_delete_own"
  on public.recurring_rules for delete using (auth.uid() = user_id);

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
  on public.transactions for select using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
  on public.transactions for insert with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own"
  on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own"
  on public.transactions for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5) Üretim mantığı — aktif abonelikler + aktif tekrarlı kurallardan bugüne
--    kadar geçen tüm dönemler için transactions satırı üretir (idempotent).
--    NOT: duraklatılmış/iptal edilmiş bir kural yeniden aktif edilirse, ara
--    dönem geçmişi de (kaldığı yerden) geriye dönük üretilir — bu bilinçli
--    bir basitleştirme, gerçek duraklama tarihleri loglanmıyor.
-- ----------------------------------------------------------------------------
create or replace function public.generate_due_transactions_core(p_user_id uuid)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_count integer := 0;
  v_sub record;
  v_rule record;
  v_occurrence date;
  v_interval interval;
begin
  -- Abonelikler → gider
  for v_sub in
    select s.id, s.user_id, s.price, s.currency, s.category, s.first_billing_date, s.billing_cycle
    from public.subscriptions s
    where s.status = 'active'
      and (p_user_id is null or s.user_id = p_user_id)
  loop
    v_interval := case v_sub.billing_cycle
      when 'weekly'    then interval '1 week'
      when 'monthly'   then interval '1 month'
      when 'quarterly' then interval '3 months'
      when 'yearly'    then interval '1 year'
    end;

    v_occurrence := coalesce(
      (select (max(t.occurred_on) + v_interval)::date
       from public.transactions t
       where t.subscription_id = v_sub.id),
      v_sub.first_billing_date
    );

    while v_occurrence <= current_date loop
      insert into public.transactions
        (user_id, type, amount, currency, category, occurred_on, subscription_id)
      values
        (v_sub.user_id, 'expense', v_sub.price, v_sub.currency, v_sub.category, v_occurrence, v_sub.id)
      on conflict do nothing;
      if found then
        v_count := v_count + 1;
      end if;
      v_occurrence := (v_occurrence + v_interval)::date;
    end loop;
  end loop;

  -- Tekrarlı kurallar (maaş, kira…) → gelir/gider
  for v_rule in
    select r.id, r.user_id, r.type, r.amount, r.currency, r.category, r.start_date, r.billing_cycle
    from public.recurring_rules r
    where r.status = 'active'
      and (p_user_id is null or r.user_id = p_user_id)
  loop
    v_interval := case v_rule.billing_cycle
      when 'weekly'    then interval '1 week'
      when 'monthly'   then interval '1 month'
      when 'quarterly' then interval '3 months'
      when 'yearly'    then interval '1 year'
    end;

    v_occurrence := coalesce(
      (select (max(t.occurred_on) + v_interval)::date
       from public.transactions t
       where t.recurring_rule_id = v_rule.id),
      v_rule.start_date
    );

    while v_occurrence <= current_date loop
      insert into public.transactions
        (user_id, type, amount, currency, category, occurred_on, recurring_rule_id)
      values
        (v_rule.user_id, v_rule.type, v_rule.amount, v_rule.currency, v_rule.category, v_occurrence, v_rule.id)
      on conflict do nothing;
      if found then
        v_count := v_count + 1;
      end if;
      v_occurrence := (v_occurrence + v_interval)::date;
    end loop;
  end loop;

  return v_count;
end;
$$;

-- Tüm kullanıcılar için — sadece cron/service_role çağırabilir.
create or replace function public.generate_due_transactions()
returns integer
language sql
security definer set search_path = public
as $$
  select public.generate_due_transactions_core(null);
$$;

revoke all on function public.generate_due_transactions() from public, authenticated, anon;
grant execute on function public.generate_due_transactions() to service_role;

-- Sadece çağıran kullanıcının kendi verisi için — client'tan RPC ile çağrılabilir
-- (yeni bir tekrarlı kural oluşturulunca anında geçmişe dönük üretim için kullanılır).
create or replace function public.generate_due_transactions_for_current_user()
returns integer
language sql
security definer set search_path = public
as $$
  select public.generate_due_transactions_core(auth.uid());
$$;

revoke all on function public.generate_due_transactions_for_current_user() from public, anon;
grant execute on function public.generate_due_transactions_for_current_user() to authenticated;
