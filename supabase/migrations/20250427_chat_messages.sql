-- Chat messages table
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_id_created_at_idx
  on public.chat_messages (user_id, created_at desc);

-- RLS
alter table public.chat_messages enable row level security;

drop policy if exists "users can read own messages" on public.chat_messages;
create policy "users can read own messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own messages" on public.chat_messages;
create policy "users can insert own messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own messages" on public.chat_messages;
create policy "users can delete own messages"
  on public.chat_messages for delete
  using (auth.uid() = user_id);
