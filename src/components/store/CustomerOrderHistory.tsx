import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";
import { getProduct } from "@/data/catalog";
import { US_STATE_NAMES } from "@/lib/us-address";
import "./CustomerOrderHistory.css";
type Address={first_name?:string;last_name?:string;line1?:string;line2?:string;city?:string;state?:string;postal_code?:string};
type Item={id:string;sku:string;title_snapshot:string;quantity:number;unit_price_cents:number;line_total_cents:number};
export type CustomerOrder={id:string;order_number:number;status:string;payment_status:string;total_cents:number;subtotal_cents:number;discount_cents:number;shipping_cents:number;tax_cents:number;created_at:string;updated_at:string;payment_confirmed_at:string|null;shipped_at:string|null;delivered_at:string|null;shipping_address:Address;artisan_order_items:Item[]};
const money=(c:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(c/100);
const date=(s:string)=>new Date(s).toLocaleDateString("en-US",{dateStyle:"long"});
const time=(s:string)=>new Date(s).toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short"});
const number=(o:CustomerOrder)=>`AM-${String(o.order_number).padStart(8,"0")}`;
export function orderStage(o:Pick<CustomerOrder,"status"|"payment_status"|"delivered_at"|"shipped_at">){
 if(o.status==="expired")return "Expired";if(o.status==="cancelled")return "Cancelled";if(o.payment_status==="refunded")return "Refunded";if(o.payment_status==="failed")return "Payment failed";
 if(o.delivered_at)return "Delivered";if(o.shipped_at)return "Shipped";
 return ({confirmed:"Order confirmed",fulfilling:"Preparing your order",fulfilled:"Fulfilled",pending_payment:"Awaiting payment"} as Record<string,string>)[o.status]||"Order received";
}
export const canRequestReturn=(o:Pick<CustomerOrder,"status"|"payment_status"|"delivered_at">)=>!!o.delivered_at&&!["cancelled","expired"].includes(o.status)&&["paid","partially_refunded"].includes(o.payment_status);
function Items({order:o}:{order:CustomerOrder}){return <ul className="order-items">{o.artisan_order_items.map(i=>{const image=getProduct(i.sku)?.images[0];return <li key={i.id}><Link to="/product/$sku" params={{sku:i.sku.toLowerCase()}} className="order-image" aria-label={i.title_snapshot}>{image?<img src={`${import.meta.env.BASE_URL}${image}`} alt="" loading="lazy"/>:<span>Image unavailable</span>}</Link><div><Link to="/product/$sku" params={{sku:i.sku.toLowerCase()}}>{i.title_snapshot}</Link><p>Item #{i.sku} · Quantity: {i.quantity}</p><p>{money(i.unit_price_cents)} per piece</p><strong>{money(i.line_total_cents)}</strong></div></li>;})}</ul>;}
function Actions({order:o,detail=false}:{order:CustomerOrder;detail?:boolean}){return <div className="order-actions">{!detail&&<Link to="/orders" search={{order:o.id}}>View order details</Link>}{canRequestReturn(o)&&<><Link to="/contact" search={{order:number(o),request:"return"}}>Request return</Link><Link to="/contact" search={{order:number(o),request:"replacement"}}>Request replacement</Link></>}</div>;}
function Totals({order:o}:{order:CustomerOrder}){return <dl className="order-totals">{[["Items subtotal",o.subtotal_cents],["Discount",-o.discount_cents],["Shipping",o.shipping_cents],["Tax",o.tax_cents],["Grand total",o.total_cents]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{money(value as number)}</dd></div>)}</dl>;}
export function CustomerOrderHistory({orderId,standalone=false}:{orderId?:string|undefined;standalone?:boolean}={}){
 const navigate=useNavigate();const {user,ready}=useArtisanAuth();const [orders,setOrders]=useState<CustomerOrder[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [revision,setRevision]=useState(0);const [limit,setLimit]=useState(30);const [query,setQuery]=useState("");
 useEffect(()=>{if(!user?.id||!ready||!artisanSupabase){setOrders([]);setLoading(false);return;}let active=true;setLoading(true);setError("");
 let request=artisanSupabase.from("artisan_orders").select("id,order_number,status,payment_status,total_cents,subtotal_cents,discount_cents,shipping_cents,tax_cents,created_at,updated_at,payment_confirmed_at,shipped_at,delivered_at,shipping_address,artisan_order_items(id,sku,title_snapshot,quantity,unit_price_cents,line_total_cents)").eq("customer_id",user.id);
 if(orderId)request=request.eq("id",orderId);
 Promise.resolve(request.order("created_at",{ascending:false}).limit(limit)).then(({data,error})=>{if(active){if(error)setError("We couldn't load your orders. Please try again.");else setOrders((data??[]) as CustomerOrder[]);}}).catch(()=>{if(active)setError("We couldn't load your orders. Please try again.");}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};
 },[ready,user?.id,orderId,limit,revision]);
 useEffect(()=>{const refresh=()=>setRevision(v=>v+1);window.addEventListener("focus",refresh);return()=>window.removeEventListener("focus",refresh);},[]);
 if(!ready)return <p role="status">Loading your account…</p>;
 if(!user?.email_confirmed_at)return standalone?<section className="customer-orders"><h1>Your orders</h1><p>Sign in to view your orders.</p><Link to="/login">Sign in</Link></section>:null;
 const selected=orderId?orders.find(o=>o.id===orderId):undefined;
 const visible=orders.filter(o=>`${number(o)} ${o.artisan_order_items.map(i=>i.title_snapshot+" "+i.sku).join(" ")}`.toLowerCase().includes(query.toLowerCase()));
 return <section id="orders" className={`customer-orders${standalone?" customer-orders-page":""}`} aria-labelledby="artisan-order-history-heading">
 <nav aria-label="Breadcrumb"><Link to="/account">Your account</Link><span> / </span>{orderId?<><Link to="/orders">Your orders</Link><span> / Order details</span></>:<span>Your orders</span>}</nav>
 <div className="orders-heading"><h1 id="artisan-order-history-heading">{orderId?"Order details":"Your orders"}</h1><button type="button" disabled={loading} onClick={()=>setRevision(v=>v+1)}>Refresh orders</button></div>
 {loading?<p role="status">Loading your orders…</p>:error?<p role="alert">{error}</p>:orderId?selected?<>
 <p>Order placed {date(selected.created_at)} · Order #{number(selected)}</p>
 <div className="order-detail-summary"><section><h2>Ship to</h2><address>{[selected.shipping_address.first_name,selected.shipping_address.last_name].filter(Boolean).join(" ")}<br/>{selected.shipping_address.line1}{selected.shipping_address.line2&&<><br/>{selected.shipping_address.line2}</>}<br/>{[selected.shipping_address.city,US_STATE_NAMES[selected.shipping_address.state||""]||selected.shipping_address.state,selected.shipping_address.postal_code].filter(Boolean).join(", ")}<br/>United States</address></section><section><h2>Payment</h2><p>{selected.payment_status.replaceAll("_"," ")}</p>{selected.payment_confirmed_at&&<p>Confirmed {time(selected.payment_confirmed_at)}</p>}<p>Card payment via Stripe</p></section><section><h2>Order summary</h2><Totals order={selected}/></section></div>
 <article className="order-card"><div className="order-body"><div><h2>{orderStage(selected)}</h2><p>Placed {time(selected.created_at)}</p>{selected.shipped_at&&<p>Shipped {time(selected.shipped_at)}</p>}{selected.delivered_at&&<p>Delivered {time(selected.delivered_at)}</p>}{["cancelled","expired"].includes(selected.status)&&<p>Updated {time(selected.updated_at)}</p>}<Items order={selected}/></div><Actions order={selected} detail/></div></article>
 </>:<p role="status">This order was not found in your account.</p>:<>
 <label className="orders-search">Search your loaded orders<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Order number, product or item number" type="search"/></label><p className="orders-count">{visible.length} {visible.length===1?"order":"orders"}</p>
 {visible.length===0?<p>No orders found.</p>:visible.map(o=><article key={o.id} className="order-card order-card-browse" onClick={e=>{if(!(e.target as HTMLElement).closest("a,button,input"))void navigate({to:"/orders",search:{order:o.id}});}}><header><div><span>Order placed</span><strong>{date(o.created_at)}</strong></div><div><span>Total</span><strong>{money(o.total_cents)}</strong></div><div><span>Ship to</span><strong>{[o.shipping_address.first_name,o.shipping_address.last_name].filter(Boolean).join(" ")||"See order details"}</strong></div><div className="order-number"><span>Order #{number(o)}</span><Link to="/orders" search={{order:o.id}}>View order details</Link></div></header><div className="order-body"><div><h2>{orderStage(o)}</h2><p className="order-payment">Payment: {o.payment_status.replaceAll("_"," ")}{o.payment_confirmed_at?` · ${time(o.payment_confirmed_at)}`:""}</p>{o.delivered_at&&<p>Delivered {time(o.delivered_at)}</p>}<Items order={o}/></div><Actions order={o}/></div></article>)}
 {orders.length>=limit&&<button type="button" onClick={()=>setLimit(n=>n+30)}>Load older orders</button>}</>}
 </section>;
}
