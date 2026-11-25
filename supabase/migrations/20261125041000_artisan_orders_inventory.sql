-- Artisan Mart: atomic pending-payment checkout and reservation foundation.
-- All end-user checkout creation stays OFF until verified payment integration.
alter table public.artisan_products
  add column if not exists reserved_stock integer not null default 0
  check (reserved_stock >= 0 and (stock is null or reserved_stock <= stock));

create view public.artisan_catalog_available
  with (security_invoker = true)
as select sku,title,price,original_price,
  case when stock is null then null else stock-reserved_stock end as stock,
  category,subcategory,description,upc,badges,collections,images,
  specs,purchase_rules,source_record
from public.artisan_products;
revoke all on public.artisan_catalog_available from public,anon,authenticated;
grant select on public.artisan_catalog_available to anon,authenticated;

create table public.artisan_orders (
 id uuid primary key default gen_random_uuid(),
 order_number bigint generated always as identity unique,
 customer_id uuid not null references auth.users(id) on delete restrict,
 contact_email text not null check(length(contact_email) between 3 and 254),
 billing_address jsonb not null check(jsonb_typeof(billing_address)='object'),
 shipping_address jsonb not null check(jsonb_typeof(shipping_address)='object'),
 subtotal_cents bigint not null check(subtotal_cents >= 0),
 discount_cents bigint not null default 0 check(discount_cents >= 0),
 shipping_cents bigint not null default 0 check(shipping_cents >= 0),
 tax_cents bigint not null default 0 check(tax_cents >= 0),
 total_cents bigint not null check(total_cents >= 0),
 currency text not null default 'usd' check(currency='usd'),
 status text not null default 'pending_payment'
   check(status in ('pending_payment','confirmed','cancelled','expired','fulfilling','fulfilled')),
 payment_status text not null default 'unpaid'
   check(payment_status in ('unpaid','paid','failed','cancelled','refunded','partially_refunded')),
 payment_provider text,
 checkout_session_id text unique,
 payment_intent_id text unique,
 idempotency_key text not null check(length(idempotency_key) between 20 and 128),
 reservation_expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(customer_id,idempotency_key),
 check(total_cents=subtotal_cents-discount_cents+shipping_cents+tax_cents)
);
create index artisan_orders_customer_created_idx on public.artisan_orders(customer_id,created_at desc);
create index artisan_orders_expiration_idx on public.artisan_orders(reservation_expires_at)
  where status='pending_payment';

create table public.artisan_order_items (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.artisan_orders(id) on delete restrict,
 sku text not null references public.artisan_products(sku) on delete restrict,
 title_snapshot text not null,
 quantity integer not null check(quantity>0),
 mode text not null check(mode in ('piece','case')),
 unit_price_cents bigint not null check(unit_price_cents>=0),
 line_total_cents bigint not null check(line_total_cents>=0),
 product_snapshot jsonb not null check(jsonb_typeof(product_snapshot)='object'),
 unique(order_id,sku),
 check(line_total_cents=quantity*unit_price_cents)
);
create index artisan_order_items_sku_idx on public.artisan_order_items(sku);

create table artisan_private.stock_reservations (
 order_id uuid not null references public.artisan_orders(id) on delete restrict,
 sku text not null references public.artisan_products(sku) on delete restrict,
 quantity integer not null check(quantity>0),
 status text not null default 'active' check(status in ('active','released','confirmed')),
 expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 primary key(order_id,sku)
);
create index artisan_reservations_expiration_idx on artisan_private.stock_reservations(expires_at)
 where status='active';
create index artisan_reservations_sku_idx on artisan_private.stock_reservations(sku);

create table artisan_private.payment_event_receipts (
 event_id text primary key,
 order_id uuid not null references public.artisan_orders(id) on delete restrict,
 provider text not null,
 event_type text not null,
 processed_at timestamptz not null default now()
);
create index artisan_event_order_idx on artisan_private.payment_event_receipts(order_id);

create table artisan_private.checkout_release_flags (
 id boolean primary key default true check(id),
 checkout_enabled boolean not null default false,
 changed_at timestamptz not null default now()
);
insert into artisan_private.checkout_release_flags(id,checkout_enabled)
 values(true,false) on conflict(id) do nothing;

alter table public.artisan_orders enable row level security;
alter table public.artisan_order_items enable row level security;
alter table artisan_private.stock_reservations enable row level security;
alter table artisan_private.payment_event_receipts enable row level security;
alter table artisan_private.checkout_release_flags enable row level security;
revoke all on public.artisan_orders,public.artisan_order_items from public,anon,authenticated;
revoke all on artisan_private.stock_reservations,artisan_private.payment_event_receipts,
 artisan_private.checkout_release_flags from public,anon,authenticated;
grant select on public.artisan_orders,public.artisan_order_items to authenticated;
create policy artisan_orders_owner_read on public.artisan_orders for select to authenticated
 using(customer_id=(select auth.uid()));
create policy artisan_order_items_owner_read on public.artisan_order_items for select to authenticated
 using(exists(select 1 from public.artisan_orders o
     where o.id=artisan_order_items.order_id and o.customer_id=(select auth.uid())));

-- Called as the postgres owner, or later by a cron job. This also runs
-- before any reservation creation, so stale holds cannot oversell.
create function artisan_private.expire_pending_orders()
returns integer language plpgsql security definer set search_path='' as $$
declare v_order record; v_res record; v_count integer:=0;
begin
 for v_order in
  select id from public.artisan_orders
  where status='pending_payment' and reservation_expires_at <= now()
  order by id for update skip locked
 loop
  for v_res in select * from artisan_private.stock_reservations
       where order_id=v_order.id and status='active' order by sku
  loop
   update public.artisan_products set reserved_stock=reserved_stock-v_res.quantity
    where sku=v_res.sku and reserved_stock>=v_res.quantity;
   if not found then raise exception 'Reservation inventory inconsistency for %',v_res.sku; end if;
   update artisan_private.stock_reservations set status='released'
     where order_id=v_order.id and sku=v_res.sku and status='active';
  end loop;
  update public.artisan_orders
    set status='expired',payment_status='cancelled',updated_at=now()
    where id=v_order.id;
  v_count:=v_count+1;
 end loop;
 return v_count;
end $$;
revoke all on function artisan_private.expire_pending_orders() from public,anon,authenticated;

create function public.artisan_begin_checkout(
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
 select * into v_existing from public.artisan_orders
  where customer_id=v_uid and idempotency_key=p_idempotency_key;
 if found then
  return jsonb_build_object('order_id',v_existing.id,'order_number',
    'AM-'||lpad(v_existing.order_number::text,8,'0'),
    'total_cents',v_existing.total_cents,'status',v_existing.status,
    'payment_status',v_existing.payment_status,'duplicate',true);
 end if;
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
revoke all on function public.artisan_begin_checkout(text,jsonb,jsonb,jsonb,text)
 from public,anon;
grant execute on function public.artisan_begin_checkout(text,jsonb,jsonb,jsonb,text)
 to authenticated;

create function public.artisan_cancel_pending_order(p_order uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_uid uuid; v_order public.artisan_orders%rowtype; v_item record;
begin
 v_uid:=(select auth.uid());
 if v_uid is null then raise exception 'Authentication required' using errcode='28000'; end if;
 select * into v_order from public.artisan_orders
 where id=p_order and customer_id=v_uid for update;
 if not found then raise exception 'Order not found'; end if;
 if v_order.status<>'pending_payment' or v_order.payment_status<>'unpaid'
 then return false; end if;
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
