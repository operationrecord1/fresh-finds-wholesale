import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CreditCard, Landmark, CircleX, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PaymentDetails, type PaymentDetailsHandle } from "@/components/store/PaymentDetails";
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

export function Checkout() {
  const { lines, subtotal } = useCart();
  const [same, setSame] = useState(true);
  const [payment, setPayment] = useState("card");
  const [paymentError, setPaymentError] = useState(false);
  const paymentRef = useRef<PaymentDetailsHandle>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  if (!meetsMinimum(subtotal)) return <div className="p-10 text-center">Your cart is below the $500 minimum. <Link to="/cart" className="text-primary underline">Return to cart</Link></div>;
  return (
    <form className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-3" onSubmit={(e) => { e.preventDefault(); if (!paymentRef.current?.validate()) return; paymentRef.current.clear(); setPaymentError(true); }}>
      <section className="min-w-0 rounded bg-card p-5">
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
      <section className="min-w-0 space-y-6">
        <div className="min-w-0 rounded bg-card p-5"><H n={2} t="Shipping Method" /><p className="text-sm text-muted-foreground">Please complete the address section to see shipping options.</p></div>
        <div className="min-w-0 rounded bg-card p-5"><H n={3} t="Payment Method" />
          <fieldset className="space-y-3">
            <legend className="sr-only">Choose a payment method</legend>
            {[
              { value: "card", title: "Credit Card", detail: "Pay by credit card", Icon: CreditCard },
              { value: "wire", title: "Wire Transfer", detail: "Pay by bank transfer", Icon: Landmark },
            ].map(({ value, title, detail, Icon }) => (
              <label key={value} className={`flex min-h-20 cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${payment === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40"}`}>
                <input type="radio" name="pay" value={value} checked={payment === value} onChange={() => { paymentRef.current?.clear(); setPayment(value); }} className="h-4 w-4 shrink-0 accent-primary" />
                <Icon aria-hidden="true" className="h-6 w-6 shrink-0 text-primary" />
                <span className="min-w-0"><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{detail}</span></span>
              </label>
            ))}
          </fieldset>
          <PaymentDetails key={payment} ref={paymentRef} method={payment} />
        </div>
      </section>
      <section className="min-w-0 rounded bg-card p-5">
        <h2 className="mb-3 text-lg font-bold">Review your order</h2>
        {lines.map((l) => { const p = getProduct(l.sku)!; return <div key={l.sku} className="flex justify-between border-b py-2 text-sm"><span>{p.sku} × {l.pieces}</span><span>{money(lineTotal(l.pieces, p.price ?? 0))}</span></div>; })}
        <div className="mt-3 flex justify-between font-bold"><span>Grand Total</span><span>{money(subtotal)}</span></div>
        <input placeholder="Coupon code" className="mt-3 w-full rounded border p-2" />
        <textarea placeholder="Comments" className="mt-3 w-full rounded border p-2" rows={3} />
        <button type="button" onClick={() => window.print()} className="mt-2 text-sm text-primary underline">Print</button>
        <button ref={submitRef} type="submit" className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 font-bold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Place Your Order <ChevronRight size={18} aria-hidden="true" /></button>
      </section>
      <Dialog open={paymentError} onOpenChange={setPaymentError}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white p-6 text-center sm:p-8" onCloseAutoFocus={(event) => { event.preventDefault(); submitRef.current?.focus(); }}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><CircleX size={32} aria-hidden="true" /></span>
          <DialogTitle className="text-xl leading-snug">Unable to complete payment</DialogTitle>
          <DialogDescription className="leading-relaxed">Please try again later or contact us.</DialogDescription>
          <p className="text-sm text-muted-foreground">Your cart and address information are still here.</p>
          <button type="button" onClick={() => setPaymentError(false)} className="min-h-11 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Return to checkout</button>
          <Link to="/contact" onClick={() => paymentRef.current?.clear()} className="inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-2 font-semibold text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Contact us</Link>
        </DialogContent>
      </Dialog>
    </form>
  );
}
