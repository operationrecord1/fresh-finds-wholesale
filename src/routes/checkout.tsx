import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { getProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";
import { makeCheckoutRequest } from "@/lib/artisan-checkout-request";
import { preserveCartForCheckout, loadCheckoutCoupon } from "@/lib/artisan-checkout-intent";
import { lineTotal, meetsMinimum, money } from "@/lib/wholesale";

export const Route = createFileRoute("/checkout")({
 head: () => ({ meta: [
  { title: "Secure Checkout | Artisan Mart" },
  { name: "description", content: "Complete your Artisan Mart order securely." },
  { property: "og:title", content: "Secure Checkout | Artisan Mart" },
  { property: "og:description", content: "Complete your Artisan Mart order securely." },
 ] }),
 component: Checkout,
});

type Fields = {first_name:string;last_name:string;company:string;email:string;phone:string;line1:string;city:string;state:string;postal_code:string;shipping_first_name:string;shipping_last_name:string;shipping_phone:string;shipping_line1:string;shipping_city:string;shipping_state:string;shipping_postal_code:string};
type Session = {client_secret:string;session_id:string;order_number:number;amount_total:number;currency:string};
const inputClass = "mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
const Field = ({label,name,value,onChange,type="text",required=true,autoComplete}:{label:string;name:string;value:string;onChange:(name:string,value:string)=>void;type?:string;required?:boolean;autoComplete?:string}) => <label className="block text-sm font-medium text-foreground">{label}{required&&<span className="text-destructive"> *</span>}<input className={inputClass} name={name} type={type} value={value} required={required} maxLength={name.includes("line1")?240:140} autoComplete={autoComplete} onChange={e=>onChange(name,e.target.value)} /></label>;
const usd=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
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
function StripePayment({sessionId,totalCents,billing,onError,onSuccess}:{sessionId:string;totalCents:number;billing:Fields;onError:(message:string)=>void;onSuccess:()=>void}){
 const result=useCheckoutElements();
 const [busy,setBusy]=useState(false);
 const checkout=result.type==="success"?result.checkout:null;
 const confirm=async()=>{
  if(busy||!checkout)return;
  setBusy(true);onError("");
  try{
   const response=await checkout.confirm({
    returnUrl:`${window.location.origin}/order-confirmation?session_id=${encodeURIComponent(sessionId)}`,
    redirect:"if_required",email:billing.email,phoneNumber:billing.phone,
    billingAddress:{name:`${billing.first_name} ${billing.last_name}`.trim(),address:{country:"US",line1:billing.line1,city:billing.city,state:billing.state,postal_code:billing.postal_code}},
   });
   if(response.type==="error")onError(response.error.message||"Your card payment could not be confirmed. Please check the details and try again.");
   else onSuccess();
  }catch(error){onError(error instanceof Error?error.message:"Your payment could not be confirmed. Please try again.");}
  finally{setBusy(false);}
 };
 if(result.type==="loading")return <p role="status" className="mt-5 text-sm text-muted-foreground">Loading secure card fields…</p>;
 if(result.type==="error")return <p role="alert" className="mt-5 text-sm text-red-700">{result.error.message}</p>;
 return <div className="mt-6 border-t border-border pt-5">
  <div className="mb-3 flex items-center gap-2"><LockKeyhole size={17} className="text-primary"/><h3 className="font-semibold">Card payment</h3></div>
  <PaymentElement options={{layout:"tabs",paymentMethodOrder:["card"]}} />
  <button type="button" onClick={()=>void confirm()} disabled={busy||!checkout} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55">
   {busy?"Processing payment…":`Pay ${usd(totalCents)}`}
  </button>
 </div>;
}

export function Checkout(){
 const {user,ready}=useArtisanAuth();
 const {lines,subtotal}=useCart();
 const navigate=useNavigate();
 const [same,setSame]=useState(true);
 const [coupon,setCoupon]=useState(()=>loadCheckoutCoupon());
 const [fields,setFields]=useState<Fields>({first_name:"",last_name:"",company:"",email:"",phone:"",line1:"",city:"",state:"",postal_code:"",shipping_first_name:"",shipping_last_name:"",shipping_phone:"",shipping_line1:"",shipping_city:"",shipping_state:"",shipping_postal_code:""});
 const [profileLoading,setProfileLoading]=useState(true);
 const [formError,setFormError]=useState("");
 const [payError,setPayError]=useState("");
 const [busy,setBusy]=useState(false);
 const [session,setSession]=useState<Session|null>(null);
 const pendingAttempt=useRef<{signature:string;key:string}|null>(null);
 const sandboxPreview=typeof window!=="undefined"&&window.location.hostname.endsWith(".artisanmart-staging.pages.dev");
 const enabled=sandboxPreview?import.meta.env["VITE_ARTISAN_SANDBOX_CHECKOUT_ENABLED"]==="true":import.meta.env["VITE_ARTISAN_LIVE_CHECKOUT_ENABLED"]==="true";
  const publishableKey=import.meta.env["VITE_ARTISAN_STRIPE_PUBLISHABLE_KEY"];
 const stripePromise=useMemo(()=>typeof publishableKey==="string"&&publishableKey.startsWith(sandboxPreview?"pk_test_":"pk_live_")?loadStripe(publishableKey):null,[publishableKey,sandboxPreview]);
 const verified=!!user?.email_confirmed_at;
 const updateField=useCallback((name:string,value:string)=>{
  setFields(previous=>({...previous,[name]:value}));setFormError("");setPayError("");setSession(null);
 },[]);

 useEffect(()=>{
  if(!user||!artisanSupabase){setProfileLoading(false);return;}
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
  event.preventDefault();setFormError("");setPayError("");
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
   const {data,error}=await artisanSupabase.functions.invoke("artisan-create-checkout",{body:payload});
   if(error)throw Error(await checkoutFailureMessage(error,data));
   if(typeof data?.client_secret!=="string"||typeof data?.session_id!=="string"||!Number.isSafeInteger(data?.amount_total)||data?.currency!=="usd")
    throw Error(await checkoutFailureMessage(null,data));
   setSession({client_secret:data.client_secret,session_id:data.session_id,order_number:data.order_number,amount_total:data.amount_total,currency:data.currency});
  }catch(e){setFormError(e instanceof Error?e.message:"Secure checkout could not start. Please try again.");}
  finally{setBusy(false);}
 };

 if(!ready)return <div className="mx-auto max-w-4xl p-10 text-center" role="status">Checking your account…</div>;
 if(!verified)return <div className="mx-auto max-w-4xl p-10 text-center" role="status">Please sign in with a verified email to continue. <Link to="/login" className="text-primary underline">Sign in</Link></div>;
 if(!meetsMinimum(subtotal))return <div className="mx-auto max-w-4xl p-10 text-center">Your cart is below the $500 minimum. <Link to="/cart" className="text-primary underline">Return to cart</Link></div>;

 return <main className="min-h-screen bg-slate-50/80">
  <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
  {sandboxPreview&&<div role="status" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">Sandbox checkout · Test cards only · No real charge</div>}
  <header className="mb-7">
   <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft size={16}/> Back to cart</Link>
   <div className="mt-5 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200"><LockKeyhole size={13} className="text-primary"/> Secure checkout</div><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Complete your order</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Your order is verified before card details are collected. Stripe securely handles the payment.</p></div>
    <div className="flex items-center gap-2 text-sm text-slate-600"><ShieldCheck size={18} className="text-emerald-700"/><span>Encrypted payment by Stripe</span></div>
   </div>
   <ol aria-label="Checkout steps" className="mt-5 grid max-w-lg grid-cols-2 gap-3">
    <li className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-primary/20"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span><span><span className="block text-xs text-slate-500">Step 1</span><span className="text-sm font-semibold text-slate-900">Billing details</span></span></li>
    <li className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm ring-1 ${session?"bg-white ring-primary/20":"bg-slate-100/80 ring-slate-200"}`}><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${session?"bg-primary text-primary-foreground":"bg-slate-300 text-slate-700"}`}>2</span><span><span className="block text-xs text-slate-500">Step 2</span><span className="text-sm font-semibold text-slate-900">Card payment</span></span></li>
   </ol>
  </header>
  <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
   <form onSubmit={e=>void createPayment(e)} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.35)] sm:p-8">
    <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5"><div><span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Step 1 · Customer</span><h2 className="mt-1 text-xl font-bold text-slate-950">Billing information</h2><p className="mt-1 text-sm text-slate-600">Account details are filled in when available. Check them before continuing.</p></div>{profileLoading&&<span role="status" className="text-xs text-muted-foreground">Loading profile…</span>}</div>
    <div className="grid gap-4 sm:grid-cols-2">
     <Field label="First name" name="first_name" value={fields.first_name} onChange={updateField} autoComplete="given-name"/>
     <Field label="Last name" name="last_name" value={fields.last_name} onChange={updateField} autoComplete="family-name"/>
     <div className="sm:col-span-2"><Field label="Company" name="company" value={fields.company} onChange={updateField} required={false} autoComplete="organization"/></div>
     <Field label="Email" name="email" value={fields.email} onChange={updateField} type="email" autoComplete="email"/>
     <Field label="Phone" name="phone" value={fields.phone} onChange={updateField} type="tel" autoComplete="tel"/>
     <div className="sm:col-span-2"><Field label="Street address" name="line1" value={fields.line1} onChange={updateField} autoComplete="billing address-line1"/></div>
     <Field label="City" name="city" value={fields.city} onChange={updateField} autoComplete="billing address-level2"/>
     <Field label="State" name="state" value={fields.state} onChange={updateField} autoComplete="billing address-level1"/>
     <Field label="ZIP code" name="postal_code" value={fields.postal_code} onChange={updateField} autoComplete="billing postal-code"/>
     <label className="flex min-h-11 items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" checked={same} onChange={e=>{setSame(e.target.checked);setSession(null);}} className="h-4 w-4 accent-primary"/>Delivery address is the same as billing</label>
     {!same&&<div className="grid gap-4 border-t border-border pt-5 sm:col-span-2 sm:grid-cols-2"><h3 className="font-semibold sm:col-span-2">Delivery address</h3>
      <Field label="First name" name="shipping_first_name" value={fields.shipping_first_name} onChange={updateField} autoComplete="shipping given-name"/>
      <Field label="Last name" name="shipping_last_name" value={fields.shipping_last_name} onChange={updateField} autoComplete="shipping family-name"/>
      <Field label="Phone" name="shipping_phone" value={fields.shipping_phone} onChange={updateField} type="tel" autoComplete="shipping tel"/>
      <div className="sm:col-span-2"><Field label="Street address" name="shipping_line1" value={fields.shipping_line1} onChange={updateField} autoComplete="shipping address-line1"/></div>
      <Field label="City" name="shipping_city" value={fields.shipping_city} onChange={updateField} autoComplete="shipping address-level2"/>
      <Field label="State" name="shipping_state" value={fields.shipping_state} onChange={updateField} autoComplete="shipping address-level1"/>
      <Field label="ZIP code" name="shipping_postal_code" value={fields.shipping_postal_code} onChange={updateField} autoComplete="shipping postal-code"/>
     </div>}
    </div>
    {formError&&<p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">{formError}</p>}
    {!session&&<button type="submit" disabled={!enabled||!stripePromise||busy} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto sm:min-w-72">{busy?"Preparing secure payment…":enabled&&stripePromise?`Continue to payment · ${money(subtotal)}`:"Secure card checkout unavailable"}</button>}
    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><LockKeyhole size={14} className="mt-0.5 shrink-0"/>Card details are collected in Stripe’s secure fields after the order passes checkout verification. This step does not charge your card.</p>
   </form>
   <aside className="grid min-w-0 gap-5 lg:sticky lg:top-6">
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.35)] sm:p-6" aria-labelledby="payment-step-title">
     <div className="flex items-start justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Step 2 · Stripe</span><h2 id="payment-step-title" className="mt-1 text-xl font-bold text-slate-950">Card payment</h2></div><span className="rounded-lg bg-slate-100 p-2 text-slate-700"><LockKeyhole size={18}/></span></div>
     {session&&stripePromise?<><div className="mb-4 mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900"><ShieldCheck size={17}/><span>Secure payment ready · Order #{session.order_number}</span></div><CheckoutElementsProvider stripe={stripePromise} options={{clientSecret:session.client_secret}}><StripePayment sessionId={session.session_id} totalCents={session.amount_total} billing={fields} onError={setPayError} onSuccess={()=>void navigate({to:"/order-confirmation",search:{session_id:session.session_id} as never})}/></CheckoutElementsProvider>{payError&&<p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{payError}</p>}</>:<p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">Complete billing details and continue. Stripe’s card fields will load here after your order is verified.</p>}
    </section>
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.35)] sm:p-6" aria-labelledby="order-summary-title">
    <div className="flex items-baseline justify-between gap-3"><h2 id="order-summary-title" className="text-xl font-bold text-slate-950">Order summary</h2><span className="text-xs font-medium text-slate-500">{lines.reduce((count,line)=>count+line.pieces,0)} items</span></div>
    <div className="mt-4 divide-y divide-border border-y border-border">
     {lines.map(line=>{const product=getProduct(line.sku);return product?<div key={line.sku} className="flex items-start justify-between gap-4 py-3 text-sm"><span className="min-w-0"><span className="block font-medium">{product.title}</span><span className="mt-0.5 block text-muted-foreground">Qty {line.pieces}</span></span><span className="shrink-0 font-medium">{money(lineTotal(line.pieces,product.price??0))}</span></div>:null;})}
    </div>
    <label className="mt-4 block text-sm font-medium">Coupon or discount code<input className={inputClass} name="coupon" value={coupon} onChange={e=>{setCoupon(e.target.value);setSession(null);}} placeholder="Enter code" autoComplete="off"/></label>
    <div className="mt-5 flex items-end justify-between gap-3"><span className="font-semibold">Total due</span><span className="text-2xl font-bold">{session?usd(session.amount_total):money(subtotal)}</span></div>
    {session&&<p className="mt-1 text-right text-xs text-muted-foreground">Verified order amount</p>}
    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole size={14}/>Secure checkout powered by Stripe</div>
    </section>
   </aside>
  </div>
  </div>
 </main>;
}

