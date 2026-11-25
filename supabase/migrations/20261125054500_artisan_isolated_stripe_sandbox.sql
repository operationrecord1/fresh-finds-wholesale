-- Isolated test-mode commerce tables inside the existing Artisan Mart project.
-- Sandbox sessions MUST NEVER reserve or deduct public.artisan_products stock.
create schema if not exists artisan_sandbox;
revoke all on schema artisan_sandbox from public,anon,authenticated;
create table if not exists artisan_sandbox.stock (
 sku text primary key references public.artisan_products(sku) on delete restrict,
 on_hand integer not null check(on_hand>=0),
 reserved integer not null default 0 check(reserved>=0 and reserved<=on_hand)
);
insert into artisan_sandbox.stock(sku,on_hand)
 select sku,coalesce(stock,0) from public.artisan_products on conflict do nothing;

create table if not exists artisan_sandbox.orders (
 id uuid primary key default gen_random_uuid(),
 order_number bigint generated always as identity unique,
 customer_id uuid not null references auth.users(id) on delete restrict,
 idempotency_key text not null,
 contact_email text not null,
 billing_address jsonb not null,
 shipping_address jsonb not null,
 subtotal_cents bigint not null check(subtotal_cents>=0),
 total_cents bigint not null check(total_cents>=50000),
 status text not null default 'pending_payment'
  check(status in ('pending_payment','confirmed','cancelled','expired')),
 payment_status text not null default 'unpaid'
  check(payment_status in ('unpaid','paid','failed','cancelled','refunded','partially_refunded')),
 checkout_session_id text unique,
 checkout_session_expires_at timestamptz,
 payment_intent_id text unique,
 payment_confirmed_at timestamptz,
 reservation_expires_at timestamptz not null default(now()+interval '30 minutes'),
 created_at timestamptz not null default now(),
 unique(customer_id,idempotency_key),
 check(total_cents=subtotal_cents)
);
create table if not exists artisan_sandbox.items (
 order_id uuid not null references artisan_sandbox.orders(id) on delete restrict,
 sku text not null references public.artisan_products(sku) on delete restrict,
 quantity integer not null check(quantity>0),
 mode text not null check(mode in ('piece','case')),
 title_snapshot text not null,
 unit_price_cents bigint not null check(unit_price_cents>=0),
 line_total_cents bigint not null check(line_total_cents=unit_price_cents*quantity),
 primary key(order_id,sku)
);
create table if not exists artisan_sandbox.reservations(
 order_id uuid not null references artisan_sandbox.orders(id) on delete restrict,
 sku text not null references artisan_sandbox.stock(sku),
 quantity integer not null check(quantity>0),
 status text not null default 'active' check(status in ('active','confirmed','released')),
 primary key(order_id,sku)
);
create table if not exists artisan_sandbox.events(
 event_id text primary key,
 order_id uuid not null references artisan_sandbox.orders(id),
 outcome text not null,
 created_at timestamptz not null default now()
);
alter table artisan_sandbox.stock enable row level security;
alter table artisan_sandbox.orders enable row level security;
alter table artisan_sandbox.items enable row level security;
alter table artisan_sandbox.reservations enable row level security;
alter table artisan_sandbox.events enable row level security;
revoke all on all tables in schema artisan_sandbox from public,anon,authenticated;
grant usage on schema artisan_sandbox to service_role;
grant select on all tables in schema artisan_sandbox to service_role;

create or replace function public.artisan_sandbox_begin_checkout(
 p_customer_id uuid,p_idempotency_key text,p_items jsonb,p_billing jsonb,
 p_shipping jsonb,p_coupon text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare o artisan_sandbox.orders%rowtype; l jsonb; p public.artisan_products%rowtype;
 v_qty integer; v_mode text; v_sku text; v_total bigint:=0;
 v_seen text[]:=array[]::text[];
begin
 if not exists(select 1 from auth.users u where u.id=p_customer_id
   and u.email_confirmed_at is not null) then raise exception 'Verified customer required'; end if;
 if p_idempotency_key !~ '^[A-Za-z0-9_-]{20,128}$' then raise exception 'Bad idempotency key'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('sandbox:'||p_customer_id::text||p_idempotency_key,0));
 select * into o from artisan_sandbox.orders where customer_id=p_customer_id
  and idempotency_key=p_idempotency_key;
 if found then return jsonb_build_object('order_id',o.id,'order_number','TEST-'||lpad(o.order_number::text,8,'0'),
   'total_cents',o.total_cents,'duplicate',true); end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 100 then
   raise exception 'Invalid cart'; end if;
 if jsonb_typeof(p_billing)<>'object' or jsonb_typeof(p_shipping)<>'object'
  or p_billing->>'country'<>'US' or p_shipping->>'country'<>'US'
  or length(coalesce(p_billing->>'line1',''))<1 or
  length(coalesce(p_shipping->>'line1',''))<1
 then raise exception 'Invalid US addresses'; end if;
 if coalesce(p_coupon,'') not in ('','ARTISAN') then raise exception 'Invalid coupon'; end if;
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
 insert into artisan_sandbox.orders(customer_id,idempotency_key,contact_email,
  billing_address,shipping_address,subtotal_cents,total_cents)
 values(p_customer_id,p_idempotency_key,
 (select email from auth.users where id=p_customer_id),
 p_billing,p_shipping,v_total,v_total) returning * into o;
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
end $$;

