import { useId, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/catalog";
import { lineTotal, money, maximumQuantity, normalizePieces, stepDown, stepUp, validateQuantity, type BuyMode } from "@/lib/wholesale";
import { useCart } from "@/lib/cart";
import { useLiveProduct } from "@/lib/artisan-stock";
import "./ProductCommerce.css";

export function PurchasePanel({ p, initialPieces, onDone, label = "Add To Cart", compact = false }: { p: Product; initialPieces?: number | undefined; onDone?: () => void; label?: string; compact?: boolean }) {
  p=useLiveProduct(p);
  const r = p.rules;
  const { add, set, lines } = useCart();
  const id = useId();
  const existing = initialPieces == null ? lines.find(l => l.sku === p.sku)?.pieces ?? 0 : 0;
  const limit = (value: number, mode: BuyMode) => Math.min(value, r ? maximumQuantity(mode, r, p.stock, existing) ?? Number.MAX_SAFE_INTEGER : 0);
  const [mode, setMode] = useState<BuyMode>(initialPieces != null && r && initialPieces % r.caseQty === 0 && (lines.find(l => l.sku === p.sku)?.mode === "case" || initialPieces % r.lot !== 0) ? "case" : "piece");
  const [pieces, setPieces] = useState(String(limit(initialPieces ?? (r ? normalizePieces(0, r) : 0), "piece")));
  const [cases, setCases] = useState(String(limit(initialPieces != null && r && initialPieces % r.caseQty === 0 ? initialPieces / r.caseQty : 1, "case")));
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  if (!r || p.price == null) return <p className="purchase-unavailable">Purchasing is unavailable until the price and order quantities are verified.</p>;
  if (p.stock === 0) return <p className="purchase-unavailable" role="status">Currently out of stock.</p>;
  const pieceValue = pieces === "" ? "" : String(limit(Number(pieces), "piece"));
  const caseValue = cases === "" ? "" : String(limit(Number(cases), "case"));
  const value = Number(mode === "piece" ? pieceValue : caseValue);
  const qty = mode === "piece" ? value : value * r.caseQty;
  const error = validateQuantity(value, mode, r, p.stock, existing);
  const choose = (next: BuyMode) => {
    if (next === mode) return;
    if (next === "case") setCases(String(limit(Math.max(1, Math.ceil(Number(pieceValue) / r.caseQty)), "case")));
    else setPieces(String(limit(normalizePieces(Number(caseValue) * r.caseQty, r), "piece")));
    setMode(next); setSubmitted(false);
  };
  const submit = () => {
    setSubmitted(true);
    if (error || submitting.current) return;
    submitting.current = true; setBusy(true);
    // Allow the pending state to paint before committing the local cart action.
    requestAnimationFrame(() => {
      try {
        const accepted = initialPieces != null ? set(p.sku, qty, mode) : add(p.sku, qty, mode);
        if (accepted === false) { toast.error("The requested quantity is no longer available."); return; }
        toast.success(`${p.sku} ${initialPieces != null ? "updated" : "added to cart"} (${qty} pcs)`);
        onDone?.();
      } finally { submitting.current = false; setBusy(false); }
    });
  };
  return <div className={`purchase-panel ${compact ? "purchase-compact" : ""}`} aria-busy={busy}>
    {compact && <p className="purchase-lot">*Sold in Lots of {r.lot}</p>}
    <div className="purchase-options">
      {(["case", "piece"] as const).map(m => {
        const current = m === "piece" ? Number(pieceValue) : Number(caseValue);
        const update = (next: number) => { setMode(m); m === "piece" ? setPieces(String(limit(next, m))) : setCases(String(limit(next, m))); setSubmitted(false); };
        const minimum = m === "piece" ? normalizePieces(0, r) : 1;
        const next = m === "piece" ? stepUp(current, r) : current + 1;
        const maximumReached = p.stock != null && (m === "piece" ? next : next * r.caseQty) + existing > p.stock;
        return <div key={m} className={`purchase-option ${mode === m ? "is-selected" : ""}`}>
          <label><input type="radio" name={id} checked={mode === m} onChange={() => choose(m)} disabled={busy}/><span><strong>{m === "case" ? "Order By Case" : compact ? "Piece Quantity" : "Order By Piece"}</strong><small>{m === "case" ? `${r.caseQty} (Pieces)` : `${r.moq} Pieces Minimum`}</small></span></label>
          <div className="purchase-stepper">
            <div>
              <button type="button" aria-label={`Decrease ${m}`} disabled={busy || current <= minimum} onClick={() => update(m === "piece" ? stepDown(current, r) : Math.max(1, current - 1))}><Minus size={20}/></button>
              <input aria-label={`${m === "piece" ? "Pieces" : "Case"} quantity`} aria-invalid={mode === m && !!error} aria-describedby={mode === m && error ? id + "-error" : undefined} inputMode="numeric" pattern="[0-9]*" max={maximumQuantity(m, r, p.stock, existing)} disabled={busy} value={mode === m ? (m === "piece" ? pieceValue : caseValue) : ""} onFocus={() => setMode(m)} onChange={e => { const raw = e.target.value.replace(/\D/g, ""); const bounded = raw === "" ? "" : String(limit(Number(raw), m)); m === "piece" ? setPieces(bounded) : setCases(bounded); setSubmitted(false); }}/>
              <button type="button" aria-label={`Increase ${m}`} disabled={busy || maximumReached} onClick={() => update(next)}><Plus size={20}/></button>
            </div>
            <small>{m === "piece" ? "PIECES" : "CASE"}</small>
          </div>
        </div>;
      })}
    </div>
    {error && <p id={id + "-error"} role={submitted ? "alert" : "status"} className="purchase-error">{error}</p>}
    <button type="button" className="purchase-submit" disabled={busy} onClick={submit}>{busy ? "Please Wait..." : label}</button>
    <div className="purchase-total" aria-live="polite">{compact ? `${Number.isFinite(qty) ? qty : 0} pieces x ${money(p.price)}` : `${money(p.price)} x ${Number.isFinite(qty) ? qty : 0} Pieces`} = {money(lineTotal(Number.isFinite(qty) ? qty : 0, p.price))}</div>
  </div>;
}
