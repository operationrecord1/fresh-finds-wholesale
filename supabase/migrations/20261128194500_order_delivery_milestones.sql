-- Merchant/server-controlled milestones; null means not yet confirmed.
alter table public.artisan_orders add column if not exists shipped_at timestamptz;
alter table public.artisan_orders add column if not exists delivered_at timestamptz;
-- Existing customer SELECT-only access and ownership RLS remain unchanged.
