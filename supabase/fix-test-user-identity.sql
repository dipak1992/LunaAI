-- ============================================================
-- FIX: Add missing auth.identities row for manually-created user
-- Run this in Supabase SQL Editor
-- ============================================================

do $$
declare
  v_user_id uuid;
begin
  -- Get the user id
  select id into v_user_id
  from auth.users
  where email = 'dibhavisualai@gmail.com';

  if v_user_id is null then
    raise exception 'User not found. Run seed-test-user.sql first.';
  end if;

  -- Insert identity row (required for email/password login)
  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    v_user_id,
    v_user_id::text,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', 'dibhavisualai@gmail.com',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  )
  on conflict (provider, provider_id) do nothing;

  raise notice 'Identity row added for user: %', v_user_id;
end;
$$;

-- Verify
select
  u.id,
  u.email,
  u.email_confirmed_at is not null as email_confirmed,
  i.provider,
  p.subscription_tier,
  p.subscription_status
from auth.users u
join public.profiles p on p.id = u.id
left join auth.identities i on i.user_id = u.id
where u.email = 'dibhavisualai@gmail.com';
