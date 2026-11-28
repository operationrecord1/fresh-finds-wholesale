alter table artisan_sandbox.orders add column if not exists estimated_delivery_start date;
alter table artisan_sandbox.orders add column if not exists estimated_delivery_end date;
CREATE OR REPLACE FUNCTION public.artisan_sandbox_settle_session(p_order uuid, p_event_id text, p_session_id text, p_payment_intent text, p_amount_cents bigint, p_outcome text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare o artisan_sandbox.orders%rowtype; r record;
begin
 if p_session_id !~ '^cs_test_[A-Za-z0-9]{12,}$' or
   p_event_id !~ '^evt_[A-Za-z0-9_]{8,}$' or
   p_outcome not in ('paid','failed','expired','refunded','partially_refunded')
 then raise exception 'Invalid sandbox payment event'; end if;
 select * into o from artisan_sandbox.orders where id=p_order for update;
 if not found or o.checkout_session_id is distinct from p_session_id
 then raise exception 'Sandbox session/order mismatch'; end if;
 if exists(select 1 from artisan_sandbox.events where event_id=p_event_id)
 then return jsonb_build_object('duplicate',true); end if;
 if p_outcome='paid' then
   if o.total_cents<>p_amount_cents then raise exception 'Sandbox amount mismatch'; end if;
   if o.payment_status='paid' and o.payment_intent_id=p_payment_intent then
      insert into artisan_sandbox.events(event_id,order_id,outcome)
       values(p_event_id,p_order,'paid');
      return jsonb_build_object('duplicate',true); end if;
   if o.status<>'pending_payment' or o.payment_status<>'unpaid'
    or p_payment_intent !~ '^pi_[A-Za-z0-9_]{8,}$'
   then raise exception 'Sandbox order not payable'; end if;
   for r in select * from artisan_sandbox.reservations
      where order_id=p_order and status='active' order by sku
   loop
     update artisan_sandbox.stock set reserved=reserved-r.quantity,
       on_hand=on_hand-r.quantity where sku=r.sku
         and reserved>=r.quantity and on_hand>=r.quantity;
     if not found then raise exception 'Sandbox stock inconsistency'; end if;
     update artisan_sandbox.reservations set status='confirmed'
      where order_id=p_order and sku=r.sku;
   end loop;
   update artisan_sandbox.orders set status='confirmed',payment_status='paid',
    payment_intent_id=p_payment_intent,payment_confirmed_at=now(),estimated_delivery_start=(now() at time zone 'America/New_York')::date+5,estimated_delivery_end=(now() at time zone 'America/New_York')::date+5
    where id=p_order;
 elsif p_outcome in ('failed','expired') then
   if o.status<>'pending_payment' or o.payment_status<>'unpaid'
   then raise exception 'Sandbox payment already settled'; end if;
   for r in select * from artisan_sandbox.reservations
      where order_id=p_order and status='active' order by sku
   loop
     update artisan_sandbox.stock set reserved=reserved-r.quantity
      where sku=r.sku and reserved>=r.quantity;
     if not found then raise exception 'Sandbox stock inconsistency'; end if;
     update artisan_sandbox.reservations set status='released'
      where order_id=p_order and sku=r.sku;
   end loop;
   update artisan_sandbox.orders set
     status=case when p_outcome='expired' then 'expired' else 'cancelled' end,
     payment_status=case when p_outcome='expired' then 'cancelled' else 'failed' end
    where id=p_order;
 else
   if o.payment_status not in ('paid','partially_refunded') or
      o.payment_intent_id is distinct from p_payment_intent or
      p_amount_cents>o.total_cents
   then raise exception 'Sandbox refund mismatch'; end if;
   update artisan_sandbox.orders set payment_status=case
     when p_amount_cents=o.total_cents then 'refunded' else 'partially_refunded' end
    where id=p_order;
 end if;
 insert into artisan_sandbox.events(event_id,order_id,outcome)
  values(p_event_id,p_order,p_outcome);
 return jsonb_build_object('duplicate',false,'outcome',p_outcome);
end $function$
;