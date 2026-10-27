import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/catalog";
import { casesToPieces, lineTotal, money, normalizePieces, stepDown, stepUp, type BuyMode } from "@/lib/wholesale";
import { useCart } from "@/lib/cart";

export function PurchasePanel({ p, initialPieces, onDone, label = "Add To Cart" }: { p: Product; initialPieces?: number | undefined; onDone?: () => void; label?: string }) {
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

  return (
    <div className="space-y-4">
      <p className="rounded bg-muted px-3 py-2 text-sm">This item is sold in lots of <b>{r.lot}</b>. Minimum quantity: <b>{r.moq}</b>.</p>
      <div className="flex gap-6">
        <label className="flex items-center gap-2"><input type="radio" checked={mode === "piece"} onChange={() => setMode("piece")} /> Piece ({money(p.price)})</label>
        <label className="flex items-center gap-2"><input type="radio" checked={mode === "case"} onChange={() => setMode("case")} /> Case of {r.caseQty} ({money(lineTotal(r.caseQty, p.price))})</label>
      </div>
      <div className="flex items-center gap-3">
        <button aria-label="Decrease" className="rounded-full border p-2" onClick={() => mode === "piece" ? setPieces(stepDown(pieces, r)) : setCases(Math.max(1, cases - 1))}><Minus className="h-4 w-4" /></button>
        <input aria-label="Quantity" className="w-24 rounded border px-2 py-1 text-center" value={mode === "piece" ? pieces : cases}
          onChange={(e) => mode === "piece" ? setPieces(Number(e.target.value) || 0) : setCases(Number(e.target.value) || 1)}
          onBlur={() => mode === "piece" && setPieces(normalizePieces(pieces, r))} />
        <button aria-label="Increase" className="rounded-full border p-2" onClick={() => mode === "piece" ? setPieces(stepUp(pieces, r)) : setCases(cases + 1)}><Plus className="h-4 w-4" /></button>
        <span className="text-sm text-muted-foreground">{mode === "case" ? `${cases} case(s) = ${qty} pieces` : "pieces"}</span>
      </div>
      <div className="text-xl font-bold text-price">Total: {money(total)}</div>
      <button disabled={busy || (p.stock != null && qty > p.stock)} onClick={submit} className="w-full rounded-full bg-primary py-3 text-lg font-bold text-primary-foreground disabled:opacity-60">
        {busy ? "Please Wait..." : label}
      </button>
    </div>
  );
}
