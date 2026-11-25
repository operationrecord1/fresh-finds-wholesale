import { verifyStripeSignature } from "./stripe-signature.ts";

const secret="whsec_unit_test_not_a_real_credential";
const now=1_700_000_000;
const body=JSON.stringify({id:"evt_qa_test_event_0001",type:"checkout.session.completed",data:{object:{id:"cs_test_qa"}}});
async function sign(text:string,stamp:number){
 const encoder=new TextEncoder();
 const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const bytes=new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(stamp+"."+text)));
 return stamp+","+Array.from(bytes).map(b=>b.toString(16).padStart(2,"0")).join("");
}
Deno.test("Stripe valid signed webhook with raw body is accepted",async()=>{
 const [t,sig]= (await sign(body,now)).split(",");
 if(!(await verifyStripeSignature(body,"t="+t+",v1="+sig,secret,now)))throw new Error("Valid event rejected");
});
Deno.test("reject tampered payload after signature was calculated",async()=>{
 const [t,sig]=(await sign(body,now)).split(",");
 if(await verifyStripeSignature(body+" ","t="+t+",v1="+sig,secret,now))throw new Error("Tamper accepted");
});
Deno.test("reject wrong or malformed signatures",async()=>{
 if(await verifyStripeSignature(body,"t="+now+",v1="+"00".repeat(32),secret,now))throw new Error("Invalid signature accepted");
 if(await verifyStripeSignature(body,"t="+now+",v1=nothex",secret,now))throw new Error("Malformed signature accepted");
});
Deno.test("reject stale and future timestamps beyond tolerance",async()=>{
 const [t,sig]=(await sign(body,now-301)).split(",");
 if(await verifyStripeSignature(body,"t="+t+",v1="+sig,secret,now))throw new Error("Stale timestamp accepted");
 if(await verifyStripeSignature(body,"t="+t+",v1="+sig,secret,now-602))throw new Error("Future timestamp accepted");
});
Deno.test("reject absent signing secret",async()=>{
 const [t,sig]=(await sign(body,now)).split(",");
 if(await verifyStripeSignature(body,"t="+t+",v1="+sig,"",now))throw new Error("Missing secret accepted");
});
