import {useState} from 'react';
import type {CustomerOrder} from '@/lib/customer-order';

export function OrderShipToPopover({order}:{order:CustomerOrder}){
 const [open,setOpen]=useState(false);
 const a=order.shipping_address;
 const name=[order.shipping_address.first_name,order.shipping_address.last_name].filter(Boolean).join(' ')||'Not provided';
 return <div className="order-shipto" onPointerEnter={e=>{if(e.pointerType==='mouse')setOpen(true);}} onPointerLeave={e=>{if(e.pointerType==='mouse')setOpen(false);}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}} onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}>
 <button className="order-shipto-trigger" type="button" aria-expanded={open} aria-controls={`shipto-${order.id}`} onClick={()=>setOpen(true)}>{name} <span aria-hidden="true">⌄</span></button>
 {open&&<div className="order-shipto-popover" id={`shipto-${order.id}`} role="region" aria-label="Shipping address"><button className="order-shipto-close" type="button" aria-label="Close shipping address" onClick={()=>setOpen(false)}>×</button><address><strong>{name}</strong><div>{[a.line1,a.line2].filter(Boolean).join(", ")}</div><div>{[a.city,a.state,a.postal_code].filter(Boolean).join(", ")}</div><div>United States</div></address></div>}
 </div>;
}
