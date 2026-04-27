-- ============================================================
-- STEP 1: Fix the handle_new_user trigger
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, subscription_tier, subscription_status, onboarding_completed)
  values (new.id, 'free', 'inactive', false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- STEP 2: Fix the subscription_tier check constraint
-- to allow 'free', 'full_moon', 'aurora'
-- ============================================================

alter table public.profiles
  drop constraint if exists profiles_subscription_tier_check;

alter table public.profiles
  add constraint profiles_subscription_tier_check
  check (subscription_tier in ('free', 'full_moon', 'aurora'));

-- ============================================================
-- STEP 3: Create the test user (only if not already exists)
-- ============================================================

do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where email = 'dibhavisualai@gmail.com';

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    )
    values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'dibhavisualai@gmail.com',
      crypt('Nep@l9057', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Test User"}',
      false,
      'authenticated',
      'authenticated'
    );

    raise notice 'Created user with id: %', v_user_id;
  else
    raise notice 'User already exists with id: %', v_user_id;
  end if;

  -- ============================================================
  -- STEP 4: Upsert profile with aurora tier
  -- ============================================================

  insert into public.profiles (
    id,
    name,
    subscription_tier,
    subscription_status,
    subscription_current_period_end,
    onboarding_completed
  )
  values (
    v_user_id,
    'Test User',
    'aurora',
    'active',
    now() + interval '1 year',
    true
  )
  on conflict (id) do update set
    name = 'Test User',
    subscription_tier = 'aurora',
    subscription_status = 'active',
    subscription_current_period_end = now() + interval '1 year',
    onboarding_completed = true;

  raise notice 'Profile set to aurora for user: %', v_user_id;
end;
$$;

-- ============================================================
-- STEP 5: Verify
-- ============================================================

select
  u.id,
  u.email,
  u.email_confirmed_at is not null as email_confirmed,
  p.subscription_tier,
  p.subscription_status,
  p.onboarding_completed
from auth.users u
join public.profiles p on p.id = u.id
where u.email = 'dibhavisualai@gmail.com';
