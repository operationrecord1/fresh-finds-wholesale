-- Preserve historical customer records while rejecting new or changed invalid numbers.
-- A NOT VALID check can still block unrelated updates to existing invalid rows.
alter table public.artisan_profiles drop constraint if exists artisan_profile_phone_e164;
create or replace function artisan_private.enforce_profile_phone_e164()
returns trigger language plpgsql set search_path=''
as $$
begin
 if new.phone <> '' and new.phone !~ '^\+[1-9][0-9]{1,14}$' then
  raise exception 'Customer phone must use E.164 format' using errcode='22023';
 end if;
 return new;
end $$;
revoke all on function artisan_private.enforce_profile_phone_e164() from public,anon,authenticated;
drop trigger if exists artisan_profile_phone_write on public.artisan_profiles;
create trigger artisan_profile_phone_write
 before insert or update of phone on public.artisan_profiles
 for each row execute function artisan_private.enforce_profile_phone_e164();
