import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { lineTotal, meetsMinimum, money } from "@/lib/wholesale";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [
    { title: "Checkout | Artisan Mart" }, { name: "description", content: "Complete your Artisan Mart wholesale order." },
    { property: "og:title", content: "Checkout | Artisan Mart" }, { property: "og:description", content: "Checkout." },
  ] }),
  component: Checkout,
});

const F = ({ label, req = true, type = "text" }: { label: string; req?: boolean; type?: string }) => (
  <label className="block text-sm">{label}{req && <span className="text-destructive"> *</span>}<input required={req} type={type} className="mt-1 w-full rounded border p-2" /></label>
);
const H = ({ n, t }: { n: number; t: string }) => <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">{n}</span>{t}</h2>;

function Checkout() {
  const { lines, subtotal } = useCart();
  const [same, setSame] = useState(true);
  const [notice, setNotice] = useState("");
  if (!meetsMinimum(subtotal)) return <div className="p-10 text-center">Your cart is below the $500 minimum. <Link to="/cart" className="text-primary underline">Return to cart</Link></div>;
  return (
    <form className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-3" onSubmit={(e) => { e.preventDefault(); setNotice("Order not submitted: payment processing and order submission are not connected yet."); }}>
      <section className="rounded bg-card p-5">
        <H n={1} t="Billing Address" />
        <div className="grid grid-cols-2 gap-3"><F label="First Name" /><F label="Last Name" /></div>
        <div className="mt-3 space-y-3"><F label="Company" req={false} /><F label="Email" type="email" /><F label="Telephone" type="tel" /><F label="Address" /><F label="City" />
          <div className="grid grid-cols-2 gap-3"><F label="State" /><F label="Zip" /></div>
          <label className="block text-sm">Country *<select className="mt-1 w-full rounded border p-2"><option>United States</option></select></label>
          <label className="block text-sm">Sales Representative *<select className="mt-1 w-full rounded border p-2"><option>Web Customer</option></select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={same} onChange={(e) => setSame(e.target.checked)} /> Ship to the same address</label>
          {!same && <div className="space-y-3 border-t pt-3"><F label="Shipping Address" /><F label="City" /><F label="Zip" /></div>}
        </div>
      </section>
      <section className="space-y-6">
        <div className="rounded bg-card p-5"><H n={2} t="Shipping Method" /><p className="text-sm text-muted-foreground">Please complete the address section to see shipping options.</p></div>
        <div className="rounded bg-card p-5"><H n={3} t="Payment Method" />
          {["Credit Card", "Apple Pay", "PayPal", "Amazon Pay"].map((m, i) => <label key={m} className="flex items-center gap-2 py-1"><input type="radio" name="pay" defaultChecked={i === 0} /> {m}</label>)}
          <p className="mt-2 text-xs text-muted-foreground">Payment providers are not connected yet.</p>
        </div>
      </section>
      <section className="rounded bg-card p-5">
        <h2 className="mb-3 text-lg font-bold">Review your order</h2>
        {lines.map((l) => { const p = getProduct(l.sku)!; return <div key={l.sku} className="flex justify-between border-b py-2 text-sm"><span>{p.sku} × {l.pieces}</span><span>{money(lineTotal(l.pieces, p.price ?? 0))}</span></div>; })}
        <div className="mt-3 flex justify-between font-bold"><span>Grand Total</span><span>{money(subtotal)}</span></div>
        <input placeholder="Coupon code" className="mt-3 w-full rounded border p-2" />
        <textarea placeholder="Comments" className="mt-3 w-full rounded border p-2" rows={3} />
        <button type="button" onClick={() => window.print()} className="mt-2 text-sm text-primary underline">Print</button>
        <button className="mt-3 w-full rounded-full bg-accent py-3 font-bold text-accent-foreground">Place Your Order</button>
        {notice && <p className="mt-3 text-sm font-semibold text-destructive">{notice}</p>}
      </section>
    </form>
  );
}
