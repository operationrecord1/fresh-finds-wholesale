import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CreditCard, Landmark, CheckCircle2, LoaderCircle, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PaymentDetails, type PaymentDetailsHandle } from "@/components/store/PaymentDetails";
import { DemoCouponFeedback } from "@/components/store/DemoCouponFeedback";
import { getProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { lineTotal, meetsMinimum, money } from "@/lib/wholesale";
import { isValidDemoCoupon, INVALID_COUPON_MESSAGE, DEMO_COUPON_SUCCESS_MESSAGE } from "@/lib/demo-coupon";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [
    { title: "Checkout | Artisan Mart" }, { name: "description", content: "Complete your Artisan Mart wholesale order." },
    { property: "og:title", content: "Checkout | Artisan Mart" }, { property: "og:description", content: "Checkout." },
  ] }),
  component: Checkout,
});

const F = ({ label, req = true, type = "text", numericOnly = false }: { label: string; req?: boolean; type?: string; numericOnly?: boolean }) => (
  <label className="block text-sm">{label}{req && <span className="text-destructive"> *</span>}<input
    required={req}
    type={type}
    inputMode={numericOnly ? "numeric" : undefined}
    pattern={numericOnly ? "[0-9]*" : undefined}
    onInput={numericOnly ? e => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); } : undefined}
    className="mt-1 w-full rounded border p-2"
  /></label>
);
const H = ({ n, t }: { n: number; t: string }) => <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">{n}</span>{t}</h2>;

export function Checkout() {
  const { lines, subtotal } = useCart();
  const [same, setSame] = useState(true);
  const [payment, setPayment] = useState("card");
  const [phase, setPhase] = useState<"idle" | "processing" | "success">("idle");
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState<"valid" | "invalid" | null>(null);
  const processingTimer = useRef<number | null>(null);
  const paymentRef = useRef<PaymentDetailsHandle>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  useEffect(() => () => { if (processingTimer.current !== null) window.clearTimeout(processingTimer.current); }, []);
  const submitDemo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phase !== "idle") return;
    if (coupon !== "" && !isValidDemoCoupon(coupon)) { setCouponMessage("invalid"); return; }
    if (!paymentRef.current?.validate()) return;
    paymentRef.current.clear();
    setPhase("processing");
    processingTimer.current = window.setTimeout(() => { processingTimer.current = null; setPhase("success"); }, 1500);
  };
  if (!meetsMinimum(subtotal)) return <div className="p-10 text-center">Your cart is below the $500 minimum. <Link to="/cart" className="text-primary underline">Return to cart</Link></div>;
  return (
    <form className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-3" onSubmit={submitDemo}>
      <section className="min-w-0 rounded bg-card p-5">
        <H n={1} t="Billing Address" />
        <div className="grid grid-cols-2 gap-3"><F label="First Name" /><F label="Last Name" /></div>
        <div className="mt-3 space-y-3"><F label="Company" req={false} /><F label="Email" type="email" /><F label="Telephone" type="tel" numericOnly /><F label="Address" /><F label="City" />
          <div className="grid grid-cols-2 gap-3"><F label="State" /><F label="Zip" numericOnly /></div>
          <label className="block text-sm">Country *<select className="mt-1 w-full rounded border p-2"><option>United States</option></select></label>
          <label className="block text-sm">Sales Representative *<select className="mt-1 w-full rounded border p-2"><option>Web Customer</option></select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={same} onChange={(e) => setSame(e.target.checked)} /> Ship to the same address</label>
          {!same && <div className="space-y-3 border-t pt-3"><F label="Shipping Address" /><F label="City" /><F label="Zip" numericOnly /></div>}
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
        <div className="mt-3"><div className="flex gap-[15px]">
          <input aria-label="Coupon code" placeholder="Coupon code" value={coupon} onChange={e => { setCoupon(e.target.value); setCouponMessage(null); }} className="min-w-0 flex-1 rounded border p-2" />
          <button type="button" onClick={() => setCouponMessage(isValidDemoCoupon(coupon) ? "valid" : "invalid")} className="rounded bg-primary px-3 font-semibold text-primary-foreground">Apply</button>
        </div>
        <DemoCouponFeedback message={couponMessage === "invalid" ? INVALID_COUPON_MESSAGE : couponMessage === "valid" ? DEMO_COUPON_SUCCESS_MESSAGE : ""} /></div>
        <textarea placeholder="Comments" className="mt-[15px] w-full rounded border p-2" rows={3} />
        <button ref={submitRef} type="submit" disabled={phase !== "idle"} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">{phase === "processing" ? <><LoaderCircle size={19} className="motion-safe:animate-spin" aria-hidden="true" />Processing your order...</> : <>Place Your Order <ChevronRight size={18} aria-hidden="true" /></>}</button>
      </section>
      <Dialog open={phase !== "idle"} onOpenChange={open => { if (!open && phase === "success") setPhase("idle"); }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-primary/10 bg-white p-7 text-center shadow-2xl sm:p-9" onCloseAutoFocus={event => { event.preventDefault(); submitRef.current?.focus(); }} onEscapeKeyDown={event => { if (phase === "processing") event.preventDefault(); }} onPointerDownOutside={event => { if (phase === "processing") event.preventDefault(); }}>
          {phase === "processing" ? <div className="space-y-5 py-5" role="status" aria-live="polite">
            <div className="relative mx-auto grid h-24 w-24 place-items-center">
              <span className="absolute inset-0 rounded-full border-[5px] border-primary/10" />
              <span className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-primary border-r-primary/60 motion-safe:animate-spin" />
              <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary"><LoaderCircle className="h-8 w-8 motion-safe:animate-pulse" aria-hidden="true" /></span>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-primary">Processing your order...</DialogTitle>
            <DialogDescription className="leading-relaxed">Demo checkout in progress. No real payment or order is being processed.</DialogDescription>
          </div> : <div className="space-y-5 py-3 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 duration-500">
            <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
              <CheckCircle2 size={56} strokeWidth={1.8} className="motion-safe:animate-in motion-safe:zoom-in-50 duration-500" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <DialogTitle className="text-2xl font-bold leading-tight tracking-tight text-primary">Thank You for Your Purchase!</DialogTitle>
              <DialogDescription className="text-base leading-relaxed">Your order experience is complete. Thank you for exploring Artisan Mart!</DialogDescription>
            </div>
            <p className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-medium leading-relaxed text-primary">Demo confirmation only. No real order was placed and no payment was processed.</p>
            <button type="button" onClick={() => setPhase("idle")} className="min-h-12 w-full rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Return to checkout</button>
          </div>}
        </DialogContent>
      </Dialog>
    </form>
  );
}
