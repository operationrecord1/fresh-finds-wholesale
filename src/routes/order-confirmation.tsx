import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";

type Item={sku:string;quantity:number;title_snapshot:string;line_total_cents:number};
type Order={
 id:string;order_number:number;payment_status:string;status:string;
 total_cents:number;currency:string;payment_confirmed_at:string|null;
 artisan_order_items:Item[];
};

export const Route=createFileRoute("/order-confirmation")({
 head:()=>({meta:[
  {title:"Order Status | Artisan Mart"},
  {name:"description",content:"Check your verified Artisan Mart order status."},
 ]}),
 component:OrderConfirmation,
});
function money(cents:number){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);}
function OrderConfirmation(){
 const {user,ready}=useArtisanAuth();
 const [order,setOrder]=useState<Order|null>(null);
 const [checking,setChecking]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  if(!ready||!user||!artisanSupabase){setChecking(false);return;}
  const sessionId=new URLSearchParams(window.location.search).get("session_id");
  if(!sessionId||!/^cs_(test_|live_)[A-Za-z0-9_]+$/.test(sessionId)){
   setError("No valid Checkout Session was provided.");setChecking(false);return;
  }
  let alive=true,tries=0;
  const read=async()=>{
   if(!alive)return;
   tries++;
   const {data,error:readError}=await artisanSupabase!.from("artisan_orders")
    .select("id,order_number,payment_status,status,total_cents,currency,payment_confirmed_at,artisan_order_items(sku,quantity,title_snapshot,line_total_cents)")
    .eq("checkout_session_id",sessionId).eq("customer_id",user.id).maybeSingle();
   if(!alive)return;
   if(readError){setError("Could not load this order. Please try again later.");setChecking(false);return;}
   if(data)setOrder(data as Order);
   setChecking(false);
  };
  void read();
  const timer=window.setInterval(()=>{
   if(!alive||tries>=30||order?.payment_status==="paid")return;
   void read();
  },3000);
  return()=>{alive=false;window.clearInterval(timer);};
 },[user?.id,ready,order?.payment_status]);

 if(!ready||checking)return <div role="status" className="mx-auto max-w-3xl px-4 py-16 text-center">
  Checking your verified payment status...</div>;
 if(!user)return <main className="mx-auto max-w-3xl px-4 py-16">
  <h1 className="text-2xl font-bold">Sign in to see your order status</h1>
  <Link className="mt-5 inline-block text-primary underline" to="/login">Sign in</Link></main>;
 if(error)return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-2xl font-bold">Order status unavailable</h1>
  <p role="alert" className="mt-4">{error}</p></main>;
 if(!order)return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-2xl font-bold">Order verification pending</h1>
  <p className="mt-4">Your payment has not been verified. Do not submit another payment just because this page is pending.</p></main>;
 const paid=order.payment_status==="paid" && order.status==="confirmed" && !!order.payment_confirmed_at;
 return <main className="mx-auto max-w-3xl px-4 py-12">
  <div className="rounded-xl border bg-card p-6 shadow-sm">
   <h1 className="text-3xl font-bold text-primary">{paid?"Your order is confirmed":"Order status"}</h1>
   <p className="mt-3 font-semibold">Order AM-{String(order.order_number).padStart(8,"0")}</p>
   <p className="mt-2">{paid
    ?"Your payment was independently verified and your order is confirmed."
    :order.status==="cancelled"||order.status==="expired"
      ?"This checkout did not complete. No successful payment has been confirmed for this order."
      :"Your payment is not confirmed yet. We are checking the payment status."}</p>
   <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
    <dt>Payment status</dt><dd className="font-semibold">{order.payment_status}</dd>
    <dt>Order status</dt><dd className="font-semibold">{order.status}</dd>
    <dt>{paid?"Amount paid":"Order total"}</dt><dd className="font-semibold">{money(order.total_cents)}</dd>
   </dl>
   <h2 className="mt-8 text-xl font-bold">Order items</h2>
   <div className="mt-3 divide-y">
    {(order.artisan_order_items||[]).map(item=><div key={item.sku} className="flex justify-between gap-4 py-3 text-sm">
     <span>{item.title_snapshot} — {item.sku} × {item.quantity}</span><span>{money(item.line_total_cents)}</span></div>)}
   </div>
   <Link className="mt-6 inline-block text-primary underline" to="/">Continue shopping</Link>
  </div>
 </main>;
}
