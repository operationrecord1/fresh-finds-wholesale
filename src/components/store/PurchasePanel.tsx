import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/catalog";
import { casesToPieces, lineTotal, money, normalizePieces, stepDown, stepUp, type BuyMode } from "@/lib/wholesale";
import { useCart } from "@/lib/cart";

// Layout mirrors Kole Imports PDP/Quick View: two boxed options (Order By Case / Order By Piece),
// blue full-width ADD TO CART, then "$price x N Pieces = $total".
export function PurchasePanel({ p, initialPieces, onDone, label = "Add To Cart", compact = false }: { p: Product; initialPieces?: number | undefined; onDone?: () => void; label?: string; compact?: boolean }) {
  const r = p.rules;
  const { add, set } = useCart();
  const [mode, setMode] = useState<BuyMode>("piece");
  const [pieces, setPieces] = useState(r ? normalizePieces(initialPieces ?? 0, r) : 0);
  const [cases, setCases] = useState(1);
  const [busy, setBusy] = useState(false);

  if (!r || p.price == null) {
    return <div className="rounded-md border border-dashed border-border bg-muted p-4 text-sm">Purchasing is unavailable: this item's price, lot size or minimum quantity has not been verified from the supplier source yet.</div>;
  }
  const qty = mode === "piece" ? pieces : casesToPieces(cases, r);
  const total = lineTotal(qty, p.price);
  const submit = () => {
    setBusy(true);
    setTimeout(() => {
      if (initialPieces != null) set(p.sku, qty); else add(p.sku, qty);
      setBusy(false); toast.success(`${p.sku} ${initialPieces != null ? "updated" : "added to cart"} (${qty} pcs)`); onDone?.();
    }, 400);
  };

  const Stepper = ({ m, value, unit }: { m: BuyMode; value: number; unit: string }) => (
    <div className="flex flex-col items-center">
      <div className="flex h-10 overflow-hidden rounded">
        <button type="button" aria-label={`Decrease ${unit}`} className="bg-primary px-2 text-primary-foreground" onClick={() => { setMode(m); m === "piece" ? setPieces(stepDown(pieces, r)) : setCases(Math.max(1, cases - 1)); }}><Minus className="h-5 w-5" /></button>
        <input aria-label={`${unit} quantity`} inputMode="numeric" className="w-16 border-y border-primary bg-card text-center" value={mode === m ? value : ""}
          onFocus={() => setMode(m)}
          onChange={(e) => m === "piece" ? setPieces(Number(e.target.value.replace(/\D/g, "")) || 0) : setCases(Number(e.target.value.replace(/\D/g, "")) || 1)}
          onBlur={() => m === "piece" && setPieces(normalizePieces(pieces, r))} />
        <button type="button" aria-label={`Increase ${unit}`} className="bg-primary px-2 text-primary-foreground" onClick={() => { setMode(m); m === "piece" ? setPieces(stepUp(pieces, r)) : setCases(cases + 1); }}><Plus className="h-5 w-5" /></button>
      </div>
      <span className="mt-1 text-xs uppercase">{unit}</span>
    </div>
  );
  const Opt = ({ m, title, sub, children }: { m: BuyMode; title: string; sub: string; children: React.ReactNode }) => (
    <div className={`flex flex-1 items-center justify-between gap-2 rounded border-2 p-2 ${mode === m ? "border-primary" : "border-border"}`}>
      <label className="flex cursor-pointer items-center gap-2"><input type="radio" checked={mode === m} onChange={() => setMode(m)} className="h-5 w-5" />
        <span><span className="block font-semibold">{title}</span><span className="block text-xs">{sub}</span></span></label>
      {children}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className={`flex gap-3 ${compact ? "flex-col" : "flex-col sm:flex-row"}`}>
        <Opt m="case" title="Order By Case" sub={`${r.caseQty} (Pieces)`}><Stepper m="case" value={cases} unit="Case" /></Opt>
        <Opt m="piece" title="Order By Piece" sub={`${r.moq} Pieces Minimum`}><Stepper m="piece" value={pieces} unit="Pieces" /></Opt>
      </div>
      <button type="button" disabled={busy || (p.stock != null && qty > p.stock)} onClick={submit} className="w-full rounded-full bg-primary py-2 font-display text-2xl font-bold uppercase text-primary-foreground disabled:opacity-60">
        {busy ? "Please Wait..." : label}
      </button>
      <div className="text-center text-xl font-semibold">{money(p.price)} x {qty} Pieces = {money(total)}</div>
    </div>
  );
}
