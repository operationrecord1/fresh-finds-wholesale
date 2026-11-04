import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, X } from "lucide-react";
import { getProduct, type Product } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { lineTotal, meetsMinimum, money, ORDER_MINIMUM } from "@/lib/wholesale";
import { ProductImage } from "./ProductCard";
import { QuickView } from "./LazyQuickView";
import "./CartInteractions.css";

export function MiniCart() {
  const { lines, subtotal, requestRemove } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<{p: Product; pieces: number} | null>(null);
  const [position, setPosition] = useState({top: 0, right: 12});
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const keepOpen = () => { clearTimeout(timer.current); setOpen(true); };
  const close = () => { clearTimeout(timer.current); setOpen(false); };
  const leave = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(false), 140); };
  useEffect(() => () => clearTimeout(timer.current), []);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (rect) setPosition({top: Math.min(rect.bottom + 6, window.innerHeight - 160), right: Math.max(12, window.innerWidth - rect.right)});
    };
    const outside = (e: PointerEvent) => {
      if (!trigger.current?.contains(e.target as Node) && !panel.current?.contains(e.target as Node)) close();
    };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { close(); trigger.current?.focus(); } };
    place();
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", key); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open]);
  return <>
    <button ref={trigger} type="button" className="store-cart-button" aria-label={`Shopping cart, ${lines.length} products`} aria-expanded={open} aria-controls="cart-preview"
      onPointerEnter={e => { if (e.pointerType === "mouse") keepOpen(); }} onPointerLeave={e => { if (e.pointerType === "mouse") leave(); }}
      onClick={e => { if (e.detail > 0 && window.matchMedia("(hover: hover)").matches) { close(); navigate({to:"/cart"}); } else if (open) close(); else keepOpen(); }}>
      <span className="store-cart-icon"><ShoppingCart aria-hidden="true"/><b>{lines.length}</b></span><span>Cart</span>
    </button>
    {open && createPortal(<div ref={panel} id="cart-preview" className="mini-cart" role="region" aria-label="Shopping cart preview" style={{top:position.top,right:position.right,maxHeight:`calc(100dvh - ${position.top + 12}px)`}}
      onPointerEnter={keepOpen} onPointerLeave={e => { if (e.pointerType === "mouse" && !panel.current?.contains(document.activeElement)) leave(); }}
      onFocus={keepOpen} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node) && e.relatedTarget !== trigger.current) close(); }}>
      <div className="mini-cart-heading"><h2>{lines.length} Item(s)</h2><button aria-label="Close cart preview" onClick={() => {close(); trigger.current?.focus();}}><X size={20}/></button></div>
      <div className="mini-cart-total">Total: <strong>{money(subtotal)}</strong></div>
      {!lines.length ? <p className="mini-cart-empty">Your cart is empty. Find your next wholesale favorite.</p> : <ul className="mini-cart-lines">{lines.map(line => {
        const p = getProduct(line.sku); if (!p) return null;
        return <li key={line.sku}><button className="mini-cart-image" aria-label={`View ${p.title}`} onClick={() => {close();setEdit({p,pieces:line.pieces});}}><ProductImage p={p}/></button><div>
          <Link to="/product/$sku" params={{sku:p.sku.toLowerCase()}} onClick={close}>{p.title}</Link>
          <p>Item # {p.sku} · Price: {money(p.price ?? 0)}</p><p>Quantity: {line.pieces} · Subtotal: {money(lineTotal(line.pieces,p.price ?? 0))}</p>
          <div className="mini-cart-actions"><button onClick={() => { close(); requestRemove(p.sku); }} aria-label={`Remove ${p.title}`}>Remove</button><button onClick={() => {close();setEdit({p,pieces:line.pieces});}} aria-label={`Change quantity for ${p.title}`}>Change</button></div>
        </div></li>;
      })}</ul>}
      {!!lines.length && !meetsMinimum(subtotal) && <p className="mini-cart-minimum">Your order is below the {money(ORDER_MINIMUM)} minimum.</p>}
      <div className="mini-cart-footer"><Link to="/cart" onClick={close}>View your cart</Link>{meetsMinimum(subtotal) ? <Link to="/checkout" onClick={close}>Checkout</Link> : <button disabled>Checkout</button>}</div>
    </div>, document.body)}
    <QuickView p={edit?.p ?? null} initialPieces={edit?.pieces} onClose={() => {setEdit(null); trigger.current?.focus();}}/>
  </>;
}
