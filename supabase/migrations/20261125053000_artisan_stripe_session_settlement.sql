-- Stripe Checkout session attachment, hardened reservation expiry and payment proof.
-- Release gate remains OFF. No Stripe credentials stored in Postgres.
alter table public.artisan_orders
  add column if not exists payment_confirmed_at timestamptz,
  add column if not exists checkout_session_expires_at timestamptz;
create index if not exists artisan_order_checkout_session_idx
  on public.artisan_orders(checkout_session_id)
  where checkout_session_id is not null;

-- An attached Stripe session must NEVER be released based on local wall-clock
-- alone. A verified session.expired event or independent Stripe reconciliation
-- must establish that payment can no longer succeed.
create or replace function artisan_private.expire_pending_orders()
returns integer language plpgsql security definer set search_path='' as $$
declare v_order record; v_res record; v_count integer:=0;
begin
 for v_order in select id from public.artisan_orders
   where status='pending_payment' and reservation_expires_at<=now()
     and checkout_session_id is null
   order by id for update skip locked
 loop
   for v_res in select * from artisan_private.stock_reservations
     where order_id=v_order.id and status='active' order by sku
   loop
     update public.artisan_products set reserved_stock=reserved_stock-v_res.quantity,
       updated_at=now() where sku=v_res.sku and reserved_stock>=v_res.quantity;
     if not found then raise exception 'Reservation inventory mismatch'; end if;
     update artisan_private.stock_reservations set status='released'
       where order_id=v_order.id and sku=v_res.sku and status='active';
   end loop;
   update public.artisan_orders set status='expired',payment_status='cancelled',
      updated_at=now() where id=v_order.id;
   v_count:=v_count+1;
 end loop;
 return v_count;
end $$;
revoke all on function artisan_private.expire_pending_orders() from public,anon,authenticated;

create or replace function public.artisan_attach_checkout_session(
 p_order uuid,p_session_id text,p_expires_at timestamptz)
returns boolean language plpgsql security definer set search_path='' as $$
declare v public.artisan_orders%rowtype;
begin
 if p_session_id !~ '^cs_(test_|live_)[A-Za-z0-9]{12,}$'
   or p_expires_at<now()+interval '15 minutes'
   or p_expires_at>now()+interval '25 hours'
 then raise exception 'Invalid Stripe session'; end if;
 select * into v from public.artisan_orders where id=p_order for update;
 if not found or v.status<>'pending_payment' or v.payment_status<>'unpaid'
 then raise exception 'Cannot attach session to inactive order'; end if;
 if v.checkout_session_id is not null and v.checkout_session_id<>p_session_id
 then raise exception 'A different Stripe session is already attached'; end if;
 update public.artisan_orders set checkout_session_id=p_session_id,
  checkout_session_expires_at=p_expires_at,
  reservation_expires_at=greatest(v.reservation_expires_at,p_expires_at+interval '1 hour'),
  updated_at=now() where id=p_order;
 update artisan_private.stock_reservations
   set expires_at=greatest(expires_at,p_expires_at+interval '1 hour')
   where order_id=p_order and status='active';
 return true;
end $$;
revoke all on function public.artisan_attach_checkout_session(uuid,text,timestamptz)
 from public,anon,authenticated;
grant execute on function public.artisan_attach_checkout_session(uuid,text,timestamptz)
 to service_role;

-- Refund and settlement must be called ONLY after raw Stripe-Signature verification,
-- Stripe API re-retrieval, account matching, and currency/amount comparison.
create or replace function public.artisan_settle_verified_stripe_event(
 p_order uuid,p_event_id text,p_session_id text,p_payment_intent text,
 p_amount_cents bigint,p_currency text,p_outcome text,p_live boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.artisan_orders%rowtype; r record; v_already boolean;
begin
 if p_event_id !~ '^evt_[A-Za-z0-9_]{8,}$'
   or p_session_id !~ '^cs_(test_|live_)[A-Za-z0-9]{12,}$'
   or p_payment_intent !~ '^pi_[A-Za-z0-9_]{8,}$'
   or p_outcome not in ('paid','expired','failed','refunded','partially_refunded')
   or p_amount_cents<0 or p_currency<>'usd'
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
   then raise exception 'Late payment, reconciliation required: order unavailable'; end if;
   for r in select * from artisan_private.stock_reservations
      where order_id=p_order and status='active' order by sku
   loop
     update public.artisan_products set reserved_stock=reserved_stock-r.quantity,
       stock=stock-r.quantity,updated_at=now()
       where sku=r.sku and reserved_stock>=r.quantity and stock>=r.quantity;
     if not found then raise exception 'Stock no longer available, reconciliation required'; end if;
     update artisan_private.stock_reservations set status='confirmed'
       where order_id=p_order and sku=r.sku and status='active';
   end loop;
   if not found and not exists (select 1 from artisan_private.stock_reservations
      where order_id=p_order and status='confirmed')
   then raise exception 'No confirmed order inventory'; end if;
   update public.artisan_orders set status='confirmed',payment_status='paid',
     payment_provider='stripe',payment_intent_id=p_payment_intent,
     payment_confirmed_at=now(),updated_at=now() where id=p_order;
 elsif p_outcome in ('expired','failed') then
   if v.status<>'pending_payment' or v.payment_status<>'unpaid'
   then raise exception 'Cannot expire or fail settled order'; end if;
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
   -- Refunded merchandise is NEVER automatically restocked.
 end if;
 insert into artisan_private.payment_event_receipts(event_id,order_id,provider,event_type)
   values(p_event_id,p_order,'stripe',p_outcome);
 return jsonb_build_object('duplicate',false,'order',p_order,'outcome',p_outcome);
end $$;
revoke all on function public.artisan_settle_verified_stripe_event(uuid,text,text,text,bigint,text,text,boolean)
 from public,anon,authenticated;
grant execute on function public.artisan_settle_verified_stripe_event(uuid,text,text,text,bigint,text,text,boolean)
 to service_role;

-- Retire earlier internal API so new settlement proof is mandatory.
revoke execute on function public.artisan_apply_verified_payment(uuid,text,text,text,text)
 from service_role;
