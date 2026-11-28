import { createFileRoute, Link } from "@tanstack/react-router";
import "@/components/store/CartPage.css";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { getProduct, type Product } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { lineTotal, meetsMinimum, money, ORDER_MINIMUM } from "@/lib/wholesale";
import { useDemoCouponFeedback } from "@/hooks/useDemoCouponFeedback";
import { QuickView } from "@/components/store/LazyQuickView";
import { ProductImage } from "@/components/store/ProductCard";
import { DemoCouponFeedback } from "@/components/store/DemoCouponFeedback";
import { preserveCartForCheckout } from "@/lib/artisan-checkout-intent";
import { couponDiscount } from "@/lib/demo-coupon";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [
    { title: "Shopping Cart | Artisan Mart" }, { name: "description", content: "Review your Artisan Mart wholesale cart." },
    { property: "og:title", content: "Shopping Cart | Artisan Mart" }, { property: "og:description", content: "Your wholesale cart." },
  ] }),
  component: CartPage,
});

export function CartPage() {
  const { lines, subtotal, requestRemove, requestClear } = useCart();
  const [edit, setEdit] = useState<{ p: Product; pieces: number } | null>(null);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon,setAppliedCoupon]=useState("");
  const discount=couponDiscount(subtotal,appliedCoupon);
  const { message, applyCoupon } = useDemoCouponFeedback();
  const ok = meetsMinimum(subtotal);
  return (
    <div className="cart-page">
      <div className="cart-page-heading">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        {!ok && <p className="cart-minimum-message rounded bg-sec-closeout/10 p-3 font-semibold text-sec-closeout" role="alert">Your order subtotal must be at least {money(ORDER_MINIMUM)} to check out. Add {money(ORDER_MINIMUM - subtotal)} more.</p>}
      </div>
      <div className="cart-items-panel space-y-6">
        <div className="cart-items">
          {lines.map(l => { const p = getProduct(l.sku); if (!p) return null; return <article className="cart-item" key={l.sku}>
            <div className="cart-item-info"><div className="cart-product-image"><ProductImage p={p}/></div><div className="cart-product-heading"><span className="cart-sku">ITEM #{p.sku}</span><Link title={p.title} to="/product/$sku" params={{sku:p.sku.toLowerCase()}}>{p.title}</Link></div></div>
            <div className="cart-item-purchase">
            <div className="cart-unit-price"><span>Price / piece</span><strong>{money(p.price ?? 0)}</strong></div>
            <div className="cart-quantity"><span>Quantity</span><strong>{l.pieces} pieces</strong><button onClick={()=>setEdit({p,pieces:l.pieces})} aria-label={`Change quantity for ${p.title}`}>Change quantity</button></div>
            <div className="cart-line-total"><span>Subtotal</span><strong>{money(lineTotal(l.pieces,p.price ?? 0))}</strong><button onClick={()=>{ requestRemove(l.sku); }} aria-label={`Remove ${p.title}`}><Trash2 size={15} aria-hidden="true"/> Remove</button></div>
            </div>
          </article>; })}
          {!lines.length && <div className="cart-empty"><ShoppingCart size={44} aria-hidden="true"/><h2>Your cart is ready for your first find</h2><p>Browse our wholesale products to get started.</p><Link to="/collection/$slug" params={{slug:"imports"}}>Browse products <ArrowRight size={17}/></Link></div>}
        </div>
        {lines.length > 0 && <button className="cart-clear" onClick={requestClear}><Trash2 size={15} aria-hidden="true"/> Clear Cart</button>}

      </div>
      <aside className="cart-summary h-fit space-y-3">
        <h2 className="text-xl font-bold">Order Summary</h2>
        <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        {discount>0&&<div className="flex justify-between"><span>ARTISAN · 5% off</span><span>−{money(discount)}</span></div>}
        <div className="cart-merchandise-total flex justify-between text-lg font-bold"><span>Merchandise total</span><span>{money(subtotal-discount)}</span></div>
        <div className="cart-promo-block" style={{ marginBlockEnd: 0 }}><div className="flex gap-[15px]"><input aria-label="Promo code" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Promo code" className="min-w-0 flex-1 rounded border p-2" />
          <button className="rounded bg-primary px-3 text-primary-foreground" onClick={() => setAppliedCoupon(applyCoupon(coupon)?coupon.trim().toUpperCase():"")}>Apply</button></div>
        <DemoCouponFeedback message={message} /></div>
        {ok ? <Link to="/checkout" onClick={()=>preserveCartForCheckout(lines,appliedCoupon)} className="block rounded-full bg-accent py-3 text-center font-bold text-accent-foreground">Proceed to Checkout</Link>
            : <button disabled className="w-full rounded-full bg-accent py-3 font-bold text-accent-foreground opacity-50">Proceed to Checkout</button>}
      </aside>
      <QuickView p={edit?.p ?? null} initialPieces={edit?.pieces} onClose={() => setEdit(null)} />
    </div>
  );
}
