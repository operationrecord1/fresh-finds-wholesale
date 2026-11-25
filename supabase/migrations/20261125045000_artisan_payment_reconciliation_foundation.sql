-- Payment event application is only for a future verified Stripe webhook server.
-- It cannot be called by anon/authenticated and does not expose a webhook endpoint.
create or replace function public.artisan_apply_verified_payment(
 p_order uuid,p_provider text,p_event_id text,p_payment_reference text,p_result text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_order public.artisan_orders%rowtype; v_res record;
begin
 if p_provider<>'stripe' or length(coalesce(p_event_id,'')) not between 8 and 255
    or length(coalesce(p_payment_reference,'')) not between 8 and 255
    or p_result not in ('paid','failed','cancelled','refunded')
 then raise exception 'Invalid verified payment event'; end if;
 select * into v_order from public.artisan_orders where id=p_order for update;
 if not found then raise exception 'Order not found'; end if;
 if exists(select 1 from artisan_private.payment_event_receipts where event_id=p_event_id)
 then return jsonb_build_object('duplicate',true,'order_status',v_order.status,
  'payment_status',v_order.payment_status); end if;
 if p_result='paid' then
   if v_order.payment_status='paid' then
      raise exception 'Payment event does not match already-paid order';
   end if;
   if v_order.status<>'pending_payment' or v_order.payment_status<>'unpaid'
     or v_order.reservation_expires_at<=now()
   then raise exception 'Late or invalid payment: manual reconciliation required'; end if;
   for v_res in select * from artisan_private.stock_reservations
      where order_id=p_order and status='active' order by sku
   loop
     update public.artisan_products set
       reserved_stock=reserved_stock-v_res.quantity,
       stock=stock-v_res.quantity,updated_at=now()
       where sku=v_res.sku and reserved_stock>=v_res.quantity and stock>=v_res.quantity;
     if not found then raise exception 'Inventory inconsistency, payment reconciliation required'; end if;
     update artisan_private.stock_reservations set status='confirmed'
       where order_id=p_order and sku=v_res.sku;
   end loop;
   update public.artisan_orders set status='confirmed',payment_status='paid',
     payment_provider=p_provider,payment_intent_id=p_payment_reference,updated_at=now()
     where id=p_order;
 elsif p_result in ('failed','cancelled') then
   if v_order.payment_status<>'unpaid' or v_order.status<>'pending_payment'
   then raise exception 'Cannot fail a settled order'; end if;
   for v_res in select * from artisan_private.stock_reservations
      where order_id=p_order and status='active' order by sku
   loop
      update public.artisan_products set reserved_stock=reserved_stock-v_res.quantity,
        updated_at=now() where sku=v_res.sku and reserved_stock>=v_res.quantity;
      if not found then raise exception 'Inventory inconsistency'; end if;
      update artisan_private.stock_reservations set status='released'
        where order_id=p_order and sku=v_res.sku;
   end loop;
   update public.artisan_orders set status='cancelled',payment_status=p_result,
     payment_provider=p_provider,updated_at=now() where id=p_order;
 elsif p_result='refunded' then
   if v_order.payment_status<>'paid' then raise exception 'Refund of unpaid order'; end if;
   -- Restocking after refund is a separate, explicit business decision.
   update public.artisan_orders set payment_status='refunded',updated_at=now() where id=p_order;
 end if;
 insert into artisan_private.payment_event_receipts(event_id,order_id,provider,event_type)
 values(p_event_id,p_order,p_provider,p_result);
 return jsonb_build_object('duplicate',false,'order_id',p_order,'payment_status',p_result);
end $$;
revoke all on function public.artisan_apply_verified_payment(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.artisan_apply_verified_payment(uuid,text,text,text,text) to service_role;
