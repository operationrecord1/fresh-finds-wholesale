alter table public.artisan_orders
 add column if not exists payment_card_brand text,
 add column if not exists payment_card_last4 text check(payment_card_last4 is null or payment_card_last4 ~ '^[0-9]{4}$'),
 add column if not exists payment_card_issuer text,
 add column if not exists carrier text,
 add column if not exists tracking_number text,
 add column if not exists tracking_url text,
 add column if not exists estimated_delivery_start date,
 add column if not exists estimated_delivery_end date;

create or replace function public.artisan_search_customer_orders(p_query text default '')
returns setof public.artisan_orders language sql stable security invoker set search_path=''
as $$
 select o.* from public.artisan_orders o
 where o.customer_id=(select auth.uid()) and length(p_query)<=120 and (
  btrim(p_query)='' or
  ('114-'||substr((54010224638624::bigint+o.order_number)::text,1,7)||'-'||substr((54010224638624::bigint+o.order_number)::text,8,7)) ilike '%'||btrim(p_query)||'%' or
  exists(select 1 from public.artisan_order_items i where i.order_id=o.id and (i.title_snapshot ilike '%'||btrim(p_query)||'%' or i.sku ilike '%'||btrim(p_query)||'%'))
 );
$$;
revoke all on function public.artisan_search_customer_orders(text) from public,anon;
grant execute on function public.artisan_search_customer_orders(text) to authenticated;

create table public.artisan_order_reviews(
 id uuid primary key default gen_random_uuid(),
 order_item_id uuid not null unique references public.artisan_order_items(id),
 customer_id uuid not null default auth.uid() references auth.users(id),
 rating integer not null check(rating between 1 and 5),
 review_text text not null check(length(btrim(review_text)) between 1 and 5000),
 created_at timestamptz not null default now()
);
alter table public.artisan_order_reviews enable row level security;
revoke all on public.artisan_order_reviews from anon,authenticated;
grant select on public.artisan_order_reviews to authenticated;
grant insert(order_item_id,rating,review_text),update(rating,review_text) on public.artisan_order_reviews to authenticated;
create policy order_review_owner_read on public.artisan_order_reviews for select to authenticated using(customer_id=(select auth.uid()));
create policy order_review_owner_insert on public.artisan_order_reviews for insert to authenticated with check(
 customer_id=(select auth.uid()) and exists(select 1 from public.artisan_order_items i join public.artisan_orders o on o.id=i.order_id where i.id=order_item_id and o.customer_id=(select auth.uid()) and o.payment_status in ('paid','partially_refunded') and o.status not in ('cancelled','expired'))
);
create policy order_review_owner_update on public.artisan_order_reviews for update to authenticated using(customer_id=(select auth.uid())) with check(
 customer_id=(select auth.uid()) and exists(select 1 from public.artisan_order_items i join public.artisan_orders o on o.id=i.order_id where i.id=order_item_id and o.customer_id=(select auth.uid()) and o.payment_status in ('paid','partially_refunded') and o.status not in ('cancelled','expired'))
);
create index artisan_order_reviews_customer_idx on public.artisan_order_reviews(customer_id);

