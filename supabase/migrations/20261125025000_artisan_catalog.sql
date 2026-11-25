-- Artisan Mart phase 1: preserve catalog fields and enforce read-only public access.
-- No changes to Fulfilment, payments, or existing production website.
create extension if not exists pgcrypto;
create table if not exists public.artisan_products (
 sku text primary key check (length(trim(sku)) between 2 and 80),
 title text not null,
 price numeric(12,2) check (price is null or price >= 0),
 original_price numeric(12,2) check (original_price is null or original_price >= 0),
 stock integer check (stock is null or stock >= 0),
 category text,
 subcategory text,
 description text,
 upc text,
 badges jsonb not null default '[]'::jsonb check (jsonb_typeof(badges) = 'array'),
 collections jsonb not null default '[]'::jsonb check (jsonb_typeof(collections) = 'array'),
 images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
 specs jsonb not null default '{}'::jsonb check (jsonb_typeof(specs) = 'object'),
 purchase_rules jsonb check (purchase_rules is null or jsonb_typeof(purchase_rules) = 'object'),
 source_record jsonb not null check (jsonb_typeof(source_record) = 'object'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists artisan_products_category_idx on public.artisan_products (category);
create index if not exists artisan_products_subcategory_idx on public.artisan_products (subcategory);
create index if not exists artisan_products_title_idx on public.artisan_products using gin (to_tsvector('english', title));
create table if not exists public.artisan_categories (
 name text primary key
);
create table if not exists public.artisan_collections (
 slug text primary key,
 title text not null,
 banner text,
 default_sort text
);
create table if not exists public.artisan_product_images (
 sku text not null references public.artisan_products(sku) on delete restrict,
 sort_order integer not null check (sort_order >= 0),
 path text not null,
 primary key (sku,sort_order),
 unique (sku,path)
);
create table if not exists public.artisan_product_collections (
 sku text not null references public.artisan_products(sku) on delete restrict,
 collection_slug text not null references public.artisan_collections(slug) on delete restrict,
 primary key(sku,collection_slug)
);
create table if not exists public.artisan_shop_settings (
 key text primary key,
 value jsonb not null,
 updated_at timestamptz not null default now()
);
create table if not exists public.artisan_coupons (
 code text primary key,
 mode text not null check(mode in ('demo','percent','amount')),
 enabled boolean not null default false,
 discount_amount numeric(12,2) not null default 0 check(discount_amount >= 0),
 message text,
 check (mode <> 'demo' or discount_amount=0)
);
alter table public.artisan_products enable row level security;
alter table public.artisan_categories enable row level security;
alter table public.artisan_collections enable row level security;
alter table public.artisan_product_images enable row level security;
alter table public.artisan_product_collections enable row level security;
alter table public.artisan_shop_settings enable row level security;
alter table public.artisan_coupons enable row level security;
revoke all on public.artisan_products, public.artisan_categories, public.artisan_collections,
 public.artisan_product_images, public.artisan_product_collections,
 public.artisan_shop_settings, public.artisan_coupons from anon,authenticated;
grant select on public.artisan_products, public.artisan_categories, public.artisan_collections,
 public.artisan_product_images, public.artisan_product_collections,public.artisan_shop_settings,
 public.artisan_coupons to anon,authenticated;
create policy artisan_products_public_read on public.artisan_products for select to anon,authenticated using (true);
create policy artisan_categories_public_read on public.artisan_categories for select to anon,authenticated using (true);
create policy artisan_collections_public_read on public.artisan_collections for select to anon,authenticated using (true);
create policy artisan_images_public_read on public.artisan_product_images for select to anon,authenticated using (true);
create policy artisan_product_collections_public_read on public.artisan_product_collections for select to anon,authenticated using (true);
create policy artisan_shop_settings_public_read on public.artisan_shop_settings for select to anon,authenticated using (key in ('order_minimum_usd','currency','price_bands'));
create policy artisan_coupons_public_read on public.artisan_coupons for select to anon,authenticated using (enabled and mode='demo');
