type Item={sku:string;quantity:number;mode:string};
export type CheckoutAttempt={idempotency_key:string;status:string;payment_status:string;reservation_expires_at:string;billing_address:unknown;shipping_address:unknown;artisan_order_items:Item[]};
const canonical=(value:unknown):string=>JSON.stringify(value,(_key,v)=>v&&typeof v==="object"&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
export function resumableCheckoutKey(saved:CheckoutAttempt|null,payload:{billing:unknown;shipping:unknown;items:Item[];coupon:string|null},now=Date.now()):string|null{
 if(!saved||saved.status!=="pending_payment"||saved.payment_status!=="unpaid"||Date.parse(saved.reservation_expires_at)<=now||!Number.isFinite(Date.parse(saved.reservation_expires_at)))return null;
 // Current approved coupons do not change prices; unknown coupons must be validated afresh.
 if(payload.coupon&&!['ARTISAN'].includes(payload.coupon))return null;
 const items=(rows:Item[])=>[...rows].sort((a,b)=>a.sku.localeCompare(b.sku));
 return canonical(saved.billing_address)===canonical(payload.billing)&&canonical(saved.shipping_address)===canonical(payload.shipping)&&canonical(items(saved.artisan_order_items))===canonical(items(payload.items))?saved.idempotency_key:null;
}
