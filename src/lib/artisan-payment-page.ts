import type { PaymentBilling } from "@/components/store/StripePayment";

export type PaymentPageSession = { client_secret:string;session_id:string;order_number:number|string;amount_total:number;currency:string };
export type PaymentPageData = { owner:string;expires:number;session:PaymentPageSession;billing:PaymentBilling;same:boolean };
const key="artisan-mart-payment-page";
const billingKeys=["first_name","last_name","company","email","phone","line1","line2","city","state","postal_code","shipping_first_name","shipping_last_name","shipping_phone","shipping_line1","shipping_line2","shipping_city","shipping_state","shipping_postal_code"] as const;

// Tab-scoped handoff only. Never store card details or put the client secret in a URL.
export function savePaymentPage(owner:string,session:PaymentPageSession,billing:PaymentBilling,same:boolean){
 sessionStorage.setItem(key,JSON.stringify({owner,session,billing,same,expires:Date.now()+30*60*1000}));
}
export function clearPaymentPage(){sessionStorage.removeItem(key);}
export function loadPaymentPage(owner:string):PaymentPageData|null{
 try{
  const data=JSON.parse(sessionStorage.getItem(key)||"null") as PaymentPageData|null;
  if(!data||data.owner!==owner||!Number.isFinite(data.expires)||data.expires<=Date.now()||typeof data.same!=="boolean")return null;
  const s=data.session;
  if(!s||typeof s.client_secret!=="string"||!s.client_secret||typeof s.session_id!=="string"||!s.session_id||!Number.isSafeInteger(s.amount_total)||s.amount_total<=0||s.currency!=="usd"||!["string","number"].includes(typeof s.order_number))return null;
  if(!data.billing||billingKeys.some(k=>typeof data.billing[k]!=="string"))return null;
  return data;
 }catch{return null;}
}
