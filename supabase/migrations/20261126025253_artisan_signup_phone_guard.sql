-- Keep malformed public signup metadata from aborting auth.users inserts.
-- The registration form validates phone numbers; this is a defensive DB boundary.
create or replace function artisan_private.create_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_phone text := coalesce(new.raw_user_meta_data->>'phone', '');
begin
  insert into public.artisan_profiles(user_id,email,first_name,last_name,phone,newsletter_opt_in)
  values(
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data->>'first_name',''),120),
    left(coalesce(new.raw_user_meta_data->>'last_name',''),120),
    case when raw_phone ~ '^\+[1-9][0-9]{1,14}$' then raw_phone else '' end,
    coalesce(new.raw_user_meta_data->>'newsletter_opt_in' = 'true',false)
  )
  on conflict(user_id) do nothing;
  return new;
end;
$$;

