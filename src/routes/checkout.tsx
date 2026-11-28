import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { getProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";
import { makeCheckoutRequest } from "@/lib/artisan-checkout-request";
import { preserveCartForCheckout, loadCheckoutCoupon } from "@/lib/artisan-checkout-intent";
import { lineTotal, meetsMinimum, money } from "@/lib/wholesale";
import "@/components/store/CheckoutPage.css";
import { US_STATES, US_STATE_NAMES } from "@/lib/us-address";
import { AddressAutocomplete, type AddressSuggestion } from "@/components/store/AddressAutocomplete";
import { resumableCheckoutKey, type CheckoutAttempt } from "@/lib/artisan-checkout-resume";
import { couponDiscount } from "@/lib/demo-coupon";
import { loadPaymentPage, savePaymentPage } from "@/lib/artisan-payment-page";

export const Route = createFileRoute("/checkout")({
 head: () => ({ meta: [
  { title: "Secure Checkout | Artisan Mart" },
  { name: "description", content: "Complete your Artisan Mart order securely." },
  { property: "og:title", content: "Secure Checkout | Artisan Mart" },
  { property: "og:description", content: "Complete your Artisan Mart order securely." },
 ] }),
 component: Checkout,
});

type Fields = {first_name:string;last_name:string;company:string;email:string;phone:string;line1:string;line2:string;city:string;state:string;postal_code:string;shipping_first_name:string;shipping_last_name:string;shipping_phone:string;shipping_line1:string;shipping_line2:string;shipping_city:string;shipping_state:string;shipping_postal_code:string};
const inputClass = "mt-1.5 block min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-white focus:ring-2 focus:ring-white/10";
const Field = ({label,name,value,onChange,type="text",required=true,autoComplete}:{label:string;name:string;value:string;onChange:(name:string,value:string)=>void;type?:string;required?:boolean;autoComplete?:string}) => {
 const shipping=name.startsWith("shipping_");
 const token=autoComplete?.replace(/^(billing|shipping) /,"");
 const completion=`section-${shipping?"delivery":"billing"} ${shipping?"shipping":"billing"} ${token||"off"}`;
 const state=name.endsWith("state");
 return <label htmlFor={`checkout-${name}`} className="block text-sm font-medium text-foreground"><span>{label}{required&&<span className="text-destructive"> *</span>}</span>{state?<select id={`checkout-${name}`} className={inputClass} name={name} value={value} required={required} autoComplete={completion} onChange={e=>onChange(name,e.target.value)}><option value="">Select state</option>{US_STATES.map(s=><option key={s} value={s}>{US_STATE_NAMES[s]}</option>)}</select>:<input id={`checkout-${name}`} className={inputClass} name={name} type={type} value={value} required={required} maxLength={name.includes("line1")?240:name.endsWith("postal_code")?10:140} inputMode={name.endsWith("postal_code")?"numeric":undefined} pattern={name.endsWith("postal_code")?"[0-9]{5}(-[0-9]{4})?":undefined} autoComplete={completion} onChange={e=>onChange(name,e.target.value)} />}</label>;
};
async function checkoutFailureMessage(error:unknown,data:unknown):Promise<string>{
 const errorObject=error as {message?:string;context?:Response}|null;
 const response=errorObject?.context;
 const status=response instanceof Response?response.status:0;
 let serverMessage=typeof (data as {error?:unknown}|null)?.error==="string"?(data as {error:string}).error:"";
 if(response instanceof Response){
  try{const body=await response.clone().json() as {error?:unknown};if(typeof body?.error==="string")serverMessage=body.error;}catch{/* Keep the safe fallback below. */}
 }
 const detail=`${serverMessage} ${errorObject?.message??""}`.toLowerCase();
 if(detail.includes("reseller eligibility is not approved"))
  return "Reseller review is required before tax-exempt wholesale checkout. This account is not approved yet. Contact email@artisanmart.site to complete the review. No order or payment was created.";
 if(status===401||/verified customer login required|login required/.test(detail))
  return "Your verified sign-in has expired. Sign in again, then return to checkout. No payment was started.";
 if(status===403)
  return "This account is not currently authorized to check out. Contact email@artisanmart.site for help. No payment was started.";
 if(/shipping\/tax quote|secure checkout credentials|payment account unavailable/.test(detail))
  return "Secure checkout is temporarily unavailable while payment or tax settings are checked. No payment was started. Please try again later.";
 if(status===409||/invalid reserved order|order amount could not be independently verified|session is no longer open/.test(detail))
  return "Your cart or reserved order has changed. Return to your cart and start checkout again. No card payment was started.";
 if(status===400||status===422||/invalid checkout details|unable to reserve checkout/.test(detail))
  return "Some checkout details or items need attention. Review your billing information and cart, then try again.";
 if(/failed to fetch|network|fetcherror|relay/.test(detail))
  return "We could not reach secure checkout. Check your connection and try again. No payment was started.";
 return "Secure checkout could not start. Please try again or contact email@artisanmart.site. No payment was started.";
}

export function Checkout(){
 const {user,ready}=useArtisanAuth();
 const {lines,subtotal}=useCart();
 const navigate=useNavigate();
 const [same,setSame]=useState(true);
 const [coupon,setCoupon]=useState(()=>loadCheckoutCoupon());
 const discount=couponDiscount(subtotal,coupon);
 const [fields,setFields]=useState<Fields>({first_name:"",last_name:"",company:"",email:"",phone:"",line1:"",line2:"",city:"",state:"",postal_code:"",shipping_first_name:"",shipping_last_name:"",shipping_phone:"",shipping_line1:"",shipping_line2:"",shipping_city:"",shipping_state:"",shipping_postal_code:""});
 const [profileLoading,setProfileLoading]=useState(true);
 const [formError,setFormError]=useState("");
 const [busy,setBusy]=useState(false);
 const pendingAttempt=useRef<{signature:string;key:string}|null>(null);
 const previousAttempt=useRef<CheckoutAttempt|null>(null);
 const sandboxPreview=typeof window!=="undefined"&&window.location.hostname.endsWith(".artisanmart-staging.pages.dev");
 const enabled=sandboxPreview?import.meta.env["VITE_ARTISAN_SANDBOX_CHECKOUT_ENABLED"]==="true":import.meta.env["VITE_ARTISAN_LIVE_CHECKOUT_ENABLED"]==="true";
  const publishableKey=import.meta.env["VITE_ARTISAN_STRIPE_PUBLISHABLE_KEY"];
 const stripePromise=useMemo(()=>typeof publishableKey==="string"&&publishableKey.startsWith(sandboxPreview?"pk_test_":"pk_live_")?loadStripe(publishableKey):null,[publishableKey,sandboxPreview]);
 const verified=!!user?.email_confirmed_at;
 const updateField=useCallback((name:string,value:string)=>{
  setFields(previous=>({...previous,[name]:value}));setFormError("");
 },[]);
 const selectAddress=(prefix:""|"shipping_",address:AddressSuggestion)=>{
  setFields(previous=>({...previous,[`${prefix}line1`]:address.line1,[`${prefix}city`]:address.city,[`${prefix}state`]:address.state,[`${prefix}postal_code`]:address.postal_code}));
  setFormError("");
 };

 useEffect(()=>{
  previousAttempt.current=null;
  if(!user?.id||!artisanSupabase)return;
  let active=true;
  Promise.resolve(artisanSupabase.from("artisan_orders").select("idempotency_key,status,payment_status,reservation_expires_at,billing_address,shipping_address,coupon_code,artisan_order_items(sku,quantity,mode)").eq("customer_id",user.id).eq("status","pending_payment").eq("payment_status","unpaid").gt("reservation_expires_at",new Date().toISOString()).not("checkout_session_id","is",null).order("created_at",{ascending:false}).limit(1))
   .then(({data,error})=>{if(active&&!error)previousAttempt.current=data?.[0] as CheckoutAttempt??null;}).catch(()=>{/* Normal new checkout remains available. */});
  return()=>{active=false;};
 },[user?.id]);
 useEffect(()=>{
  if(!user||!artisanSupabase){setProfileLoading(false);return;}
  const saved=loadPaymentPage(user.id);
  if(saved){setFields(saved.billing);setSame(saved.same);setCoupon(saved.coupon??loadCheckoutCoupon());setProfileLoading(false);return;}
  let alive=true;
  Promise.resolve(artisanSupabase.from("artisan_profiles").select("first_name,last_name,phone").eq("user_id",user.id).maybeSingle())
   .then(({data})=>{if(!alive)return;setFields(previous=>({...previous,first_name:data?.first_name??"",last_name:data?.last_name??"",phone:data?.phone??"",email:user.email??""}));})
   .catch(()=>{if(alive)setFields(previous=>({...previous,email:user.email??""}));})
   .finally(()=>{if(alive)setProfileLoading(false);});
  return()=>{alive=false;};
 },[user?.id,user?.email]);
 useEffect(()=>{
  if(!ready||verified)return;
  preserveCartForCheckout(lines,loadCheckoutCoupon());void navigate({to:"/login"});
 },[ready,verified,navigate,lines]);

 const createPayment=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();setFormError("");
  if(!event.currentTarget.reportValidity())return;
  if(!enabled||!stripePromise||!artisanSupabase||!user?.email_confirmed_at){setFormError("Secure card checkout is not available right now. Please try again shortly.");return;}
  if(busy)return;
  setBusy(true);
  try{
   const form=new FormData();
   for(const [name,value] of Object.entries(fields))form.set(name,value.trim());
   const signature=JSON.stringify({lines,coupon,values:Object.fromEntries(form.entries()),same});
   if(pendingAttempt.current?.signature!==signature)pendingAttempt.current={signature,key:crypto.randomUUID()};
   const payload=makeCheckoutRequest(form,lines,coupon,pendingAttempt.current.key,same);
   const resumeKey=resumableCheckoutKey(previousAttempt.current,payload);
   if(resumeKey){payload.idempotencyKey=resumeKey;pendingAttempt.current={signature,key:resumeKey};}
   const {data,error}=await artisanSupabase.functions.invoke(sandboxPreview?"artisan-create-checkout-sandbox":"artisan-create-checkout",{body:payload});
   if(error)throw Error(await checkoutFailureMessage(error,data));
   if(typeof data?.client_secret!=="string"||typeof data?.session_id!=="string"||!Number.isSafeInteger(data?.amount_total)||data?.currency!=="usd")
    throw Error(await checkoutFailureMessage(null,data));
   savePaymentPage(user.id,{client_secret:data.client_secret,session_id:data.session_id,order_number:data.order_number,amount_total:data.amount_total,currency:data.currency},fields,same,coupon.trim().toUpperCase()||null);
   await navigate({to:"/payment"});
  }catch(e){setFormError(e instanceof Error?e.message:"Secure checkout could not start. Please try again.");}
  finally{setBusy(false);}
 };

 if(!ready)return <div className="mx-auto max-w-4xl p-10 text-center" role="status">Checking your account…</div>;
 if(!verified)return <div className="mx-auto max-w-4xl p-10 text-center" role="status">Please sign in with a verified email to continue. <Link to="/login" className="text-primary underline">Sign in</Link></div>;
 if(!meetsMinimum(subtotal))return <div className="mx-auto max-w-4xl p-10 text-center">Your cart is below the $500 minimum. <Link to="/cart" className="text-primary underline">Return to cart</Link></div>;

 return <main className="checkout-page checkout-billing-step min-h-screen">
  <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
  {sandboxPreview&&<div role="status" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">Sandbox checkout · Test cards only · No real charge</div>}
  <header className="mb-7 border-b border-slate-800 pb-6">
   <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"><ArrowLeft size={16}/> Back to cart</Link>
   <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Checkout</h1>
   </div>
  </header>
  <div className="checkout-layout grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
   <form id="checkout-form" autoComplete="on" onSubmit={e=>void createPayment(e)} className="min-w-0 rounded-2xl border border-slate-800 bg-[#111316] p-5 shadow-2xl sm:p-8">
    <input type="hidden" name="country" value="US" autoComplete="section-billing billing country"/>
    <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-800 pb-5"><div><h2 className="text-xl font-bold text-white">Billing information</h2><p className="mt-1 text-sm text-slate-400">Check your contact and billing details.</p></div>{profileLoading&&<span role="status" className="text-xs text-slate-400">Loading profile…</span>}</div>
    <div className="grid gap-4 sm:grid-cols-2">
     <Field label="First name" name="first_name" value={fields.first_name} onChange={updateField} autoComplete="given-name"/>
     <Field label="Last name" name="last_name" value={fields.last_name} onChange={updateField} autoComplete="family-name"/>
     <div className="sm:col-span-2"><Field label="Company" name="company" value={fields.company} onChange={updateField} required={false} autoComplete="organization"/></div>
     <Field label="Email" name="email" value={fields.email} onChange={updateField} type="email" autoComplete="email"/>
     <Field label="Phone" name="phone" value={fields.phone} onChange={updateField} type="tel" autoComplete="tel"/>
     <div className="checkout-address-pair sm:col-span-2"><AddressAutocomplete name="line1" value={fields.line1} onChange={updateField} onSelect={address=>selectAddress("",address)} inputClass={inputClass}/>
     <Field label="Apartment / Suite" name="line2" value={fields.line2} onChange={updateField} required={false} autoComplete="billing address-line2"/></div>
     <div className="checkout-address-pair sm:col-span-2">
     <Field label="City" name="city" value={fields.city} onChange={updateField} autoComplete="billing address-level2"/>
     <Field label="State" name="state" value={fields.state} onChange={updateField} autoComplete="billing address-level1"/></div>
     <div className="checkout-address-pair sm:col-span-2"><Field label="ZIP code" name="postal_code" value={fields.postal_code} onChange={updateField} autoComplete="billing postal-code"/>
     <label className="block text-sm font-medium"><span>Country</span><input className={inputClass} value="United States" readOnly autoComplete="section-billing billing country-name"/></label></div>
     <label className="flex min-h-11 items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" checked={same} onChange={e=>setSame(e.target.checked)} className="h-4 w-4 accent-primary"/>Delivery address is the same as billing</label>
     {!same&&<div className="grid gap-4 border-t border-border pt-5 sm:col-span-2 sm:grid-cols-2"><h3 className="font-semibold sm:col-span-2">Delivery address</h3>
      <Field label="First name" name="shipping_first_name" value={fields.shipping_first_name} onChange={updateField} autoComplete="shipping given-name"/>
      <Field label="Last name" name="shipping_last_name" value={fields.shipping_last_name} onChange={updateField} autoComplete="shipping family-name"/>
      <Field label="Phone" name="shipping_phone" value={fields.shipping_phone} onChange={updateField} type="tel" autoComplete="shipping tel"/>
      <div className="checkout-address-pair sm:col-span-2"><AddressAutocomplete name="shipping_line1" value={fields.shipping_line1} onChange={updateField} onSelect={address=>selectAddress("shipping_",address)} inputClass={inputClass}/>
      <Field label="Apartment / Suite" name="shipping_line2" value={fields.shipping_line2} onChange={updateField} required={false} autoComplete="shipping address-line2"/></div>
     <div className="checkout-address-pair sm:col-span-2">
      <Field label="City" name="shipping_city" value={fields.shipping_city} onChange={updateField} autoComplete="shipping address-level2"/>
      <Field label="State" name="shipping_state" value={fields.shipping_state} onChange={updateField} autoComplete="shipping address-level1"/></div>
      <div className="checkout-address-pair sm:col-span-2"><Field label="ZIP code" name="shipping_postal_code" value={fields.shipping_postal_code} onChange={updateField} autoComplete="shipping postal-code"/>
      <label className="block text-sm font-medium"><span>Country</span><input className={inputClass} value="United States" readOnly autoComplete="section-delivery shipping country-name"/></label></div>
     </div>}
    </div>
    {formError&&<p role="alert" className="mt-5 rounded-xl border border-amber-700 bg-amber-950/40 px-4 py-3 text-sm leading-6 text-amber-100">{formError}</p>}
    <button type="submit" className="sr-only" aria-hidden="true" tabIndex={-1} disabled={!enabled||!stripePromise||busy}>Prepare secure payment</button>
    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><LockKeyhole size={14} className="mt-0.5 shrink-0"/>Card details are encrypted and handled by Stripe. Your card is charged only after you complete the purchase.</p>
   </form>
   <aside className="min-w-0 lg:sticky lg:top-6" aria-busy={busy}>
    <section className="min-w-0 rounded-2xl border border-slate-800 bg-[#111316] p-5 shadow-2xl sm:p-6" aria-labelledby="order-summary-title">
    <div className="flex items-baseline justify-between gap-3"><h2 id="order-summary-title" className="text-xl font-bold text-white">Order summary</h2><span className="text-xs font-medium text-slate-400">{lines.reduce((count,line)=>count+line.pieces,0)} items</span></div>
    <div className="mt-4 divide-y divide-slate-800 border-y border-slate-800">
     {lines.map(line=>{const product=getProduct(line.sku);return product?<div key={line.sku} className="flex items-start justify-between gap-4 py-3 text-sm"><span className="min-w-0"><span className="block font-medium">{product.title}</span><span className="mt-0.5 block text-muted-foreground">Qty {line.pieces}</span></span><span className="shrink-0 font-medium">{money(lineTotal(line.pieces,product.price??0))}</span></div>:null;})}
    </div>
    <label className="mt-4 block text-sm font-medium text-slate-300">Coupon or discount code<input className={inputClass} name="coupon" value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Enter code" autoComplete="off"/></label>
    {discount>0&&<div className="mt-4 flex justify-between gap-3 text-sm"><span>ARTISAN · 5% off</span><span>−{money(discount)}</span></div>}
    <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-800 pt-4"><span className="font-semibold text-slate-300">Total</span><span className="text-2xl font-bold text-white">{money(subtotal-discount)}</span></div>
    <button type="submit" form="checkout-form" disabled={!enabled||!stripePromise||busy} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-5 py-3 font-bold text-slate-950 shadow-sm transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-55">{busy?"Preparing secure payment…":enabled&&stripePromise?`Continue to payment · ${money(subtotal-discount)}`:"Card checkout unavailable"}</button>
    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole size={14}/>Card payment powered by Stripe</div>
    <p className="mt-4 text-xs leading-5 text-slate-500">By completing this purchase, you agree to the <Link to="/terms-of-sale" className="underline underline-offset-2 hover:text-slate-300">Terms of Sale</Link> and <Link to="/privacy" className="underline underline-offset-2 hover:text-slate-300">Privacy Policy</Link>.</p>
    </section>
   </aside>
  </div>
  </div>
 </main>;
}

