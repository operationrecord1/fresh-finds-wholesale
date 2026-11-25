create or replace function public.artisan_sandbox_cancel_unattached(p_order uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare o artisan_sandbox.orders%rowtype; r record;
begin
 select * into o from artisan_sandbox.orders where id=p_order for update;
 if not found then return false; end if;
 if o.status<>'pending_payment' or o.checkout_session_id is not null then
   raise exception 'Cannot cancel an open or settled sandbox Stripe session';
 end if;
 for r in select * from artisan_sandbox.reservations
   where order_id=p_order and status='active' order by sku
 loop
  update artisan_sandbox.stock set reserved=reserved-r.quantity
    where sku=r.sku and reserved>=r.quantity;
  if not found then raise exception 'Sandbox stock mismatch'; end if;
  update artisan_sandbox.reservations set status='released'
    where order_id=p_order and sku=r.sku and status='active';
 end loop;
 update artisan_sandbox.orders set status='cancelled',payment_status='cancelled'
 where id=p_order;
 return true;
end $$;

create or replace function public.artisan_sandbox_order_by_payment_intent(p_intent text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare o artisan_sandbox.orders%rowtype;
begin
 if p_intent !~ '^pi_[A-Za-z0-9_]{8,}$' then return null; end if;
 select * into o from artisan_sandbox.orders where payment_intent_id=p_intent;
 if not found then return null; end if;
 return jsonb_build_object('id',o.id,'checkout_session_id',o.checkout_session_id,
  'total_cents',o.total_cents,'payment_status',o.payment_status,
  'payment_intent_id',o.payment_intent_id,'customer_id',o.customer_id);
end $$;
revoke all on function public.artisan_sandbox_cancel_unattached(uuid) from public,anon,authenticated;
revoke all on function public.artisan_sandbox_order_by_payment_intent(text) from public,anon,authenticated;
grant execute on function public.artisan_sandbox_cancel_unattached(uuid) to service_role;
grant execute on function public.artisan_sandbox_order_by_payment_intent(text) to service_role;
