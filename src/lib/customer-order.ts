import { formatOrderNumber } from "./artisan-order-number";
export type OrderAddress={first_name?:string;last_name?:string;line1?:string;line2?:string;city?:string;state?:string;postal_code?:string};
export type OrderItem={id:string;sku:string;title_snapshot:string;quantity:number;unit_price_cents:number;line_total_cents:number};
export type CustomerOrder={id:string;order_number:number;status:string;payment_status:string;total_cents:number;subtotal_cents:number;discount_cents:number;shipping_cents:number;tax_cents:number;created_at:string;updated_at:string;payment_confirmed_at:string|null;shipped_at:string|null;delivered_at:string|null;shipping_address:OrderAddress;artisan_order_items:OrderItem[];payment_card_brand?:string|null;payment_card_last4?:string|null;payment_card_issuer?:string|null;payment_decline_code?:string|null;carrier?:string|null;tracking_number?:string|null;tracking_url?:string|null;estimated_delivery_start?:string|null;estimated_delivery_end?:string|null};
export const orderNumber=(o:CustomerOrder)=>formatOrderNumber(o.order_number);
export const orderMoney=(c:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(c/100);
export const orderDate=(s:string)=>new Date(s.length===10?s+'T12:00:00':s).toLocaleDateString("en-US",{dateStyle:"long"});
export const orderTime=(s:string)=>new Date(s).toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short"});
export const closedOrder=(o:Pick<CustomerOrder,'status'|'payment_status'|'payment_decline_code'>)=>['cancelled','expired'].includes(o.status)||o.payment_status==='cancelled';
export const declinedOrder=(o:Pick<CustomerOrder,'payment_status'|'payment_decline_code'>)=>o.payment_status==='failed'||!!o.payment_decline_code;
export const paidOrder=(o:CustomerOrder)=>['paid','partially_refunded','refunded'].includes(o.payment_status)&&!closedOrder(o);
export function orderStage(o:Pick<CustomerOrder,'status'|'payment_status'|'delivered_at'|'shipped_at'|'payment_decline_code'>){
 if(o.status==='expired')return 'Expired';if(o.status==='cancelled')return 'Cancelled';if(o.payment_status==='refunded')return 'Refunded';if(o.payment_status==='failed'||o.payment_decline_code)return 'Payment declined';
 if(o.delivered_at)return 'Delivered';if(o.shipped_at)return 'Shipped';return ({confirmed:'Order confirmed',fulfilling:'Preparing your order',fulfilled:'Fulfilled',pending_payment:'Awaiting payment'} as Record<string,string>)[o.status]||'Order received';
}
export const canRequestReturn=(o:Pick<CustomerOrder,'status'|'payment_status'|'delivered_at'>)=>!!o.delivered_at&&!['cancelled','expired'].includes(o.status)&&['paid','partially_refunded'].includes(o.payment_status);
export function deliveryLabel(o:CustomerOrder){if(o.delivered_at)return `Delivered ${orderDate(o.delivered_at)}`;if(o.estimated_delivery_start)return `Arriving ${orderDate(o.estimated_delivery_start)}${o.estimated_delivery_end&&o.estimated_delivery_end!==o.estimated_delivery_start?' – '+orderDate(o.estimated_delivery_end):''}`;if(paidOrder(o)){const arrival=new Date(o.created_at);arrival.setUTCDate(arrival.getUTCDate()+3);return `Estimated arrival ${orderDate(arrival.toISOString())}`;}return orderStage(o);}
export function safeTrackingUrl(value:string|null|undefined){try{const u=new URL(value||'');return u.protocol==='https:'?u.href:null;}catch{return null;}}
