-- New and edited profile numbers must be in E.164; do not rewrite historical customers.
-- NOT VALID grandfather existing nonstandard records until their owners update them.
alter table public.artisan_profiles
 add constraint artisan_profile_phone_e164
 check (phone='' or phone ~ '^\\+[1-9][0-9]{1,14}$') not valid;
