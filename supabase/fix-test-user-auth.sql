-- ============================================================
-- FIX: Patch auth.users row with all required fields
-- for signInWithPassword to work correctly
-- ============================================================

update auth.users
set
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change = '',
  phone = '',
  phone_confirmed_at = null,
  banned_until = null,
  reauthentication_token = '',
  reauthentication_sent_at = null,
  is_sso_user = false,
  deleted_at = null
where email = 'dibhavisualai@gmail.com';

-- Also ensure email_confirmed_at is set
update auth.users
set email_confirmed_at = now()
where email = 'dibhavisualai@gmail.com'
  and email_confirmed_at is null;

-- Verify the full user record
select
  id,
  email,
  email_confirmed_at,
  role,
  aud,
  encrypted_password is not null as has_password,
  raw_app_meta_data,
  raw_user_meta_data
from auth.users
where email = 'dibhavisualai@gmail.com';
