import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { CreditCard, Landmark } from "lucide-react";
import { Link } from "@tanstack/react-router";
import "./PaymentDetails.css";

export type PaymentDetailsHandle = { validate: () => boolean; clear: () => void };
/** Length checks for demo card examples only; logos never change based on entered digits. */
export function isSupportedDemoCardLength(digits: string): boolean {
  if (/^4/.test(digits)) return [13, 16, 19].includes(digits.length);
  if (/^3[47]/.test(digits)) return digits.length === 15;
  const firstFour = Number(digits.slice(0, 4));
  if (/^5[1-5]/.test(digits) || (firstFour >= 2221 && firstFour <= 2720)) return digits.length === 16;
  return false;
}

export function cardError(number: string, expiry: string, cvv: string, now = new Date()) {
  const digits = number.replace(/\D/g, "");
  let sum = 0;
  [...digits].reverse().forEach((c, i) => { let n = Number(c); if (i % 2) { n *= 2; if (n > 9) n -= 9; } sum += n; });
  const [month = Number.NaN, year = Number.NaN] = expiry.split("/").map(Number);
  return {
    number: !isSupportedDemoCardLength(digits) || /^0+$/.test(digits) || sum % 10 !== 0 ? "Enter a valid card number." : "",
    expiry: !/^\d{2}\/\d{2}$/.test(expiry) || month < 1 || month > 12 || new Date(2000 + year, month) <= now ? "Enter a valid, unexpired date (MM/YY)." : "",
    cvv: !( /^3[47]/.test(digits) ? /^\d{4}$/ : /^\d{3}$/ ).test(cvv) ? (/^3[47]/.test(digits) ? "Enter the 4-digit security code." : "Enter the 3-digit security code.") : "",
  };
}

// Payment values exist only in these uncontrolled DOM inputs. No storage, logging,
// requests, form names, or payment SDKs. Never put these values in the cart.
export const PaymentDetails = forwardRef<PaymentDetailsHandle, { method: string }>(function PaymentDetails({ method }, ref) {
  const panel = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const value = (id: string) => panel.current?.querySelector<HTMLInputElement>(`#${id}`)?.value ?? "";
  const clear = () => {
    panel.current?.querySelectorAll<HTMLInputElement>("input").forEach(input => { input.value = ""; });
    setErrors({});
  };
  useImperativeHandle(ref, () => ({ clear, validate: () => {
    const next = method === "card" ? { holder: value("holder").trim() ? "" : "Enter the name on your card.", ...cardError(value("number"), value("expiry"), value("cvv")) } : {};
    setErrors(next);
    const first = Object.keys(next).find(key => next[key as keyof typeof next]);
    if (first) panel.current?.querySelector<HTMLInputElement>(`#${first}`)?.focus();
    return !first;
  }}));
  useEffect(() => {
    const clearDom = () => panel.current?.querySelectorAll<HTMLInputElement>("input").forEach(input => { input.value = ""; });
    const clearAndHide = () => { clearDom(); };
    const onHidden = () => { if (document.visibilityState === "hidden") clearAndHide(); };
    window.addEventListener("pagehide", clearAndHide);
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("beforeprint", clearAndHide);
    return () => { clearDom(); window.removeEventListener("pagehide", clearAndHide); document.removeEventListener("visibilitychange", onHidden); window.removeEventListener("beforeprint", clearAndHide); };
  }, []);
  const field = (id: string, label: string, options: { placeholder?: string; numeric?: boolean; max?: number; secret?: boolean } = {}) => {
    const input = <input
      id={id}
      aria-label={label}
      type={options.secret ? "password" : "text"}
      autoComplete="off"
      inputMode={options.numeric ? "numeric" : "text"}
      maxLength={options.max}
      placeholder={options.placeholder}
      aria-invalid={!!errors[id]}
      aria-describedby={errors[id] ? id + "-error" : undefined}
      className={"min-h-11 w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-base font-normal outline-none transition-shadow focus:ring-2 focus:ring-primary/30 " + (id === "number" ? "payment-number-input " : "mt-2 ") + (errors[id] ? "border-red-600" : "border-border focus:border-primary")}
      onChange={e => {
        if (id === "number") {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
          e.target.value = digits.replace(/(.{4})/g, "$1 ").trim();
        }
        if (id === "expiry") { const d = e.target.value.replace(/\D/g, "").slice(0, 4); e.target.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; }
        if (id === "cvv") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
        if (errors[id]) setErrors(previous => ({ ...previous, [id]: "" }));
      }}
    />;
    return <label className="block min-w-0 text-sm font-medium" htmlFor={id}>
      {label}
      {id === "number" ? <span className="payment-number-field">
        {input}
        <span className="payment-number-brands" aria-label="Supported card brands">
          <img src={`${import.meta.env.BASE_URL}images/payment/visa.svg`} alt="Visa" width={32} height={21} className="payment-brand-badge" />
          <img src={`${import.meta.env.BASE_URL}images/payment/mastercard.svg`} alt="Mastercard" width={32} height={21} className="payment-brand-badge" />
          <img src={`${import.meta.env.BASE_URL}images/payment/amex.svg`} alt="American Express" width={32} height={21} className="payment-brand-badge" />
        </span>
      </span> : input}
      {errors[id] && <span id={id + "-error"} role="alert" className="mt-1 block text-xs font-normal text-red-700">{errors[id]}</span>}
    </label>;
  };
  return <div ref={panel} className={`mt-4 rounded-xl border border-border p-4 print:hidden ${method === "card" ? "bg-white" : "bg-muted/20"}`} data-payment-details>
    {method === "card" ? <>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><CreditCard size={18} aria-hidden="true"/>Card details</h3>
      <div className="space-y-4">{field("holder","Name on card",{max:100})}{field("number","Card number",{numeric:true,max:23,placeholder:"Card number"})}<div className="grid grid-cols-2 gap-3">{field("expiry","Expiry date",{numeric:true,max:5,placeholder:"MM/YY"})}{field("cvv","Security code",{numeric:true,max:4,secret:true,placeholder:"CVV"})}</div></div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Use the billing address entered in step 1. Demo only: use test card details. No payment information is submitted or stored.</p>
    </> : <>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Landmark size={18} aria-hidden="true"/>Bank transfer instructions</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">Contact our team for verified beneficiary, account and routing details before arranging a transfer.</p>
      <Link to="/contact" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4">Request bank instructions</Link>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Arrange the transfer through your bank. Do not enter bank passwords or PINs here.</p>
    </>}
  </div>;
});
