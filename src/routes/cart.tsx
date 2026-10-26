import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getProduct, type Product } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { lineTotal, meetsMinimum, money, ORDER_MINIMUM } from "@/lib/wholesale";
import { QuickView } from "@/components/store/QuickView";
import { ExpressOrder } from "@/components/store/ExpressOrder";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [
    { title: "Shopping Cart | Artisan Mart" }, { name: "description", content: "Review your Artisan Mart wholesale cart." },
    { property: "og:title", content: "Shopping Cart | Artisan Mart" }, { property: "og:description", content: "Your wholesale cart." },
  ] }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, remove, clear } = useCart();
  const [edit, setEdit] = useState<{ p: Product; pieces: number } | null>(null);
  const [coupon, setCoupon] = useState("");
  const [msg, setMsg] = useState("");
  const ok = meetsMinimum(subtotal);
  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        {!ok && <div className="rounded bg-sec-closeout/10 p-3 font-semibold text-sec-closeout">Your order subtotal must be at least {money(ORDER_MINIMUM)} to check out. Add {money(ORDER_MINIMUM - subtotal)} more.</div>}
        <div className="overflow-x-auto rounded bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted"><tr>{["Product", "Item Number", "Quantity", "Subtotal", "Action"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>
              {lines.map((l) => { const p = getProduct(l.sku)!; return (
                <tr key={l.sku} className="border-t border-border">
                  <td className="p-3"><Link to="/product/$sku" params={{ sku: p.sku.toLowerCase() }} className="text-title underline">{p.title}</Link></td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3">{l.pieces} <button className="ml-2 text-primary underline" onClick={() => setEdit({ p, pieces: l.pieces })}>Change</button></td>
                  <td className="p-3">{money(lineTotal(l.pieces, p.price ?? 0))}</td>
                  <td className="p-3"><button className="text-destructive underline" onClick={() => remove(l.sku)}>Delete</button></td>
                </tr>); })}
              {!lines.length && <tr><td colSpan={5} className="p-6 text-center">Your cart is empty.</td></tr>}
            </tbody>
          </table>
        </div>
        {lines.length > 0 && <button className="rounded border border-border bg-card px-4 py-2" onClick={() => confirm("Clear all items from your cart?") && clear()}>Clear Cart</button>}
        <ExpressOrder />
        <details className="rounded bg-card p-4">
          <summary className="cursor-pointer font-bold">Estimate Shipping and Tax</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <select className="rounded border p-2" defaultValue="US"><option value="US">United States</option></select>
            <input className="rounded border p-2" placeholder="State/Province" />
            <input className="rounded border p-2" placeholder="Zip/Postal Code" />
          </div>
          <button className="mt-3 rounded bg-accent px-4 py-2 font-bold text-accent-foreground" onClick={() => setMsg("Shipping rates are not available yet — a carrier rate integration is required.")}>Calculate Shipping</button>
          {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
        </details>
      </div>
      <aside className="h-fit space-y-3 rounded bg-muted p-5">
        <h2 className="text-xl font-bold">Order Summary</h2>
        <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className="flex justify-between text-lg font-bold"><span>Grand Total</span><span>{money(subtotal)}</span></div>
        <div className="flex gap-2"><input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Promo code" className="min-w-0 flex-1 rounded border p-2" />
          <button className="rounded bg-primary px-3 text-primary-foreground" onClick={() => setMsg(coupon ? `Coupon "${coupon}" will be validated at order submission (coupon service not connected yet).` : "")}>Apply</button></div>
        <select className="w-full rounded border p-2" defaultValue="web"><option value="web">Sales Rep: Web Customer</option></select>
        {ok ? <Link to="/checkout" className="block rounded-full bg-accent py-3 text-center font-bold text-accent-foreground">Proceed to Checkout</Link>
            : <button disabled className="w-full rounded-full bg-accent py-3 font-bold text-accent-foreground opacity-50">Proceed to Checkout</button>}
      </aside>
      <QuickView p={edit?.p ?? null} initialPieces={edit?.pieces} onClose={() => setEdit(null)} />
    </div>
  );
}
