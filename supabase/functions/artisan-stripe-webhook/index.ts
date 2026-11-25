import { createClient } from "npm:@supabase/supabase-js@2.119.2";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")??"";
const SERVICE_ROLE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const STRIPE_KEY=Deno.env.get("ARTISAN_STRIPE_SECRET_KEY")??"";
const WEBHOOK_SECRET=Deno.env.get("ARTISAN_STRIPE_WEBHOOK_SECRET")??"";
const STRIPE_MODE=Deno.env.get("ARTISAN_STRIPE_MODE")??"";
const EXPECTED_ACCOUNT=Deno.env.get("ARTISAN_STRIPE_ACCOUNT_ID")??"";
const expectedLive=STRIPE_MODE==="live";

function result(code:number,body:Record<string,unknown>){
 return new Response(JSON.stringify(body),{status:code,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
}
function fromHex(value:string):Uint8Array|null {
 if(!/^[a-f0-9]{64}$/i.test(value))return null;
 return new Uint8Array(value.match(/.{2}/g)!.map(x=>parseInt(x,16)));
}
async function validSignature(raw:string,header:string):Promise<boolean>{
 if(!WEBHOOK_SECRET.startsWith("whsec_"))return false;
 const parts=header.split(",").map(x=>x.trim());
 const t=parts.find(x=>x.startsWith("t="))?.slice(2)??"";
 const signatures=parts.filter(x=>x.startsWith("v1=")).map(x=>x.slice(3));
 const stamp=Number(t),now=Math.floor(Date.now()/1000);
 if(!Number.isSafeInteger(stamp)||Math.abs(now-stamp)>300||signatures.length===0)return false;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(WEBHOOK_SECRET),
  {name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const actual=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(t+"."+raw)));
 let accepted=0;
 for(const hex of signatures){
  const claim=fromHex(hex);
  if(!claim)continue;
  let difference=0;
  for(let i=0;i<actual.length;i++)difference|=actual[i]^claim[i];
  accepted|=Number(difference===0);
 }
 return accepted===1;
}
async function stripeGet(path:string):Promise<any>{
 const r=await fetch("https://api.stripe.com/v1/"+path,{
  headers:{Authorization:"Bearer "+STRIPE_KEY},
  signal:AbortSignal.timeout(12000),
 });
 if(!r.ok)throw new Error("Stripe verification read failed");
 return await r.json();
}

Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return result(405,{error:"Method not allowed"});
 if(!SUPABASE_URL||!SERVICE_ROLE||!STRIPE_KEY||!WEBHOOK_SECRET||
    !["test","live"].includes(STRIPE_MODE)||EXPECTED_ACCOUNT!=="acct_1UfSeU3jvjbD68qx"||
    !(expectedLive?(STRIPE_KEY.startsWith("sk_live_")||STRIPE_KEY.startsWith("rk_live_")):
      STRIPE_KEY.startsWith("sk_test_")))
    return result(503,{error:"Webhook signing and payment verification not configured"});
 if(Number(req.headers.get("content-length")??0)>100000)return result(413,{error:"Payload too large"});
 let raw:string;
 try{raw=await req.text();if(raw.length>100000)return result(413,{error:"Payload too large"});}
 catch{return result(400,{error:"Invalid request"});}
 if(!(await validSignature(raw,req.headers.get("stripe-signature")??"")))
   return result(400,{error:"Invalid Stripe signature"});
 let event:any;
 try{event=JSON.parse(raw);}catch{return result(400,{error:"Invalid event"});}
 if(event.livemode!==expectedLive||!event.id||!event.type||
   (event.account && event.account!==EXPECTED_ACCOUNT))
   return result(400,{error:"Stripe event account or mode mismatch"});
 const relevant=new Set(["checkout.session.completed","checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed","checkout.session.expired","charge.refunded"]);
 if(!relevant.has(event.type))return result(200,{received:true,ignored:true});
 const admin=createClient(SUPABASE_URL,SERVICE_ROLE,{auth:{autoRefreshToken:false,persistSession:false}});
 try{
  const account=await stripeGet("account");
  if(account.id!==EXPECTED_ACCOUNT)return result(403,{error:"Connected Stripe account mismatch"});
  if(event.type==="charge.refunded"){
   const chargeId=event.data?.object?.id;
   if(typeof chargeId!=="string"||!chargeId.startsWith("ch_"))
     return result(400,{error:"Invalid charge reference"});
   const charge=await stripeGet("charges/"+encodeURIComponent(chargeId));
   if(charge.livemode!==expectedLive||!charge.paid||charge.currency!=="usd"||
      !charge.payment_intent||charge.amount_refunded<=0)return result(409,{error:"Refund not verified"});
   const intent=typeof charge.payment_intent==="string"?charge.payment_intent:charge.payment_intent.id;
   const {data:order,error}=await admin.from("artisan_orders")
     .select("id,total_cents,checkout_session_id,payment_status,payment_intent_id")
     .eq("payment_intent_id",intent).maybeSingle();
   if(error||!order)return result(409,{error:"Refund has no matching order"});
   if(order.payment_status==="refunded"&&charge.amount_refunded===order.total_cents)
     return result(200,{received:true,already_refunded:true});
   const outcome=charge.amount_refunded>=order.total_cents?"refunded":"partially_refunded";
   const {error:dbError}=await admin.rpc("artisan_settle_verified_stripe_event",{
    p_order:order.id,p_event_id:event.id,p_session_id:order.checkout_session_id,
    p_payment_intent:intent,p_amount_cents:charge.amount_refunded,
    p_currency:"usd",p_outcome:outcome,p_live:expectedLive,
   });
   if(dbError)throw dbError;
   return result(200,{received:true});
  }
  const sessionId=event.data?.object?.id;
  if(typeof sessionId!=="string"||!/^cs_(test_|live_)/.test(sessionId))
   return result(400,{error:"Invalid Checkout Session"});
  const session=await stripeGet("checkout/sessions/"+encodeURIComponent(sessionId));
  if(session.id!==sessionId||session.livemode!==expectedLive||
    session.mode!=="payment"||session.currency!=="usd"||
    typeof session.amount_total!=="number"||!session.client_reference_id||
    session.metadata?.order_id!==session.client_reference_id)
    return result(409,{error:"Checkout Session proof mismatch"});
  const {data:order,error:orderError}=await admin.from("artisan_orders")
    .select("id,checkout_session_id,total_cents,currency,customer_id,payment_status")
    .eq("id",session.client_reference_id).maybeSingle();
  if(orderError||!order||order.checkout_session_id!==session.id||
    order.total_cents!==session.amount_total||order.currency!=="usd"||
    order.customer_id!==session.metadata?.customer_id)
    return result(409,{error:"Order amount or ownership mismatch"});
  const intent=typeof session.payment_intent==="string"?session.payment_intent:
    (session.payment_intent?.id??"");
  let outcome:"paid"|"expired"|"failed"|null=null;
  if(event.type==="checkout.session.expired"){
    if(session.status!=="expired"||session.payment_status==="paid")
      return result(409,{error:"Session has not actually expired"});
    outcome="expired";
  }else if(event.type==="checkout.session.async_payment_failed"){
    if(session.payment_status==="paid")return result(409,{error:"Payment did not fail"});
    outcome="failed";
  }else if(session.payment_status==="paid"&&session.status==="complete"){
    if(!intent.startsWith("pi_"))return result(409,{error:"Missing PaymentIntent"});
    outcome="paid";
  }else {
    // A completed Checkout Session can still be awaiting an asynchronous
    // payment. Never mark it paid until Stripe independently reports paid.
    return result(200,{received:true,payment_pending:true});
  }
  const {error:settleError}=await admin.rpc("artisan_settle_verified_stripe_event",{
   p_order:order.id,p_event_id:event.id,p_session_id:session.id,
   p_payment_intent:intent,p_amount_cents:session.amount_total,
   p_currency:session.currency,p_outcome:outcome,p_live:expectedLive,
  });
  if(settleError)throw settleError;
  return result(200,{received:true});
 }catch{
  // Stripe retries on 5xx. Never acknowledge a payment that hasn't
  // committed its authoritative order/inventory transaction.
  return result(500,{error:"Payment reconciliation pending retry"});
 }
});
