-- Authentication-only additive profile sync.
-- Email confirmation/identity status remains authoritative in auth.users.
alter table public.artisan_profiles add column if not exists email text;
update public.artisan_profiles p set email=u.email from auth.users u where p.user_id=u.id and p.email is distinct from u.email;
alter table public.artisan_profiles alter column email set not null;
create or replace function artisan_private.create_customer_profile()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.artisan_profiles(user_id,email,first_name,last_name,phone,newsletter_opt_in)
  values(new.id,new.email,
    left(coalesce(new.raw_user_meta_data->>'first_name',''),120),
    left(coalesce(new.raw_user_meta_data->>'last_name',''),120),
    left(coalesce(new.raw_user_meta_data->>'phone',''),40),
    coalesce((new.raw_user_meta_data->>'newsletter_opt_in')::boolean,false))
  on conflict(user_id) do nothing;
  return new;
end $$;
create or replace function artisan_private.sync_customer_email()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.email is distinct from old.email then
  update public.artisan_profiles
    set email=new.email,updated_at=now()
    where user_id=new.id;
 end if;
 return new;
end $$;
revoke all on function artisan_private.sync_customer_email() from public,anon,authenticated;
drop trigger if exists artisan_sync_customer_email on auth.users;
create trigger artisan_sync_customer_email after update of email on auth.users
for each row execute function artisan_private.sync_customer_email();
create or replace function artisan_private.stamp_customer_profile()
returns trigger language plpgsql set search_path='' as $$
begin
 new.updated_at=now();
 return new;
end $$;
revoke all on function artisan_private.stamp_customer_profile() from public,anon,authenticated;
drop trigger if exists artisan_stamp_customer_profile on public.artisan_profiles;
create trigger artisan_stamp_customer_profile before update on public.artisan_profiles
for each row execute function artisan_private.stamp_customer_profile();
revoke update(email,user_id,created_at,updated_at) on public.artisan_profiles from authenticated;
