create table if not exists public.haikus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  haiku_date date not null,
  lines text[] not null,
  mood text,
  saved boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists haikus_user_date_idx
  on public.haikus (user_id, haiku_date);

create index if not exists haikus_user_saved_idx
  on public.haikus (user_id, saved, created_at desc);

alter table public.haikus enable row level security;

drop policy if exists "users read own haikus" on public.haikus;
create policy "users read own haikus"
  on public.haikus for select using (auth.uid() = user_id);

drop policy if exists "users insert own haikus" on public.haikus;
create policy "users insert own haikus"
  on public.haikus for insert with check (auth.uid() = user_id);

drop policy if exists "users update own haikus" on public.haikus;
create policy "users update own haikus"
  on public.haikus for update using (auth.uid() = user_id);

drop policy if exists "users delete own haikus" on public.haikus;
create policy "users delete own haikus"
  on public.haikus for delete using (auth.uid() = user_id);
