alter table public.profiles
  add column if not exists stripe_customer_id text unique,
  add column if not exists subscription_tier text not null default 'free',
  add column if not exists subscription_status text default 'inactive',
  add column if not exists subscription_id text,
  add column if not exists subscription_price_id text,
  add column if not exists subscription_current_period_end timestamptz,
  add column if not exists subscription_cancel_at_period_end boolean default false;

create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_kind_created_idx
  on public.usage_events (user_id, kind, created_at desc);

alter table public.usage_events enable row level security;

drop policy if exists "users read own usage" on public.usage_events;
create policy "users read own usage"
  on public.usage_events for select
  using (auth.uid() = user_id);

drop policy if exists "users insert own usage" on public.usage_events;
create policy "users insert own usage"
  on public.usage_events for insert
  with check (auth.uid() = user_id);
