import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { DemoCouponFeedback } from "@/components/store/DemoCouponFeedback";
import { getProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";
import { makeCheckoutRequest } from "@/lib/artisan-checkout-request";
import { preserveCartForCheckout, loadCheckoutCoupon } from "@/lib/artisan-checkout-intent";
import { lineTotal, meetsMinimum, money } from "@/lib/wholesale";
import { useDemoCouponFeedback } from "@/hooks/useDemoCouponFeedback";

export const Route = createFileRoute("/checkout")({
 head: () => ({ meta: [
  { title: "Checkout | Artisan Mart" },
  { name: "description", content: "Review your Artisan Mart wholesale checkout." },
  { property: "og:title", content: "Checkout | Artisan Mart" },
  { property: "og:description", content: "Your wholesale checkout." },
 ] }),
 component: Checkout,
});
const F = ({label,name,req=true,type="text",numericOnly=false,defaultValue}:{
 label:string;name:string;req?:boolean;type?:string;numericOnly?:boolean;defaultValue?:string | undefined;
}) => (
 <label className="block text-sm">{label}{req && <span className="text-destructive"> *</span>}
  <input name={name} required={req} type={type} defaultValue={defaultValue}
   inputMode={numericOnly?"numeric":undefined} pattern={numericOnly?"[0-9]*":undefined}
   onInput={numericOnly?e=>{e.currentTarget.value=e.currentTarget.value.replace(/\D/g,"");}:undefined}
   className="mt-1 w-full rounded border p-2"/>
 </label>
);
const H=({n,t}:{n:number;t:string})=><h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
 <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">{n}</span>{t}</h2>;

export function Checkout(){
 const {user,ready}=useArtisanAuth();
 const {lines,subtotal}=useCart();
 const navigate=useNavigate();
 const [same,setSame]=useState(true);
 const [coupon,setCoupon]=useState(() => loadCheckoutCoupon());
 const [returnedFromStripe,setReturnedFromStripe]=useState(false);
 const [payBusy,setPayBusy]=useState(false);
 const [payError,setPayError]=useState("");
 const pendingAttempt=useRef<{signature:string;key:string}|null>(null);
 const paymentEnabled=import.meta.env["VITE_ARTISAN_LIVE_CHECKOUT_ENABLED"]==="true";
 const openPayment=async()=>{
  if(!paymentEnabled||payBusy||!artisanSupabase||!user?.email_confirmed_at)return;
  setPayError("");setPayBusy(true);
  try {
   const values=new FormData();
   for(const input of document.querySelectorAll<HTMLInputElement>('main input[name]')){
    if(input.type==="checkbox")continue;
    if(input.required&&!input.value.trim())throw Error("Complete all required address fields.");
    if(!input.checkValidity())throw Error("Correct invalid address details.");
    values.set(input.name,input.value.trim());
   }
   const signature=JSON.stringify({lines,coupon,values:Object.fromEntries(values.entries()),same});
   if(pendingAttempt.current?.signature!==signature)
    pendingAttempt.current={signature,key:crypto.randomUUID()};
   const payload=makeCheckoutRequest(values,lines,coupon,pendingAttempt.current.key,same);
   const {data,error}=await artisanSupabase.functions.invoke("artisan-create-checkout",{body:payload});
   if(error||typeof data?.checkout_url!=="string")throw Error("Secure checkout is unavailable.");
   const url=new URL(data.checkout_url);
   if(url.protocol!=="https:"||url.hostname!=="checkout.stripe.com")
    throw Error("Unexpected payment provider URL.");
   window.location.assign(url.toString());
  }catch(e){setPayError(e instanceof Error?e.message:"Could not open checkout.");}
  finally{setPayBusy(false);}
 };

 useEffect(()=>{
  if(typeof window==="undefined")return;
  setReturnedFromStripe(new URLSearchParams(window.location.search).get("payment_cancelled")==="1");
 },[]);
 const {message:couponMessage,applyCoupon}=useDemoCouponFeedback();
 const verified=!!user?.email_confirmed_at;
 useEffect(()=>{
  if(!ready || verified)return;
  preserveCartForCheckout(lines,loadCheckoutCoupon());
  void navigate({to:"/login"});
 },[ready,verified,navigate,lines]);

 if(!ready)return <div className="p-10 text-center" role="status">Checking your account...</div>;
 if(!verified)return <div className="p-10 text-center" role="status">
  Please sign in with a verified email to continue checkout. <Link to="/login" className="text-primary underline">Sign in</Link>
 </div>;
 if(!meetsMinimum(subtotal))return <div className="p-10 text-center">
  Your cart is below the $500 minimum. <Link to="/cart" className="text-primary underline">Return to cart</Link>
 </div>;
 return <main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-3">
  <section className="min-w-0 rounded bg-card p-5">
   <H n={1} t="Billing Address"/>
   <div className="grid grid-cols-2 gap-3"><F name="first_name" label="First Name"/><F name="last_name" label="Last Name"/></div>
   <div className="mt-3 space-y-3">
    <F name="company" label="Company" req={false}/>
    <F name="email" label="Email" type="email" defaultValue={user.email}/>
    <F name="phone" label="Telephone" type="tel" numericOnly/>
    <F name="line1" label="Address"/><F name="city" label="City"/>
    <div className="grid grid-cols-2 gap-3"><F name="state" label="State"/><F name="postal_code" label="Zip" numericOnly/></div>
    <label className="block text-sm">Country *<select className="mt-1 w-full rounded border p-2"><option>United States</option></select></label>
    <label className="block text-sm">Sales Representative *<select className="mt-1 w-full rounded border p-2"><option>Web Customer</option></select></label>
    <label className="flex items-center gap-2 text-sm">
     <input type="checkbox" checked={same} onChange={e=>setSame(e.target.checked)}/> Ship to the same address
    </label>
    {!same&&<div className="space-y-3 border-t pt-3">
      <div className="grid grid-cols-2 gap-3">
        <F name="shipping_first_name" label="Shipping First Name"/>
        <F name="shipping_last_name" label="Shipping Last Name"/>
      </div>
      <F name="shipping_phone" label="Shipping Phone" type="tel" numericOnly/>
      <F name="shipping_line1" label="Shipping Address"/>
      <F name="shipping_city" label="Shipping City"/>
      <div className="grid grid-cols-2 gap-3">
        <F name="shipping_state" label="Shipping State"/>
        <F name="shipping_postal_code" label="Shipping Zip" numericOnly/>
      </div>
    </div>}
   </div>
  </section>
  <section className="min-w-0 space-y-6">
   <div className="min-w-0 rounded bg-card p-5">
    <H n={2} t="Shipping Method"/>
    <p className="text-sm text-muted-foreground">Shipping options and applicable taxes will be calculated securely before payment.</p>
   </div>
   <div className="min-w-0 rounded bg-card p-5">
    <H n={3} t="Payment Method"/>
    <div className="flex items-start gap-3 rounded-xl border border-border p-4">
     <LockKeyhole size={24} className="shrink-0 text-primary" aria-hidden="true"/>
     <div><p className="font-semibold">Secure card payment</p>
      <p className="mt-1 text-sm text-muted-foreground">Secure checkout is being connected. We are not collecting card information or accepting payments yet.</p>
     </div>
    </div>
   </div>
  </section>
  <section className="min-w-0 rounded bg-card p-5">
   <h2 className="mb-3 text-lg font-bold">Review your order</h2>
   {lines.map(l=>{const p=getProduct(l.sku);return p?<div key={l.sku} className="flex justify-between border-b py-2 text-sm">
    <span>{p.sku} × {l.pieces}</span><span>{money(lineTotal(l.pieces,p.price??0))}</span>
   </div>:null;})}
   <div className="mt-3 flex justify-between font-bold"><span>Merchandise subtotal</span><span>{money(subtotal)}</span></div>
   <p className="mt-2 text-sm text-muted-foreground">Shipping and tax are not included. The final order total will be verified by our secure checkout.</p>
   <div className="mt-3">
    <div className="flex gap-[15px]">
     <input aria-label="Coupon code" placeholder="Coupon code" value={coupon} onChange={e=>setCoupon(e.target.value)}
      className="min-w-0 flex-1 rounded border p-2"/>
     <button type="button" onClick={()=>applyCoupon(coupon)} className="rounded bg-primary px-3 font-semibold text-primary-foreground">Apply</button>
    </div>
    <DemoCouponFeedback message={couponMessage}/>
   </div>
   <textarea placeholder="Comments" className="mt-0 block w-full rounded border p-2" rows={3}/>
   <button type="button" disabled={!paymentEnabled||payBusy} aria-disabled={!paymentEnabled||payBusy}
    onClick={()=>void openPayment()}
    className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 font-bold text-accent-foreground disabled:opacity-60">
    {!paymentEnabled?"Payments temporarily unavailable":payBusy?"Opening secure checkout...":"Proceed to Secure Payment"}
   </button>
   {payError&&<p role="alert" className="mt-3 text-sm text-red-700">{payError}</p>}
   {returnedFromStripe&&<p role="status" className="mt-3 text-sm text-amber-800">
     You returned from Stripe Checkout without a verified payment. Your payment status may still be pending.
     Please check the order status before trying to pay again.
   </p>}
   <p className="mt-3 text-center text-xs text-muted-foreground">
    No order is placed, payment accepted or stock reserved until checkout is enabled.
   </p>
  </section>
 </main>;
}
