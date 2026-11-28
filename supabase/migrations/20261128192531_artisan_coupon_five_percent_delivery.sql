-- Preserve backend order expiry and existing ownership/stock/idempotency checks.
alter table public.artisan_orders add column if not exists coupon_code text;
alter table artisan_sandbox.orders add column if not exists coupon_code text;
alter table artisan_sandbox.orders add column if not exists discount_cents bigint not null default 0 check(discount_cents>=0);
update public.artisan_coupons set mode='percent',discount_amount=5,message='ARTISAN applied: 5% off.',enabled=true where code='ARTISAN';

CREATE OR REPLACE FUNCTION public.artisan_begin_checkout_service(p_customer_id uuid, p_idempotency_key text, p_items jsonb, p_billing jsonb, p_shipping jsonb, p_coupon text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_uid uuid; v_email text; v_enabled boolean; v_existing public.artisan_orders%rowtype;
 v_line jsonb; v_product public.artisan_products%rowtype; v_quantity integer;
 v_mode text; v_sku text; v_subtotal bigint:=0; v_unit_price bigint;
 v_discount bigint:=0; v_coupon text:=nullif(upper(btrim(p_coupon)),'');
 v_order uuid; v_order_number bigint; v_exp timestamptz:=now()+interval '30 minutes';
 v_seen text[]:=array[]::text[]; v_total_rows integer;
begin
 v_uid:=p_customer_id;
 if v_uid is null then raise exception 'Authentication required' using errcode='28000'; end if;
 select email into v_email from auth.users where id=v_uid and email_confirmed_at is not null;
 if v_email is null then raise exception 'Email verification required' using errcode='28000'; end if;
 select checkout_enabled into v_enabled
  from artisan_private.checkout_release_flags where id=true;
 if v_enabled is distinct from true then
  raise exception 'Checkout payments are not yet enabled' using errcode='P0001';
 end if;
 if p_idempotency_key !~ '^[A-Za-z0-9_-]{20,128}$'
 then raise exception 'Invalid idempotency key'; end if;
 -- Serialize concurrent retries for a customer/idempotency key before reading.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text||':'||p_idempotency_key,0));
 select * into v_existing from public.artisan_orders
  where customer_id=v_uid and idempotency_key=p_idempotency_key;
 if found then
  if v_existing.coupon_code is distinct from v_coupon then raise exception 'Checkout coupon changed; start a new checkout'; end if;
  return jsonb_build_object('order_id',v_existing.id,'order_number',
    'AM-'||lpad(v_existing.order_number::text,8,'0'),
    'total_cents',v_existing.total_cents,'status',v_existing.status,
    'payment_status',v_existing.payment_status,'duplicate',true);
 end if;
 -- Prevent repeated reservation abuse even if the client bypasses frontend buttons.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('artisan-rate:'||v_uid::text,0));
 if (select count(*) from public.artisan_orders
     where customer_id=v_uid and created_at>now()-interval '1 minute')>=3
 then raise exception 'Too many checkout requests'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 100
 then raise exception 'Invalid cart'; end if;
 if jsonb_typeof(p_billing)<>'object' or jsonb_typeof(p_shipping)<>'object'
 then raise exception 'Invalid address'; end if;
 if (p_billing->>'country') <> 'US' or (p_shipping->>'country') <> 'US'
 then raise exception 'United States addresses required'; end if;
 if length(coalesce(p_billing->>'line1','')) not between 1 and 240 or
    length(coalesce(p_shipping->>'line1','')) not between 1 and 240 or
    length(coalesce(p_billing->>'city','')) not between 1 and 140 or
    length(coalesce(p_shipping->>'city','')) not between 1 and 140 or
    length(coalesce(p_billing->>'postal_code','')) not between 1 and 20 or
    length(coalesce(p_shipping->>'postal_code','')) not between 1 and 20
 then raise exception 'Missing or invalid billing/shipping address'; end if;
 if v_coupon is not null and (v_coupon<>'ARTISAN' or not exists(select 1 from public.artisan_coupons where code='ARTISAN' and enabled and mode='percent' and discount_amount=5)) then raise exception 'Coupon is not valid'; end if;

 -- Normalize and sort before locking: consistent lock order prevents deadlocks.
 perform artisan_private.expire_pending_orders();
 for v_line in select value from jsonb_array_elements(p_items) as item(value)
   order by value->>'sku'
 loop
  v_sku:=v_line->>'sku';
  v_mode:=v_line->>'mode';
  if v_sku is null or v_sku=any(v_seen) or
    v_mode not in ('piece','case') or
    (v_line->>'quantity') !~ '^[1-9][0-9]{0,7}$'
  then raise exception 'Invalid or duplicate product/quantity'; end if;
  v_seen:=array_append(v_seen,v_sku);
  v_quantity:=(v_line->>'quantity')::integer;
  select * into v_product from public.artisan_products
   where sku=v_sku for update;
  if not found or v_product.price is null or v_product.stock is null
       or v_product.purchase_rules is null
  then raise exception 'Product unavailable'; end if;
  if v_mode='piece' and (
    v_quantity<(v_product.purchase_rules->>'moq')::int or
    mod(v_quantity,(v_product.purchase_rules->>'lot')::int)<>0)
  then raise exception 'Invalid piece quantity'; end if;
  if v_mode='case' and
    mod(v_quantity,(v_product.purchase_rules->>'caseQty')::int)<>0
  then raise exception 'Invalid case quantity'; end if;
  if v_quantity>v_product.stock-v_product.reserved_stock
  then raise exception 'Insufficient available inventory'; end if;
  v_unit_price:=round(v_product.price*100)::bigint;
  v_subtotal:=v_subtotal+v_unit_price*v_quantity;
 end loop;
 if v_subtotal<50000 then raise exception 'Minimum order is $500'; end if;
 if v_subtotal>100000000000 then raise exception 'Order amount too large'; end if;
 v_discount:=case when v_coupon='ARTISAN' then round(v_subtotal::numeric*5/100)::bigint else 0 end;
 insert into public.artisan_orders
 (customer_id,contact_email,billing_address,shipping_address,subtotal_cents,
  total_cents,idempotency_key,reservation_expires_at,discount_cents,coupon_code)
 values(v_uid,v_email,p_billing,p_shipping,v_subtotal,v_subtotal-v_discount,p_idempotency_key,v_exp,v_discount,v_coupon)
 returning id,order_number into v_order,v_order_number;
 for v_line in select value from jsonb_array_elements(p_items) as item(value)
   order by value->>'sku'
 loop
  v_sku:=v_line->>'sku';
  v_mode:=v_line->>'mode';v_quantity:=(v_line->>'quantity')::integer;
  select * into v_product from public.artisan_products
    where sku=v_sku for update;
  v_unit_price:=round(v_product.price*100)::bigint;
  update public.artisan_products set reserved_stock=reserved_stock+v_quantity,
   updated_at=now() where sku=v_sku;
  insert into public.artisan_order_items
   (order_id,sku,title_snapshot,quantity,mode,unit_price_cents,line_total_cents,product_snapshot)
  values(v_order,v_sku,v_product.title,v_quantity,v_mode,v_unit_price,
    v_unit_price*v_quantity,v_product.source_record);
  insert into artisan_private.stock_reservations(order_id,sku,quantity,expires_at)
    values(v_order,v_sku,v_quantity,v_exp);
 end loop;
 return jsonb_build_object('order_id',v_order,'order_number','AM-'||
  lpad(v_order_number::text,8,'0'),'total_cents',v_subtotal-v_discount,
  'status','pending_payment','payment_status','unpaid',
  'reservation_expires_at',v_exp,'duplicate',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.artisan_sandbox_begin_checkout(p_customer_id uuid, p_idempotency_key text, p_items jsonb, p_billing jsonb, p_shipping jsonb, p_coupon text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare o artisan_sandbox.orders%rowtype; l jsonb; p public.artisan_products%rowtype;
 v_qty integer; v_mode text; v_sku text; v_total bigint:=0;
 v_seen text[]:=array[]::text[]; v_discount bigint:=0; v_coupon text:=nullif(upper(btrim(p_coupon)),'');
begin
 if not exists(select 1 from auth.users u where u.id=p_customer_id
   and u.email_confirmed_at is not null) then raise exception 'Verified customer required'; end if;
 if p_idempotency_key !~ '^[A-Za-z0-9_-]{20,128}$' then raise exception 'Bad idempotency key'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('sandbox:'||p_customer_id::text||p_idempotency_key,0));
 select * into o from artisan_sandbox.orders where customer_id=p_customer_id
  and idempotency_key=p_idempotency_key;
 if found and o.coupon_code is distinct from v_coupon then raise exception 'Checkout coupon changed'; end if;
 if found then return jsonb_build_object('order_id',o.id,'order_number','TEST-'||lpad(o.order_number::text,8,'0'),
   'total_cents',o.total_cents,'duplicate',true); end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 100 then
   raise exception 'Invalid cart'; end if;
 if jsonb_typeof(p_billing)<>'object' or jsonb_typeof(p_shipping)<>'object'
  or p_billing->>'country'<>'US' or p_shipping->>'country'<>'US'
  or length(coalesce(p_billing->>'line1',''))<1 or
  length(coalesce(p_shipping->>'line1',''))<1
 then raise exception 'Invalid US addresses'; end if;
 if coalesce(v_coupon,'') not in ('','ARTISAN') then raise exception 'Invalid coupon'; end if;
 for l in select value from jsonb_array_elements(p_items) i(value) order by value->>'sku' loop
  v_sku=l->>'sku'; v_mode=l->>'mode';
  if v_sku is null or v_sku=any(v_seen) or v_mode not in ('piece','case')
     or (l->>'quantity') !~ '^[1-9][0-9]{0,7}$'
  then raise exception 'Invalid item'; end if;
  v_seen:=array_append(v_seen,v_sku);
  v_qty:=(l->>'quantity')::integer;
  select * into p from public.artisan_products where sku=v_sku;
  if not found or p.price is null or p.purchase_rules is null then raise exception 'Unavailable item'; end if;
  if (v_mode='piece' and (v_qty<(p.purchase_rules->>'moq')::int
        or mod(v_qty,(p.purchase_rules->>'lot')::int)<>0))
   or (v_mode='case' and mod(v_qty,(p.purchase_rules->>'caseQty')::int)<>0)
  then raise exception 'Invalid quantity'; end if;
  perform 1 from artisan_sandbox.stock where sku=v_sku and on_hand-reserved>=v_qty for update;
  if not found then raise exception 'Not enough sandbox stock'; end if;
  v_total:=v_total+round(p.price*100)::bigint*v_qty;
 end loop;
 if v_total<50000 then raise exception '$500 minimum'; end if;
 v_discount:=case when v_coupon='ARTISAN' then round(v_total::numeric*5/100)::bigint else 0 end;
 insert into artisan_sandbox.orders(customer_id,idempotency_key,contact_email,
  billing_address,shipping_address,subtotal_cents,total_cents,discount_cents,coupon_code)
 values(p_customer_id,p_idempotency_key,
 (select email from auth.users where id=p_customer_id),
 p_billing,p_shipping,v_total,v_total-v_discount,v_discount,v_coupon) returning * into o;
 for l in select value from jsonb_array_elements(p_items) i(value) order by value->>'sku' loop
  v_sku:=l->>'sku'; v_qty:=(l->>'quantity')::integer;v_mode=l->>'mode';
  select * into p from public.artisan_products where sku=v_sku;
  update artisan_sandbox.stock set reserved=reserved+v_qty where sku=v_sku;
  insert into artisan_sandbox.items(order_id,sku,quantity,mode,title_snapshot,
    unit_price_cents,line_total_cents)
  values(o.id,v_sku,v_qty,v_mode,p.title,round(p.price*100)::bigint,
    round(p.price*100)::bigint*v_qty);
  insert into artisan_sandbox.reservations(order_id,sku,quantity)
   values(o.id,v_sku,v_qty);
 end loop;
 return jsonb_build_object('order_id',o.id,'order_number','TEST-'||lpad(o.order_number::text,8,'0'),
  'total_cents',o.total_cents,'duplicate',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.artisan_settle_verified_stripe_event(p_order uuid, p_event_id text, p_session_id text, p_payment_intent text, p_amount_cents bigint, p_currency text, p_outcome text, p_live boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
     payment_confirmed_at=now(),estimated_delivery_start=(now() at time zone 'America/New_York')::date+5,estimated_delivery_end=(now() at time zone 'America/New_York')::date+5,updated_at=now() where id=p_order;
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
end $function$
;

CREATE OR REPLACE FUNCTION public.artisan_sandbox_order_details(p_order uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare o artisan_sandbox.orders%rowtype;
begin
 select * into o from artisan_sandbox.orders where id=p_order;
 if not found then return null; end if;
 return jsonb_build_object('id',o.id,'customer_id',o.customer_id,
  'total_cents',o.total_cents,'subtotal_cents',o.subtotal_cents,'discount_cents',o.discount_cents,'shipping_cents',0,'tax_cents',0,'coupon_code',o.coupon_code,'currency','usd',
  'status',o.status,'payment_status',o.payment_status,
  'checkout_session_id',o.checkout_session_id,
  'items',(select coalesce(jsonb_agg(jsonb_build_object('sku',sku,
   'title_snapshot',title_snapshot,'quantity',quantity,
   'unit_price_cents',unit_price_cents,'line_total_cents',line_total_cents)),
    '[]'::jsonb) from artisan_sandbox.items where order_id=p_order));
end $function$
;
