create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
select cron.schedule('artisan-release-expired-pending-orders',
 '*/5 * * * *','select artisan_private.expire_pending_orders();');
