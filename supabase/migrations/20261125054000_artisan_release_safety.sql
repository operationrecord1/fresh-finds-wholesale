-- Payment and business-policy release gate: no live enablement before proof.
alter table artisan_private.checkout_release_flags
  add column if not exists auth_email_verified boolean not null default false,
  add column if not exists external_smtp_verified boolean not null default false,
  add column if not exists shipping_policy_verified boolean not null default false,
  add column if not exists tax_policy_verified boolean not null default false,
  add column if not exists stripe_webhook_verified boolean not null default false,
  add column if not exists sandbox_payment_verified boolean not null default false;
alter table artisan_private.checkout_release_flags
  add constraint artisan_checkout_release_requires_verification
  check (not checkout_enabled or
    (auth_email_verified and external_smtp_verified and shipping_policy_verified
      and tax_policy_verified and stripe_webhook_verified and sandbox_payment_verified));

create or replace function public.artisan_cancel_pending_order(p_order uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_uid uuid; v_order public.artisan_orders%rowtype; v_item record;
begin
 v_uid:=(select auth.uid());
 if v_uid is null then raise exception 'Authentication required' using errcode='28000'; end if;
 select * into v_order from public.artisan_orders where id=p_order and customer_id=v_uid for update;
 if not found then raise exception 'Order not found'; end if;
 if v_order.status<>'pending_payment' or v_order.payment_status<>'unpaid'
 then return false; end if;
 if v_order.checkout_session_id is not null then
  -- The active Stripe session must first be confirmed expired/cancelled by Stripe,
  -- and only a signed webhook/server reconciliation may release its stock.
  raise exception 'Stripe checkout must be expired and reconciled before cancelling order';
 end if;
 for v_item in select * from artisan_private.stock_reservations
   where order_id=p_order and status='active' order by sku
 loop
  update public.artisan_products set reserved_stock=reserved_stock-v_item.quantity,
    updated_at=now() where sku=v_item.sku and reserved_stock>=v_item.quantity;
  if not found then raise exception 'Reservation discrepancy'; end if;
  update artisan_private.stock_reservations set status='released'
    where order_id=p_order and sku=v_item.sku and status='active';
 end loop;
 update public.artisan_orders set status='cancelled',payment_status='cancelled',
   updated_at=now() where id=p_order;
 return true;
end $$;
revoke all on function public.artisan_cancel_pending_order(uuid) from public,anon;
grant execute on function public.artisan_cancel_pending_order(uuid) to authenticated;

-- Relax PaymentIntent requirement for provably expired Checkout Sessions;
-- these may never have created a PaymentIntent.
create or replace function public.artisan_settle_verified_stripe_event(
 p_order uuid,p_event_id text,p_session_id text,p_payment_intent text,
 p_amount_cents bigint,p_currency text,p_outcome text,p_live boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.artisan_orders%rowtype; r record; v_already boolean; v_held int:=0;
begin
 if p_event_id !~ '^evt_[A-Za-z0-9_]{8,}$'
   or p_session_id !~ '^cs_(test_|live_)[A-Za-z0-9]{12,}$'
   or p_outcome not in ('paid','expired','failed','refunded','partially_refunded')
   or p_amount_cents<0 or p_currency<>'usd'
   or (p_outcome in ('paid','refunded','partially_refunded')
        and p_payment_intent !~ '^pi_[A-Za-z0-9_]{8,}$')
 then raise exception 'Invalid settlement proof'; end if;
 if p_live and left(p_session_id,8)<>'cs_live_' then raise exception 'Session mode mismatch'; end if;
 if not p_live and left(p_session_id,8)<>'cs_test_' then raise exception 'Session mode mismatch'; end if;
 select * into v from public.artisan_orders where id=p_order for update;
 if not found or v.checkout_session_id is distinct from p_session_id
 then raise exception 'Session/order mismatch'; end if;
 select exists(select 1 from artisan_private.payment_event_receipts
   where event_id=p_event_id) into v_already;
 if v_already then return jsonb_build_object('duplicate',true,'order',p_order,
   'status',v.status,'payment_status',v.payment_status); end if;
 if p_outcome='paid' then
   if p_amount_cents<>v.total_cents then raise exception 'Payment amount mismatch'; end if;
   if v.payment_status='paid' and v.payment_intent_id=p_payment_intent then
     insert into artisan_private.payment_event_receipts(event_id,order_id,provider,event_type)
       values(p_event_id,p_order,'stripe','paid');
     return jsonb_build_object('duplicate',true,'order',p_order,'payment_status','paid');
   end if;
   if v.status<>'pending_payment' or v.payment_status<>'unpaid'
   then raise exception 'Late payment, reconciliation required'; end if;
   for r in select * from artisan_private.stock_reservations
      where order_id=p_order and status='active' order by sku
   loop
     update public.artisan_products set reserved_stock=reserved_stock-r.quantity,
       stock=stock-r.quantity,updated_at=now()
       where sku=r.sku and reserved_stock>=r.quantity and stock>=r.quantity;
     if not found then raise exception 'Stock unavailable, reconciliation required'; end if;
     update artisan_private.stock_reservations set status='confirmed'
       where order_id=p_order and sku=r.sku and status='active';
     v_held:=v_held+1;
   end loop;
   if v_held=0 then raise exception 'No reserved items for paid order'; end if;
   update public.artisan_orders set status='confirmed',payment_status='paid',
     payment_provider='stripe',payment_intent_id=p_payment_intent,
     payment_confirmed_at=now(),updated_at=now() where id=p_order;
 elsif p_outcome in ('expired','failed') then
   if v.status<>'pending_payment' or v.payment_status<>'unpaid'
   then raise exception 'Cannot expire or fail a settled order'; end if;
   for r in select * from artisan_private.stock_reservations
     where order_id=p_order and status='active' order by sku
   loop
     update public.artisan_products set reserved_stock=reserved_stock-r.quantity,
       updated_at=now() where sku=r.sku and reserved_stock>=r.quantity;
     if not found then raise exception 'Reservation inconsistency'; end if;
     update artisan_private.stock_reservations set status='released'
       where order_id=p_order and sku=r.sku and status='active';
   end loop;
   update public.artisan_orders set status=case when p_outcome='expired' then 'expired' else 'cancelled' end,
     payment_status=case when p_outcome='expired' then 'cancelled' else 'failed' end,
     payment_provider='stripe',updated_at=now() where id=p_order;
 else
   if v.payment_status not in ('paid','partially_refunded')
      or v.payment_intent_id is distinct from p_payment_intent
      or p_amount_cents>v.total_cents
   then raise exception 'Refund is not associated with paid order'; end if;
   update public.artisan_orders set
     payment_status=case when p_outcome='refunded' and p_amount_cents=v.total_cents
       then 'refunded' else 'partially_refunded' end,
     updated_at=now() where id=p_order;
 end if;
 insert into artisan_private.payment_event_receipts(event_id,order_id,provider,event_type)
   values(p_event_id,p_order,'stripe',p_outcome);
 return jsonb_build_object('duplicate',false,'order',p_order,'outcome',p_outcome);
end $$;
revoke all on function public.artisan_settle_verified_stripe_event(uuid,text,text,text,bigint,text,text,boolean)
 from public,anon,authenticated;
grant execute on function public.artisan_settle_verified_stripe_event(uuid,text,text,text,bigint,text,text,boolean)
 to service_role;
