import { createClient } from "npm:@supabase/supabase-js@2.119.2";

const PROJECT_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STRIPE_KEY = Deno.env.get("ARTISAN_STRIPE_SECRET_KEY") ?? "";
const STRIPE_MODE = Deno.env.get("ARTISAN_STRIPE_MODE") ?? "";
const EXPECTED_ACCOUNT = Deno.env.get("ARTISAN_STRIPE_ACCOUNT_ID") ?? "";
const PRODUCTION = "https://artisanmart.site";

function allowedOrigin(origin:string):boolean {
 try {
  const u=new URL(origin);
  return u.protocol==="https:" && (
   u.hostname==="artisanmart.site" ||
   u.hostname==="www.artisanmart.site" ||
   (STRIPE_MODE==="test" && u.hostname.endsWith(".artisanmart-staging.pages.dev"))
  );
 }catch{return false;}
}
function cors(origin:string):HeadersInit {
 return {"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"POST,OPTIONS",
  "Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Vary":"Origin",
  "Cache-Control":"no-store"};
}
function respond(code:number,body:Record<string,unknown>,origin:string){
 return new Response(JSON.stringify(body),{status:code,headers:{...cors(origin),"Content-Type":"application/json"}});
}
function requiredEnv(){
 return !!PROJECT_URL&&!!ANON_KEY&&!!SERVICE_KEY&&
  !!STRIPE_KEY&&((STRIPE_MODE==="test"&&STRIPE_KEY.startsWith("sk_test_"))||
                  (STRIPE_MODE==="live"&&(STRIPE_KEY.startsWith("sk_live_")||STRIPE_KEY.startsWith("rk_live_"))))&&
  (STRIPE_MODE==="live"?EXPECTED_ACCOUNT==="acct_1UfSeU3jvjbD68qx":/^acct_[A-Za-z0-9]{10,}$/.test(EXPECTED_ACCOUNT));
}
async function stripeRequest(path:string,method:"GET"|"POST",params?:URLSearchParams){
 const response=await fetch("https://api.stripe.com/v1/"+path,{
  method,headers:{"Authorization":"Bearer "+STRIPE_KEY,
   ...(method==="POST"?{"Content-Type":"application/x-www-form-urlencoded"}:{})},
  ...(params?{body:params.toString()}:{}),
  signal:AbortSignal.timeout(12000),
 });
 if(!response.ok)throw new Error("Stripe API request failed ("+response.status+").");
 return await response.json();
}

Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")??"";
 if(!allowedOrigin(origin))return new Response("Forbidden origin",{status:403});
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(origin)});
 if(req.method!=="POST")return respond(405,{error:"Method not allowed"},origin);
 if(!requiredEnv())return respond(503,{error:"Secure checkout is not configured yet."},origin);
 const length=Number(req.headers.get("content-length")??0);
 if(length>16000)return respond(413,{error:"Request too large"},origin);
 const header=req.headers.get("authorization")??"";
 if(!header.startsWith("Bearer "))return respond(401,{error:"Login required"},origin);
 const token=header.slice(7);
 const scoped=createClient(PROJECT_URL,ANON_KEY,{
  global:{headers:{Authorization:header}},auth:{autoRefreshToken:false,persistSession:false}
 });
 const admin=createClient(PROJECT_URL,SERVICE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});
 try{
  const {data:userData,error:userError}=await scoped.auth.getUser(token);
  const user=userData?.user;
  if(userError||!user?.id||!user.email_confirmed_at)
   return respond(401,{error:"Verified customer login required"},origin);
  const body=await req.json();
  if(!body||typeof body!=="object"||typeof body.idempotencyKey!=="string"||
      !Array.isArray(body.items)||body.items.length>100||
      !body.billing||!body.shipping)
   return respond(400,{error:"Invalid checkout details"},origin);
  const {data:created,error:createError}=await scoped.rpc("artisan_begin_checkout",{
   p_idempotency_key:body.idempotencyKey,p_items:body.items,
   p_billing:body.billing,p_shipping:body.shipping,
   p_coupon:typeof body.coupon==="string"?body.coupon:null,
  });
  if(createError||!created?.order_id)
   return respond(422,{error:createError?.message??"Unable to reserve checkout."},origin);
  const orderId=String(created.order_id);
  const {data:order,error:orderError}=await admin.from("artisan_orders")
   .select("id,customer_id,total_cents,subtotal_cents,discount_cents,shipping_cents,tax_cents,currency,status,payment_status,checkout_session_id")
   .eq("id",orderId).single();
  if(orderError||!order||order.customer_id!==user.id||
     order.status!=="pending_payment"||order.payment_status!=="unpaid"||
     order.currency!=="usd"||order.total_cents<50000||
     order.total_cents!==order.subtotal_cents-order.discount_cents+order.shipping_cents+order.tax_cents)
   return respond(409,{error:"Invalid reserved order."},origin);
  // No shipping or tax is silently invented. Configuration and policy
  // verification are release gates in the database.
  if(order.discount_cents!==0||order.shipping_cents!==0||order.tax_cents!==0)
   return respond(503,{error:"The secure shipping/tax quote is not available."},origin);

  if(order.checkout_session_id){
   const previous=await stripeRequest("checkout/sessions/"+encodeURIComponent(order.checkout_session_id),"GET");
   if(previous.status==="open"&&previous.url&&previous.client_reference_id===orderId &&
      previous.livemode===(STRIPE_MODE==="live"))
    return respond(200,{checkout_url:previous.url,order_number:created.order_number,reused:true},origin);
   return respond(409,{error:"Checkout session is no longer open. Please start a new order."},origin);
  }

  const {data:items,error:itemsError}=await admin.from("artisan_order_items")
   .select("sku,title_snapshot,quantity,unit_price_cents,line_total_cents")
   .eq("order_id",orderId).order("sku");
  if(itemsError||!items?.length||items.reduce((n,it)=>n+it.line_total_cents,0)!==order.total_cents)
   return respond(409,{error:"Order amount could not be independently verified."},origin);
  const account=await stripeRequest("account","GET");
  if(account.id!==EXPECTED_ACCOUNT||account.charges_enabled!==true)
   return respond(503,{error:"Payment account unavailable."},origin);
  const params=new URLSearchParams();
  params.set("mode","payment");
  params.set("payment_method_types[0]","card");
  params.set("customer_email",String(user.email));
  params.set("billing_address_collection","required");
  params.set("shipping_address_collection[allowed_countries][0]","US");
  const returnOrigin=STRIPE_MODE==="test"?origin:PRODUCTION;
  params.set("success_url",returnOrigin+"/order-confirmation?session_id={CHECKOUT_SESSION_ID}");
  params.set("cancel_url",returnOrigin+"/checkout?payment_cancelled=1");
  params.set("client_reference_id",orderId);
  params.set("metadata[order_id]",orderId);
  params.set("metadata[customer_id]",user.id);
  params.set("payment_intent_data[metadata][order_id]",orderId);
  params.set("expires_at",String(Math.floor(Date.now()/1000)+45*60));
  for(let i=0;i<items.length;i++){
   const it=items[i];
   if(!Number.isSafeInteger(it.unit_price_cents)||!Number.isSafeInteger(it.quantity)||
      it.unit_price_cents<=0||it.quantity<=0)throw new Error("Invalid persisted order item");
   params.set("line_items["+i+"][price_data][currency]","usd");
   params.set("line_items["+i+"][price_data][unit_amount]",String(it.unit_price_cents));
   params.set("line_items["+i+"][price_data][product_data][name]",it.title_snapshot.slice(0,120));
   params.set("line_items["+i+"][price_data][product_data][metadata][sku]",it.sku);
   params.set("line_items["+i+"][quantity]",String(it.quantity));
  }
  let session;
  try{
   const r=await fetch("https://api.stripe.com/v1/checkout/sessions",{
    method:"POST",headers:{"Authorization":"Bearer "+STRIPE_KEY,
     "Content-Type":"application/x-www-form-urlencoded",
     "Idempotency-Key":"artisan-order-"+orderId},
    body:params.toString(),signal:AbortSignal.timeout(15000),
   });
   if(!r.ok)throw new Error("Payment session request declined ("+r.status+").");
   session=await r.json();
  }catch{
   await scoped.rpc("artisan_cancel_pending_order",{p_order:orderId});
   return respond(503,{error:"Secure payment session unavailable. Your stock reservation was not confirmed."},origin);
  }
  if(session.livemode!==(STRIPE_MODE==="live")||!session.id||
     !session.url||session.client_reference_id!==orderId||
     session.amount_total!==order.total_cents||session.currency!=="usd"){
   return respond(502,{error:"Payment session verification failed; do not retry this transaction."},origin);
  }
  const {error:attachError}=await admin.rpc("artisan_attach_checkout_session",{
    p_order:orderId,p_session_id:session.id,
    p_expires_at:new Date(session.expires_at*1000).toISOString(),
  });
  if(attachError){
   try{await stripeRequest("checkout/sessions/"+encodeURIComponent(session.id)+"/expire","POST",new URLSearchParams());}
   catch{/* Keep pending reservation: never release if Stripe expiry wasn't confirmed. */}
   return respond(503,{error:"Could not finalize payment session; please contact support before retrying."},origin);
  }
  return respond(200,{checkout_url:session.url,order_number:created.order_number},origin);
 }catch{
  return respond(503,{error:"Checkout is temporarily unavailable. Please try again later."},origin);
 }
});
