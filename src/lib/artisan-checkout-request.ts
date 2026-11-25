import type { CartLine } from "@/lib/cart";
type Address={first_name:string;last_name:string;phone:string;line1:string;city:string;state:string;postal_code:string;country:"US"};
const required=(form:FormData,k:string,m:number)=>{const v=String(form.get(k)??"").trim();if(v.length<1||v.length>m)throw Error("Invalid "+k.replaceAll("_"," "));return v;};
const address=(f:FormData,p=""):Address=>({first_name:required(f,p+"first_name",120),last_name:required(f,p+"last_name",120),phone:required(f,p+"phone",40),line1:required(f,p+"line1",240),city:required(f,p+"city",140),state:required(f,p+"state",100),postal_code:required(f,p+"postal_code",20),country:"US"});
export function makeCheckoutRequest(f:FormData,cart:CartLine[],coupon:string,key:string,same:boolean){
 if(!/^[A-Za-z0-9_-]{20,128}$/.test(key))throw Error("Invalid checkout session");
 if(cart.length<1||cart.length>100)throw Error("Invalid cart");
 const items=cart.map(l=>{
  if(!l.sku||!Number.isSafeInteger(l.pieces)||l.pieces<1||l.pieces>99999999)throw Error("Invalid product quantity");
  return {sku:l.sku,quantity:l.pieces,mode:l.mode==="case"?"case":"piece"};
 });
 if(new Set(items.map(x=>x.sku)).size!==items.length)throw Error("Duplicate product");
 const billing=address(f),shipping=same?{...billing}:address(f,"shipping_");
 if(coupon.length>80)throw Error("Invalid coupon");
 return {idempotencyKey:key,items,billing,shipping,coupon:coupon.trim()||null};
}
