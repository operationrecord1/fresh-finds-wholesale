-- Artisan Mart customer identity. All privileged membership data is private.
create schema if not exists artisan_private;
revoke all on schema artisan_private from public, anon, authenticated;
create table if not exists public.artisan_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 first_name text not null default '' check(length(first_name)<=120),
 last_name text not null default '' check(length(last_name)<=120),
 phone text not null default '' check(length(phone)<=40),
 newsletter_opt_in boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists artisan_private.staff_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('admin','staff')),
 granted_at timestamptz not null default now()
);
create table if not exists public.artisan_customer_addresses (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 label text not null default 'Shipping' check(length(label) between 1 and 80),
 first_name text not null check(length(first_name) between 1 and 120),
 last_name text not null check(length(last_name) between 1 and 120),
 company text check(company is null or length(company)<=160),
 line1 text not null check(length(line1) between 1 and 240),
 line2 text check(line2 is null or length(line2)<=240),
 city text not null check(length(city) between 1 and 140),
 state text not null check(length(state) between 1 and 100),
 postal_code text not null check(length(postal_code) between 1 and 20),
 country text not null default 'US' check(country='US'),
 phone text check(phone is null or length(phone)<=40),
 created_at timestamptz not null default now()
);
create index if not exists artisan_customer_addresses_owner_idx on public.artisan_customer_addresses(user_id);
alter table public.artisan_profiles enable row level security;
alter table public.artisan_customer_addresses enable row level security;
alter table artisan_private.staff_roles enable row level security;
revoke all on public.artisan_profiles,public.artisan_customer_addresses from anon,authenticated;
grant select on public.artisan_profiles to authenticated;
grant update (first_name,last_name,phone,newsletter_opt_in) on public.artisan_profiles to authenticated;
grant select,insert,update,delete on public.artisan_customer_addresses to authenticated;
create policy artisan_profile_owner_read on public.artisan_profiles for select to authenticated
 using (user_id=(select auth.uid()));
create policy artisan_profile_owner_update on public.artisan_profiles for update to authenticated
 using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy artisan_address_owner_read on public.artisan_customer_addresses for select to authenticated
 using (user_id=(select auth.uid()));
create policy artisan_address_owner_insert on public.artisan_customer_addresses for insert to authenticated
 with check (user_id=(select auth.uid()));
create policy artisan_address_owner_update on public.artisan_customer_addresses for update to authenticated
 using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy artisan_address_owner_delete on public.artisan_customer_addresses for delete to authenticated
 using (user_id=(select auth.uid()));
create or replace function artisan_private.create_customer_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 insert into public.artisan_profiles(user_id,first_name,last_name,phone,newsletter_opt_in)
 values(new.id,
 left(coalesce(new.raw_user_meta_data->>'first_name',''),120),
 left(coalesce(new.raw_user_meta_data->>'last_name',''),120),
 left(coalesce(new.raw_user_meta_data->>'phone',''),40),
 coalesce((new.raw_user_meta_data->>'newsletter_opt_in')::boolean,false))
 on conflict(user_id) do nothing;
 return new;
end $$;
revoke all on function artisan_private.create_customer_profile() from public,anon,authenticated;
create trigger artisan_create_customer_profile
after insert on auth.users
for each row execute function artisan_private.create_customer_profile();
