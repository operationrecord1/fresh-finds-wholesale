-- Named-secret allowlist. Only the privileged Supabase Edge runtime may retrieve
-- encrypted Vault credentials. Never return secrets to customer-facing clients.
create or replace function public.artisan_stripe_runtime_secret(p_mode text,p_kind text)
returns text language plpgsql security definer set search_path='' as $$
declare v_name text; v_value text;
begin
 if p_mode not in ('test','live') or p_kind not in ('api_key','webhook_secret')
 then return null; end if;
 v_name:=case
  when p_mode='test' and p_kind='api_key' then 'artisan_stripe_test_key'
  when p_mode='test' and p_kind='webhook_secret' then 'artisan_stripe_test_webhook_secret'
  when p_mode='live' and p_kind='api_key' then 'artisan_stripe_live_key'
  when p_mode='live' and p_kind='webhook_secret' then 'artisan_stripe_live_webhook_secret'
 end;
 select decrypted_secret into v_value from vault.decrypted_secrets where name=v_name;
 return v_value;
end $$;
revoke all on function public.artisan_stripe_runtime_secret(text,text) from public,anon,authenticated;
grant execute on function public.artisan_stripe_runtime_secret(text,text) to service_role;
