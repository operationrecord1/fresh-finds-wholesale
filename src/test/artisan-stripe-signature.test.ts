import { describe,expect,it } from "vitest";
import { verifyStripeSignature } from "../../supabase/functions/artisan-stripe-webhook-live/stripe-signature";

const secret="whsec_qa_only_fake_signing_secret";
const payload=JSON.stringify({id:"evt_fake_test_0123456789",type:"checkout.session.completed"});
async function goodSignature(timestamp:number,content=payload){
 const encoder=new TextEncoder();
 const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const signed=await crypto.subtle.sign("HMAC",key,encoder.encode(String(timestamp)+"."+content));
 return Buffer.from(signed).toString("hex");
}
describe("Stripe webhook signature validator",()=>{
 it("accepts an authentic HMAC of the exact original body within tolerance",async()=>{
  const now=Math.floor(Date.now()/1000),signature=await goodSignature(now);
  expect(await verifyStripeSignature(payload,"t="+now+",v1="+signature,secret,now)).toBe(true);
 });
 it("rejects tampered raw payload",async()=>{
  const now=Math.floor(Date.now()/1000),signature=await goodSignature(now);
  expect(await verifyStripeSignature(payload+" ","t="+now+",v1="+signature,secret,now)).toBe(false);
 });
 it("rejects stale and future timestamps",async()=>{
  const now=Math.floor(Date.now()/1000);
  for(const timestamp of [now-301,now+301]){
   const signature=await goodSignature(timestamp);
   expect(await verifyStripeSignature(payload,"t="+timestamp+",v1="+signature,secret,now)).toBe(false);
  }
 });
 it("rejects invalid signatures and missing timestamps",async()=>{
  const now=Math.floor(Date.now()/1000);
  expect(await verifyStripeSignature(payload,"t="+now+",v1="+"0".repeat(64),secret,now)).toBe(false);
  expect(await verifyStripeSignature(payload,"v1="+"0".repeat(64),secret,now)).toBe(false);
  expect(await verifyStripeSignature(payload,"t=not-a-timestamp,v1="+"0".repeat(64),secret,now)).toBe(false);
 });
 it("accepts at least one valid signature during rotation",async()=>{
  const now=Math.floor(Date.now()/1000),valid=await goodSignature(now);
  expect(await verifyStripeSignature(payload,"t="+now+",v1="+"0".repeat(64)+",v1="+valid,secret,now)).toBe(true);
 });
});
