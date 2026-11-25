create or replace function public.artisan_begin_checkout(
 p_idempotency_key text,p_items jsonb,p_billing jsonb,p_shipping jsonb,p_coupon text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_uid uuid; v_email text; v_enabled boolean; v_existing public.artisan_orders%rowtype;
 v_line jsonb; v_product public.artisan_products%rowtype; v_quantity integer;
 v_mode text; v_sku text; v_subtotal bigint:=0; v_unit_price bigint;
 v_order uuid; v_order_number bigint; v_exp timestamptz:=now()+interval '30 minutes';
 v_seen text[]:=array[]::text[]; v_total_rows integer;
begin
 v_uid:=(select auth.uid());
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
 if p_coupon is not null and p_coupon<>'' and not exists(
   select 1 from public.artisan_coupons
     where code=p_coupon and enabled and mode='demo' and discount_amount=0)
 then raise exception 'Coupon is not valid'; end if;

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
 insert into public.artisan_orders
 (customer_id,contact_email,billing_address,shipping_address,subtotal_cents,
  total_cents,idempotency_key,reservation_expires_at)
 values(v_uid,v_email,p_billing,p_shipping,v_subtotal,v_subtotal,p_idempotency_key,v_exp)
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
  lpad(v_order_number::text,8,'0'),'total_cents',v_subtotal,
  'status','pending_payment','payment_status','unpaid',
  'reservation_expires_at',v_exp,'duplicate',false);
end $$;
