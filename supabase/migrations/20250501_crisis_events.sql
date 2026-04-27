create table if not exists public.crisis_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  level text not null check (level in ('yellow', 'amber', 'red')),
  category text not null,
  matched_terms text[] not null default '{}',
  message_preview text,
  source text not null,
  created_at timestamptz not null default now()
);

create index if not exists crisis_events_user_created_idx
  on public.crisis_events (user_id, created_at desc);

alter table public.crisis_events enable row level security;

drop policy if exists "users view own crisis events" on public.crisis_events;
create policy "users view own crisis events"
  on public.crisis_events for select
  using (auth.uid() = user_id);

drop policy if exists "users insert own crisis events" on public.crisis_events;
create policy "users insert own crisis events"
  on public.crisis_events for insert
  with check (auth.uid() = user_id);
