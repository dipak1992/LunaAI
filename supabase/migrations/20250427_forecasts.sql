-- Forecasts table (idempotent)
create table if not exists public.forecasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_at timestamptz not null default now(),
  forecast jsonb not null,              -- array of 7 day objects
  patterns_detected jsonb,              -- array of strings
  biggest_trigger text,
  source_log_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Add generated_at if the table already existed without it
alter table public.forecasts
  add column if not exists generated_at timestamptz not null default now();

-- Index (uses generated_at — safe now that column is guaranteed to exist)
create index if not exists forecasts_user_id_generated_at_idx
  on public.forecasts (user_id, generated_at desc);

alter table public.forecasts enable row level security;

drop policy if exists "users read own forecasts" on public.forecasts;
create policy "users read own forecasts"
  on public.forecasts for select
  using (auth.uid() = user_id);

drop policy if exists "users insert own forecasts" on public.forecasts;
create policy "users insert own forecasts"
  on public.forecasts for insert
  with check (auth.uid() = user_id);

drop policy if exists "users delete own forecasts" on public.forecasts;
create policy "users delete own forecasts"
  on public.forecasts for delete
  using (auth.uid() = user_id);
