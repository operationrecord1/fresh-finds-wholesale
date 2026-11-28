alter table artisan_sandbox.orders drop constraint orders_check;
alter table artisan_sandbox.orders add constraint orders_check check(total_cents=subtotal_cents-discount_cents);
alter table artisan_sandbox.orders drop constraint orders_total_cents_check;
alter table artisan_sandbox.orders add constraint orders_total_cents_check check(total_cents>0 and subtotal_cents>=50000);
