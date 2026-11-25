import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { DemoCouponFeedback } from "@/components/store/DemoCouponFeedback";
import { getProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { useArtisanAuth } from "@/lib/artisan-auth";
import { preserveCartForCheckout } from "@/lib/artisan-checkout-intent";
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
const F = ({label,req=true,type="text",numericOnly=false,defaultValue}:{
 label:string;req?:boolean;type?:string;numericOnly?:boolean;defaultValue?:string;
}) => (
 <label className="block text-sm">{label}{req && <span className="text-destructive"> *</span>}
  <input required={req} type={type} defaultValue={defaultValue}
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
 const [coupon,setCoupon]=useState("");
 const {message:couponMessage,applyCoupon}=useDemoCouponFeedback();
 const verified=!!user?.email_confirmed_at;
 useEffect(()=>{
  if(!ready || verified)return;
  preserveCartForCheckout(lines);
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
   <div className="grid grid-cols-2 gap-3"><F label="First Name"/><F label="Last Name"/></div>
   <div className="mt-3 space-y-3">
    <F label="Company" req={false}/>
    <F label="Email" type="email" defaultValue={user.email}/>
    <F label="Telephone" type="tel" numericOnly/>
    <F label="Address"/><F label="City"/>
    <div className="grid grid-cols-2 gap-3"><F label="State"/><F label="Zip" numericOnly/></div>
    <label className="block text-sm">Country *<select className="mt-1 w-full rounded border p-2"><option>United States</option></select></label>
    <label className="block text-sm">Sales Representative *<select className="mt-1 w-full rounded border p-2"><option>Web Customer</option></select></label>
    <label className="flex items-center gap-2 text-sm">
     <input type="checkbox" checked={same} onChange={e=>setSame(e.target.checked)}/> Ship to the same address
    </label>
    {!same&&<div className="space-y-3 border-t pt-3"><F label="Shipping Address"/><F label="City"/><F label="Zip" numericOnly/></div>}
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
   <button type="button" disabled aria-disabled="true"
    className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 font-bold text-accent-foreground opacity-60">
    Payments temporarily unavailable
   </button>
   <p className="mt-3 text-center text-xs text-muted-foreground">
    No order is placed, payment accepted or stock reserved until checkout is enabled.
   </p>
  </section>
 </main>;
}
