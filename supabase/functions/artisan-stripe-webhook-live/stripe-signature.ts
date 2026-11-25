/** Stripe-Signature verification with raw-body HMAC-SHA256 and 5-minute timestamp tolerance. */
function hexBytes(text:string):Uint8Array|null{
 if(!/^[0-9a-f]{64}$/i.test(text))return null;
 return new Uint8Array((text.match(/.{2}/g)??[]).map(x=>parseInt(x,16)));
}
export async function verifyStripeSignature(
 raw:string,header:string,secret:string,now=Math.floor(Date.now()/1000)
):Promise<boolean>{
 if(!secret.startsWith("whsec_"))return false;
 const fields=header.split(",").map(x=>x.trim());
 const timestampText=fields.find(x=>x.startsWith("t="))?.slice(2)??"";
 if(!/^\d{9,11}$/.test(timestampText))return false;
 const timestamp=Number(timestampText);
 if(Math.abs(now-timestamp)>300)return false;
 const signatures=fields.filter(x=>x.startsWith("v1=")).map(x=>x.slice(3));
 if(!signatures.length)return false;
 const encoder=new TextEncoder();
 const key=await crypto.subtle.importKey(
  "raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const correct=new Uint8Array(await crypto.subtle.sign("HMAC",key,
  encoder.encode(timestampText+"."+raw)));
 let match=0;
 for(const candidate of signatures){
  const claim=hexBytes(candidate);
  if(!claim)continue;
  let difference=0;
  for(let i=0;i<correct.length;i++)difference|=correct[i]!^claim[i]!;
  match|=Number(difference===0);
 }
 return match===1;
}
