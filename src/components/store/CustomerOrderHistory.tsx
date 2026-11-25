import { useEffect, useState } from "react";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";

type OrderItem = {
 id:string; sku:string; title_snapshot:string; quantity:number;
 unit_price_cents:number; line_total_cents:number;
};
type Order = {
 id:string; order_number:number; status:string; payment_status:string;
 total_cents:number; subtotal_cents:number; discount_cents:number;
 shipping_cents:number; tax_cents:number; currency:string; created_at:string;
 artisan_order_items:OrderItem[];
};
function usd(cents:number):string {
 return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
}
/** Customer-scoped read-only order history. Supabase RLS enforces ownership
 * of orders and nested items. Neither URL nor client totals grant privileges. */
export function CustomerOrderHistory(){
 const {user,ready}=useArtisanAuth();
 const [orders,setOrders]=useState<Order[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [revision,setRevision]=useState(0);
 useEffect(()=>{
  setOrders([]);setError("");setLoading(true);
  if(!ready){return;}
  if(!user?.id || !user.email_confirmed_at || !artisanSupabase){setLoading(false);return;}
  let active=true;
  Promise.resolve(artisanSupabase.from("artisan_orders")
    .select("id,order_number,status,payment_status,total_cents,subtotal_cents,discount_cents,shipping_cents,tax_cents,currency,created_at,artisan_order_items(id,sku,title_snapshot,quantity,unit_price_cents,line_total_cents)")
    .eq("customer_id",user.id).order("created_at",{ascending:false}).limit(30))
    .then(({data,error:queryError})=>{
      if(!active)return;
      if(queryError){setError("We couldn't load your orders. Please try again.");return;}
      setOrders((data??[]) as Order[]);
    }).catch(()=>{if(active)setError("We couldn't load your orders. Please try again.");})
    .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[ready,user?.id,user?.email_confirmed_at,revision]);
 if(!ready || !user?.email_confirmed_at)return null;
 return <section className="mt-6 rounded-xl border bg-card p-6" aria-labelledby="artisan-order-history-heading">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <h2 id="artisan-order-history-heading" className="text-xl font-bold">Order History</h2>
   <button type="button" className="rounded border px-4 py-2 text-sm" disabled={loading}
    onClick={()=>setRevision(v=>v+1)}>Refresh orders</button>
  </div>
  {loading?<p className="mt-4 text-sm" role="status">Loading your orders...</p>:
   error?<p className="mt-4 text-sm text-red-700" role="alert">{error}</p>:
   orders.length===0?<p className="mt-4 text-sm text-muted-foreground">You haven't placed an order yet.</p>:
   <div className="mt-4 space-y-4">{orders.map(order=>
     <article key={order.id} className="rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
       <h3 className="font-semibold">Order #{order.order_number}</h3>
       <span className="text-sm">{order.payment_status==="paid"?"Payment confirmed":order.payment_status==="unpaid"?"Payment pending":order.payment_status.replaceAll("_"," ")}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-US")} · {order.status.replaceAll("_"," ")}</p>
      <ul className="mt-3 space-y-2">{(order.artisan_order_items??[]).map(item=>
       <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
        <span>{item.title_snapshot} (SKU {item.sku}) × {item.quantity}</span>
        <span className="shrink-0">{usd(item.line_total_cents)}</span>
       </li>)}</ul>
      <div className="mt-3 border-t pt-2 text-sm">
       <div className="flex justify-between"><span>Subtotal</span><span>{usd(order.subtotal_cents)}</span></div>
       <div className="flex justify-between"><span>Discount</span><span>−{usd(order.discount_cents)}</span></div>
       <div className="flex justify-between"><span>Shipping</span><span>{usd(order.shipping_cents)}</span></div>
       <div className="flex justify-between"><span>Tax</span><span>{usd(order.tax_cents)}</span></div>
       <div className="mt-2 flex justify-between font-bold"><span>Total</span><span>{usd(order.total_cents)}</span></div>
      </div>
     </article>)}</div>}
 </section>;
}