create or replace function public.artisan_sandbox_order_details(p_order uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare o artisan_sandbox.orders%rowtype;
begin
 select * into o from artisan_sandbox.orders where id=p_order;
 if not found then return null; end if;
 return jsonb_build_object('id',o.id,'customer_id',o.customer_id,
  'total_cents',o.total_cents,'currency','usd',
  'status',o.status,'payment_status',o.payment_status,
  'checkout_session_id',o.checkout_session_id,
  'items',(select coalesce(jsonb_agg(jsonb_build_object('sku',sku,
   'title_snapshot',title_snapshot,'quantity',quantity,
   'unit_price_cents',unit_price_cents,'line_total_cents',line_total_cents)),
    '[]'::jsonb) from artisan_sandbox.items where order_id=p_order));
end $$;

create or replace function public.artisan_sandbox_attach_session(
 p_order uuid,p_session_id text,p_expires_at timestamptz)
returns boolean language plpgsql security definer set search_path='' as $$
declare o artisan_sandbox.orders%rowtype;
begin
 if p_session_id !~ '^cs_test_[A-Za-z0-9]{12,}$'
    or p_expires_at<=now() then raise exception 'Invalid sandbox session'; end if;
 select * into o from artisan_sandbox.orders where id=p_order for update;
 if not found or o.status<>'pending_payment' or
  (o.checkout_session_id is not null and o.checkout_session_id<>p_session_id)
 then raise exception 'Sandbox order is not pending'; end if;
 update artisan_sandbox.orders set checkout_session_id=p_session_id,
  checkout_session_expires_at=p_expires_at,
  reservation_expires_at=greatest(reservation_expires_at,p_expires_at+interval '1 hour')
 where id=p_order;
 return true;
end $$;

create or replace function public.artisan_sandbox_settle_session(
 p_order uuid,p_event_id text,p_session_id text,p_payment_intent text,
 p_amount_cents bigint,p_outcome text)
returns jsonb language plpgsql security definer set search_path='' as $$
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
    payment_intent_id=p_payment_intent,payment_confirmed_at=now()
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
end $$;

create or replace function artisan_sandbox.expire_unattached_orders()
returns integer language plpgsql security definer set search_path='' as $$
declare o record; r record; n integer:=0;
begin
 for o in select id from artisan_sandbox.orders
  where status='pending_payment' and checkout_session_id is null
    and reservation_expires_at<=now()
   for update skip locked
 loop
  for r in select * from artisan_sandbox.reservations where order_id=o.id and status='active' loop
    update artisan_sandbox.stock set reserved=reserved-r.quantity where sku=r.sku and reserved>=r.quantity;
    if not found then raise exception 'Sandbox reservation inconsistency'; end if;
    update artisan_sandbox.reservations set status='released' where order_id=o.id and sku=r.sku;
  end loop;
  update artisan_sandbox.orders set status='expired',payment_status='cancelled' where id=o.id;
  n:=n+1;
 end loop;
 return n;
end $$;

revoke all on function public.artisan_sandbox_begin_checkout(uuid,text,jsonb,jsonb,jsonb,text) from public,anon,authenticated;
revoke all on function public.artisan_sandbox_order_details(uuid) from public,anon,authenticated;
revoke all on function public.artisan_sandbox_attach_session(uuid,text,timestamptz) from public,anon,authenticated;
revoke all on function public.artisan_sandbox_settle_session(uuid,text,text,text,bigint,text) from public,anon,authenticated;
revoke all on function artisan_sandbox.expire_unattached_orders() from public,anon,authenticated;
grant execute on function public.artisan_sandbox_begin_checkout(uuid,text,jsonb,jsonb,jsonb,text) to service_role;
grant execute on function public.artisan_sandbox_order_details(uuid) to service_role;
grant execute on function public.artisan_sandbox_attach_session(uuid,text,timestamptz) to service_role;
grant execute on function public.artisan_sandbox_settle_session(uuid,text,text,text,bigint,text) to service_role;
select cron.schedule('artisan-sandbox-expire-unattached','*/5 * * * *',
 'select artisan_sandbox.expire_unattached_orders();');
