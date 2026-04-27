-- ============================================================
-- Phase 10: Referral Program
-- ============================================================

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid references auth.users(id) on delete set null,
  code text not null unique,                -- short unique code e.g. "luna-abc123"
  status text not null default 'pending',   -- pending | completed | expired
  reward_applied boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists referrals_referrer_idx on public.referrals (referrer_id);
create index if not exists referrals_code_idx on public.referrals (code);

alter table public.referrals enable row level security;

drop policy if exists "users read own referrals" on public.referrals;
create policy "users read own referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

drop policy if exists "users create referrals" on public.referrals;
create policy "users create referrals"
  on public.referrals for insert
  with check (auth.uid() = referrer_id);

-- Add referral_code to profiles for easy lookup
alter table public.profiles
  add column if not exists referral_code text unique;
