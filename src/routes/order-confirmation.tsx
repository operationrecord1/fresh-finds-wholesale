import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";
import { customerPaymentMessage } from "@/lib/artisan-order-status";

import { formatOrderNumber } from "@/lib/artisan-order-number";

type Receipt={order_number:number;status:string;payment_status:string;total_cents:number};
export const Route=createFileRoute("/order-confirmation")({
  component:OrderConfirmation,
  head:()=>({meta:[{title:"Order Confirmation | Artisan Mart"}]}),
});
function OrderConfirmation(){
 const {user,ready}=useArtisanAuth();
 const [receipt,setReceipt]=useState<Receipt|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [retry,setRetry]=useState(0);
 const sessionId=typeof window==="undefined"?"":new URLSearchParams(window.location.search).get("session_id")??"";
 useEffect(()=>{
  setReceipt(null);setError("");setLoading(true);
  if(!ready)return;
  if(!user?.email_confirmed_at||!artisanSupabase){setLoading(false);return;}
  if(!/^cs_(test_|live_)[A-Za-z0-9_]+$/.test(sessionId)){
   setError("Invalid checkout reference.");setLoading(false);return;
  }
  let active=true;
  Promise.resolve(artisanSupabase.from("artisan_orders")
   .select("order_number,status,payment_status,total_cents")
   .eq("customer_id",user.id).eq("checkout_session_id",sessionId).maybeSingle())
   .then(({data,error:dbError})=>{
    if(!active)return;
    if(dbError||!data){setError("We couldn't verify this order. Please check My Account.");return;}
    setReceipt(data);
   }).catch(()=>{if(active)setError("We couldn't check your order. Please try again.");})
    .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[ready,user?.id,user?.email_confirmed_at,sessionId,retry]);
 const result=receipt?customerPaymentMessage(receipt.status,receipt.payment_status):null;
 useEffect(()=>{if(result?.confirmed)window.dispatchEvent(new Event("artisan:stock-refresh"));},[result?.confirmed]);
 useEffect(()=>{
  if(!receipt||receipt.payment_status!=="unpaid"||receipt.status!=="pending_payment")return;
  const timer=window.setTimeout(()=>setRetry(x=>x+1),3000);
  return()=>window.clearTimeout(timer);
 },[receipt]);
 return <main className="mx-auto max-w-[820px] px-4 py-10">
  <section className="rounded-xl border bg-card p-6 sm:p-8">
   <h1 className="text-3xl font-bold">Order Confirmation</h1>
   {!ready||loading?<p role="status">Checking your order securely...</p>:
   !user?.email_confirmed_at?<p>Sign in to view your order. <Link to="/login" className="text-primary underline">Sign in</Link></p>:
   error?<p role="alert" className="text-red-700">{error}</p>:
   receipt?<div className="mt-4 space-y-2">
     <h2 className="text-xl font-semibold">Order # {formatOrderNumber(receipt.order_number)}</h2>
     <p role="status" className={result?.confirmed?"text-green-700":"text-amber-700"}>{result?.confirmed?"Thank you for your order! ":""}{result?.message}</p>
     <p>Order status: {(receipt.status==="expired"?"cancelled":receipt.status.replaceAll("_"," "))}</p>
     <p>Payment status: {receipt.payment_status.replaceAll("_"," ")}</p>
     <p className="font-bold">Total: {new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(receipt.total_cents/100)}</p>
   </div>:null}
   <div className="mt-6 flex flex-wrap gap-3">
    <button type="button" onClick={()=>setRetry(x=>x+1)} className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground">Refresh status</button>
    <Link to="/account" className="rounded-full border px-5 py-3 font-semibold">My Account</Link>
   </div>
  </section>
 </main>;
}
