import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckoutElementsProvider } from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { useArtisanAuth } from "@/lib/artisan-auth";
import { clearPaymentPage, loadPaymentPage } from "@/lib/artisan-payment-page";
import { StripePayment } from "@/components/store/StripePayment";
import { formatOrderNumber } from "@/lib/artisan-order-number";
import "@/components/store/CheckoutPage.css";

export const Route=createFileRoute("/payment")({head:()=>({meta:[{title:"Card Payment | Artisan Mart"},{name:"robots",content:"noindex"}]}),component:PaymentPage});
const appearance={theme:"stripe" as const,rules:{".Input:focus":{borderColor:"#222222",boxShadow:"0 0 0 2px rgba(0,0,0,0.06)"}}};
export function PaymentPage(){
 const {user,ready}=useArtisanAuth();
 const navigate=useNavigate();
 const [error,setError]=useState("");
 const data=useMemo(()=>user?.id?loadPaymentPage(user.id):null,[user?.id]);
 const sandbox=typeof window!=="undefined"&&window.location.hostname.endsWith(".artisanmart-staging.pages.dev");
 const key=import.meta.env["VITE_ARTISAN_STRIPE_PUBLISHABLE_KEY"];
 const stripe=useMemo(()=>typeof key==="string"&&key.startsWith(sandbox?"pk_test_":"pk_live_")?loadStripe(key):null,[key,sandbox]);
 if(!ready)return <div className="p-10 text-center" role="status">Loading secure payment…</div>;
 if(!user?.email_confirmed_at)return <div className="p-10 text-center">Please <Link to="/login" className="text-primary underline">sign in</Link> to continue.</div>;
 if(!data||!stripe)return <div className="mx-auto max-w-xl p-8 text-center"><h1 className="text-2xl font-bold">Return to checkout</h1><p className="my-4">Your payment session is unavailable or has expired. Review your billing details to continue.</p><Link to="/checkout" className="text-primary underline">Back to billing</Link></div>;
 return <main className="checkout-page payment-page min-h-screen"><div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
  <Link to="/checkout" className="mb-5 inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft size={16}/>Back to billing</Link>
  <section className="rounded-2xl border border-slate-800 bg-white p-5 sm:p-6">
   <div className="flex items-start gap-2 text-sm font-medium text-emerald-300"><ShieldCheck size={17} className="shrink-0"/><span>Secure payment ready · Order # {formatOrderNumber(data.session.order_number)}</span></div>
   <CheckoutElementsProvider stripe={stripe} options={{clientSecret:data.session.client_secret,elementsOptions:{appearance}}}>
    <StripePayment same={data.same} totalCents={data.session.amount_total} billing={data.billing} onError={setError} onSuccess={()=>{clearPaymentPage();void navigate({to:"/order-confirmation",search:{session_id:data.session.session_id} as never});}}/>
   </CheckoutElementsProvider>
   {error&&<p role="alert" className="mt-3 rounded-lg px-3 py-2 text-sm">{error}</p>}
   <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole size={14}/>Card payment powered by Stripe</div>
   <p className="mt-4 text-xs leading-5 text-slate-500">By completing this purchase, you agree to the <Link to="/terms-of-sale" className="underline">Terms of Sale</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
  </section>
 </div></main>;
}
