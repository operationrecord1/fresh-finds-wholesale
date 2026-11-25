import { createClient } from "npm:@supabase/supabase-js@2.119.2";

const PROJECT_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";



const PRODUCTION = "https://artisanmart.site";

function allowedOrigin(origin:string,mode:string):boolean {
 try {
  const u=new URL(origin);
  return u.protocol==="https:" && (
   u.hostname==="artisanmart.site" ||
   u.hostname==="www.artisanmart.site" ||
   (mode==="test" && u.hostname.endsWith(".artisanmart-staging.pages.dev"))
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
function requiredEnv(key:string,mode:string,account:string){
 return !!PROJECT_URL&&!!ANON_KEY&&!!SERVICE_KEY&&
  !!key&&((mode==="test"&&key.startsWith("sk_test_"))||
                  (mode==="live"&&(key.startsWith("sk_live_")||key.startsWith("rk_live_"))))&&
  (mode==="live"?account==="acct_1UfSeU3jvjbD68qx":account==="acct_1Uf3Yu3sdabWE5fZ");
}
async function stripeRequest(path:string,method:"GET"|"POST",key:string,params?:URLSearchParams){
 const response=await fetch("https://api.stripe.com/v1/"+path,{
  method,headers:{"Authorization":"Bearer "+key,
   ...(method==="POST"?{"Content-Type":"application/x-www-form-urlencoded"}:{})},
  ...(params?{body:params.toString()}:{}),
  signal:AbortSignal.timeout(12000),
 });
 if(!response.ok)throw new Error("Stripe API request failed ("+response.status+").");
 return await response.json();
}

Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")??"";
 let host="";try{host=new URL(origin).hostname;}catch{}
 const mode="test"; // Fixed, isolated test mode; never select live keys.
 const expectedAccount=mode==="test"?"acct_1Uf3Yu3sdabWE5fZ":"acct_1UfSeU3jvjbD68qx";
 if(!allowedOrigin(origin,mode)||!host.endsWith(".artisanmart-staging.pages.dev"))return new Response("Forbidden origin",{status:403});
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(origin)});
 if(req.method!=="POST")return respond(405,{error:"Method not allowed"},origin);

 // Test-mode orders must use separate sandbox stock and order tables.
 // Until that isolated path is tested, never reserve live Artisan Mart inventory.
 const sandbox=mode==="test";
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
  // Reseller certificates are verified offline by the merchant. Only the
  // server-managed app_metadata approval can authorize zero-tax live checkout.
  if(!sandbox&&user.app_metadata?.artisan_reseller_approved!==true)
   return respond(403,{error:"Reseller eligibility is not approved for checkout."},origin);
  const {data:storedKey,error:secretError}=await admin.rpc("artisan_stripe_runtime_secret",{
   p_mode:mode,p_kind:"api_key",
  });
  const key=typeof storedKey==="string"&&storedKey?
    storedKey:(Deno.env.get("ARTISAN_STRIPE_SECRET_KEY")??"");
  if(secretError||!requiredEnv(key,mode,expectedAccount))
    return respond(503,{error:"Secure checkout credentials are not available."},origin);
  const body=await req.json();
  if(!body||typeof body!=="object"||typeof body.idempotencyKey!=="string"||
      !Array.isArray(body.items)||body.items.length>100||
      !body.billing||!body.shipping)
   return respond(400,{error:"Invalid checkout details"},origin);
  const {data:created,error:createError}=await admin.rpc(sandbox?"artisan_sandbox_begin_checkout":"artisan_begin_checkout_service",{ 
   p_customer_id:user.id,
   p_idempotency_key:body.idempotencyKey,p_items:body.items,
   p_billing:body.billing,p_shipping:body.shipping,
   p_coupon:typeof body.coupon==="string"?body.coupon:null,
  });
  if(createError||!created?.order_id)
   return respond(422,{error:createError?.message??"Unable to reserve checkout."},origin);
  const orderId=String(created.order_id);
  const {data:order,error:orderError}=sandbox
   ? await admin.rpc("artisan_sandbox_order_details",{p_order:orderId})
   : await admin.from("artisan_orders")
      .select("id,customer_id,total_cents,subtotal_cents,discount_cents,shipping_cents,tax_cents,currency,status,payment_status,checkout_session_id")
      .eq("id",orderId).single();
  if(orderError||!order||order.customer_id!==user.id||
     order.status!=="pending_payment"||order.payment_status!=="unpaid"||
     order.currency!=="usd"||order.total_cents<50000||
     (!sandbox&&order.total_cents!==order.subtotal_cents-order.discount_cents+order.shipping_cents+order.tax_cents))
   return respond(409,{error:"Invalid reserved order."},origin);
  // No shipping or tax is silently invented. Configuration and policy
  // verification are release gates in the database.
  if(!sandbox&&(order.discount_cents!==0||order.shipping_cents!==0||order.tax_cents!==0))
   return respond(503,{error:"The secure shipping/tax quote is not available."},origin);

  if(order.checkout_session_id){
   const previous=await stripeRequest("checkout/sessions/"+encodeURIComponent(order.checkout_session_id),"GET",key);
   if(previous.status==="open"&&previous.client_secret&&previous.ui_mode==="custom"&&previous.client_reference_id===orderId &&
      previous.livemode===(mode==="live"))
    return respond(200,{client_secret:previous.client_secret,session_id:previous.id,order_number:created.order_number,amount_total:previous.amount_total,currency:previous.currency,reused:true},origin);
   return respond(409,{error:"Checkout session is no longer open. Please start a new order."},origin);
  }

  const {data:items,error:itemsError}=sandbox
   ? {data:order.items,error:null}
   : await admin.from("artisan_order_items")
      .select("sku,title_snapshot,quantity,unit_price_cents,line_total_cents")
      .eq("order_id",orderId).order("sku");
  if(itemsError||!items?.length||items.reduce((n:number,it:{line_total_cents:number})=>n+it.line_total_cents,0)!==order.total_cents)
   return respond(409,{error:"Order amount could not be independently verified."},origin);
  const account=await stripeRequest("account","GET",key);
  if(account.id!==expectedAccount||account.charges_enabled!==true)
   return respond(503,{error:"Payment account unavailable."},origin);
  const params=new URLSearchParams();
  params.set("mode","payment");
  params.set("ui_mode","custom");
  params.set("payment_method_types[0]","card");
  params.set("customer_email",String(user.email));
  // Stripe payment receipts go only to the verified Auth email.
  params.set("payment_intent_data[receipt_email]",String(user.email));
  params.set("billing_address_collection","required");
  params.set("shipping_address_collection[allowed_countries][0]","US");
  const returnOrigin=mode==="test"?origin:PRODUCTION;
  params.set("return_url",returnOrigin+"/order-confirmation?session_id={CHECKOUT_SESSION_ID}");
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
    method:"POST",headers:{"Authorization":"Bearer "+key,
     "Content-Type":"application/x-www-form-urlencoded",
     "Idempotency-Key":"artisan-order-"+orderId},
    body:params.toString(),signal:AbortSignal.timeout(15000),
   });
   if(!r.ok)throw new Error("Payment session request declined ("+r.status+").");
   session=await r.json();
  }catch{
   if(sandbox)await admin.rpc("artisan_sandbox_cancel_unattached",{p_order:orderId});
   else await admin.rpc("artisan_cancel_pending_order_service",{p_order:orderId,p_customer_id:user.id});
   return respond(503,{error:"Secure payment session unavailable. Your stock reservation was not confirmed."},origin);
  }
  if(session.livemode!==(mode==="live")||!session.id||!session.client_secret||session.ui_mode!=="custom"||
     session.client_reference_id!==orderId||
     session.amount_total!==order.total_cents||session.currency!=="usd"){
   return respond(502,{error:"Payment session verification failed; do not retry this transaction."},origin);
  }
  const {error:attachError}=await admin.rpc(sandbox?"artisan_sandbox_attach_session":"artisan_attach_checkout_session",{
    p_order:orderId,p_session_id:session.id,
    p_expires_at:new Date(session.expires_at*1000).toISOString(),
  });
  if(attachError){
   try{await stripeRequest("checkout/sessions/"+encodeURIComponent(session.id)+"/expire","POST",key,new URLSearchParams());}
   catch{/* Keep pending reservation: never release if Stripe expiry wasn't confirmed. */}
   return respond(503,{error:"Could not finalize payment session; please contact support before retrying."},origin);
  }
  return respond(200,{client_secret:session.client_secret,session_id:session.id,order_number:created.order_number,amount_total:session.amount_total,currency:session.currency},origin);
 }catch{
  return respond(503,{error:"Checkout is temporarily unavailable. Please try again later."},origin);
 }
});
