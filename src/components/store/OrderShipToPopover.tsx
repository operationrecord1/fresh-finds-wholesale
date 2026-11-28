import {useState} from 'react';
import {OrderShipTo} from './OrderInvoice';
import type {CustomerOrder} from '@/lib/customer-order';

export function OrderShipToPopover({order}:{order:CustomerOrder}){
 const [open,setOpen]=useState(false);
 const name=[order.shipping_address.first_name,order.shipping_address.last_name].filter(Boolean).join(' ')||'Not provided';
 return <div className="order-shipto" onPointerEnter={e=>{if(e.pointerType==='mouse')setOpen(true);}} onPointerLeave={e=>{if(e.pointerType==='mouse')setOpen(false);}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}} onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}>
 <button className="order-shipto-trigger" type="button" aria-expanded={open} aria-controls={`shipto-${order.id}`} onClick={()=>setOpen(true)}>{name} <span aria-hidden="true">⌄</span></button>
 {open&&<div className="order-shipto-popover" id={`shipto-${order.id}`} role="region" aria-label="Shipping address"><button className="order-shipto-close" type="button" aria-label="Close shipping address" onClick={()=>setOpen(false)}>×</button><OrderShipTo order={order}/></div>}
 </div>;
}
