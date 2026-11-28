import { useState } from "react";
import { PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import { LockKeyhole } from "lucide-react";
export type PaymentBilling = {first_name:string;last_name:string;company:string;email:string;phone:string;line1:string;line2:string;city:string;state:string;postal_code:string;shipping_first_name:string;shipping_last_name:string;shipping_phone:string;shipping_line1:string;shipping_line2:string;shipping_city:string;shipping_state:string;shipping_postal_code:string};
const usd=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
export function StripePayment({totalCents,billing,same,onError,onSuccess}:{totalCents:number;billing:PaymentBilling;same:boolean;onError:(message:string)=>void;onSuccess:()=>void}){
 const result=useCheckoutElements();
 const [busy,setBusy]=useState(false);
 const checkout=result.type==="success"?result.checkout:null;
 const confirm=async()=>{
  if(busy||!checkout)return;
  setBusy(true);onError("");
  try{
   const response=await checkout.confirm({
    // The session owns return_url and customer_email; never submit either twice.
    redirect:"if_required",
    billingAddress:{name:`${billing.first_name} ${billing.last_name}`.trim(),address:{country:"US",line1:billing.line1,line2:billing.line2,city:billing.city,state:billing.state,postal_code:billing.postal_code}},
    shippingAddress:same?{name:`${billing.first_name} ${billing.last_name}`.trim(),address:{country:"US",line1:billing.line1,line2:billing.line2,city:billing.city,state:billing.state,postal_code:billing.postal_code}}:{name:`${billing.shipping_first_name} ${billing.shipping_last_name}`.trim(),address:{country:"US",line1:billing.shipping_line1,line2:billing.shipping_line2,city:billing.shipping_city,state:billing.shipping_state,postal_code:billing.shipping_postal_code}},
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
  <PaymentElement options={{layout:"tabs",paymentMethodOrder:["card"],fields:{billingDetails:{name:"never",email:"never",phone:"never",address:"never"}},wallets:{applePay:"never",googlePay:"never"}}} />
  <button type="button" onClick={()=>void confirm()} disabled={busy||!checkout} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-5 py-3 font-bold text-slate-950 shadow-sm transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-55">
   {busy?"Processing payment…":`Complete purchase · ${usd(totalCents)}`}
  </button>
 </div>;
}

