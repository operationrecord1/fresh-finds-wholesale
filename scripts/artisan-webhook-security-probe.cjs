// Non-destructive live webhook security probe: never uses valid Stripe signatures.
const assert=require("node:assert/strict");
const host="https://gbsyaembvdtadkuldpbe.supabase.co";
const endpoint=host+"/functions/v1/artisan-stripe-webhook-live";
(async()=>{
 const get=await fetch(endpoint,{method:"GET",signal:AbortSignal.timeout(15000)});
 console.log("Webhook GET status:",get.status);
 assert.equal(get.status,405,"Webhook must reject GET");
 const body=JSON.stringify({id:"evt_fake_inert_012345678901",type:"checkout.session.completed",livemode:true,data:{object:{id:"cs_live_fake"}}});
 const fakeSignature="t="+Math.floor(Date.now()/1000)+",v1="+"0".repeat(64);
 const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","Stripe-Signature":fakeSignature},body,signal:AbortSignal.timeout(15000)});
 console.log("Webhook fake signature HTTP status:",res.status);
 assert.equal(res.status,400,"Live webhook must reject invalid HMAC before reading/settling fake event");
 console.log("PASS: authentic webhook signature is required, no real event processed");
})().catch(e=>{console.error("FAIL:",e.message);process.exitCode=1;});
