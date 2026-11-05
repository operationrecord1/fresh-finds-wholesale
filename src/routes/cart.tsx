import { createFileRoute, Link } from "@tanstack/react-router";
import "@/components/store/CartPage.css";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { getProduct, type Product } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { lineTotal, meetsMinimum, money, ORDER_MINIMUM } from "@/lib/wholesale";
import { QuickView } from "@/components/store/LazyQuickView";
import { ProductImage } from "@/components/store/ProductCard";
import { ExpressOrder } from "@/components/store/ExpressOrder";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [
    { title: "Shopping Cart | Artisan Mart" }, { name: "description", content: "Review your Artisan Mart wholesale cart." },
    { property: "og:title", content: "Shopping Cart | Artisan Mart" }, { property: "og:description", content: "Your wholesale cart." },
  ] }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, requestRemove, requestClear } = useCart();
  const [edit, setEdit] = useState<{ p: Product; pieces: number } | null>(null);
  const [coupon, setCoupon] = useState("");
  const [msg, setMsg] = useState("");
  const ok = meetsMinimum(subtotal);
  return (
    <div className="cart-page">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        {!ok && <div className="rounded bg-sec-closeout/10 p-3 font-semibold text-sec-closeout">Your order subtotal must be at least {money(ORDER_MINIMUM)} to check out. Add {money(ORDER_MINIMUM - subtotal)} more.</div>}
        <div className="cart-items">
          {lines.map(l => { const p = getProduct(l.sku); if (!p) return null; return <article className="cart-item" key={l.sku}>
            <div className="cart-item-info"><button className="cart-product-image" aria-label={`View ${p.title}`} onClick={()=>setEdit({p,pieces:l.pieces})}><ProductImage p={p}/></button><span className="cart-sku">ITEM #{p.sku}</span><Link to="/product/$sku" params={{sku:p.sku.toLowerCase()}}>{p.title}</Link><p>{money(p.price ?? 0)} / piece</p></div>
            <div className="cart-quantity"><span>Quantity</span><strong>{l.pieces} pieces</strong><button onClick={()=>setEdit({p,pieces:l.pieces})} aria-label={`Change quantity for ${p.title}`}>Change quantity</button></div>
            <div className="cart-line-total"><span>Subtotal</span><strong>{money(lineTotal(l.pieces,p.price ?? 0))}</strong><button onClick={()=>{ requestRemove(l.sku); }} aria-label={`Remove ${p.title}`}><Trash2 size={15} aria-hidden="true"/> Remove</button></div>
          </article>; })}
          {!lines.length && <div className="cart-empty"><ShoppingCart size={44} aria-hidden="true"/><h2>Your cart is ready for your first find</h2><p>Browse our wholesale products or add an item number below.</p><Link to="/collection/$slug" params={{slug:"imports"}}>Browse products <ArrowRight size={17}/></Link></div>}
        </div>
        {lines.length > 0 && <button className="rounded border border-border bg-card px-4 py-2" onClick={requestClear}>Clear Cart</button>}
        <ExpressOrder />

      </div>
      <aside className="cart-summary h-fit space-y-3">
        <h2 className="text-xl font-bold">Order Summary</h2>
        <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className="flex justify-between text-lg font-bold"><span>Merchandise total</span><span>{money(subtotal)}</span></div>
        <p className="text-sm text-muted-foreground">Shipping and tax are not included.</p><div className="flex gap-2"><input aria-label="Promo code" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Promo code" className="min-w-0 flex-1 rounded border p-2" />
          <button className="rounded bg-primary px-3 text-primary-foreground" onClick={() => setMsg(coupon ? `Promo codes are not available yet. No discount has been applied.` : "")}>Apply</button></div>
        {msg && <p role="status" className="cart-feedback">{msg}</p>}
        <select aria-label="Sales representative" className="w-full rounded border p-2" defaultValue="web"><option value="web">Sales Rep: Web Customer</option></select>
        {ok ? <Link to="/checkout" className="block rounded-full bg-accent py-3 text-center font-bold text-accent-foreground">Proceed to Checkout</Link>
            : <button disabled className="w-full rounded-full bg-accent py-3 font-bold text-accent-foreground opacity-50">Proceed to Checkout</button>}
      </aside>
      <QuickView p={edit?.p ?? null} initialPieces={edit?.pieces} onClose={() => setEdit(null)} />
    </div>
  );
}
