import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getProduct } from "@/data/catalog";
import { lineTotal, maximumQuantity, validateQuantity, type BuyMode } from "./wholesale";
import { CartConfirmation } from "@/components/store/CartConfirmation";
import { toast } from "sonner";
import { loadCheckoutCart } from "@/lib/artisan-checkout-intent";

export interface CartLine { sku: string; pieces: number; mode?: BuyMode }
interface CartCtx {
  lines: CartLine[]; subtotal: number; ready: boolean;
  add: (sku: string, pieces: number, mode?: BuyMode) => boolean; set: (sku: string, pieces: number, mode?: BuyMode) => boolean;
  remove: (sku: string) => void; clear: () => void;
  requestRemove: (sku: string) => void; requestClear: () => void;
}
const Ctx = createContext<CartCtx | null>(null);
const KEY = "artisan-mart-cart";

// Session-only cart (frontend). Firebase persistence will replace this later.
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const linesRef = useRef<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [confirmation, setConfirmation] = useState<{sku?: string; title?: string} | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    try {
      const sessionValue = sessionStorage.getItem(KEY);
      const stored: unknown = sessionValue && sessionValue !== "[]"
        ? JSON.parse(sessionValue)
        : loadCheckoutCart() ?? [];
      if (!Array.isArray(stored)) return;
      const valid = new Map<string, CartLine>();
      for (const line of stored) {
        if (!line || typeof line.sku !== "string" || !getProduct(line.sku) || !Number.isSafeInteger(line.pieces) || line.pieces <= 0) continue;
        const p = getProduct(line.sku)!;
        const old = valid.get(line.sku);
        let pieces = (old?.pieces ?? 0) + line.pieces;
        const mode: BuyMode = line.mode === "case" ? "case" : "piece";
        if (!Number.isSafeInteger(pieces)) continue;
        if (p.stock != null && pieces > p.stock) {
          const units = p.rules ? maximumQuantity(mode, p.rules, p.stock) ?? 0 : 0;
          pieces = mode === "case" && p.rules ? units * p.rules.caseQty : units;
        }
        if (pieces > 0) valid.set(line.sku, { sku: line.sku, pieces, mode });
      }
      linesRef.current = [...valid.values()];
      setLines(linesRef.current);
      sessionStorage.setItem(KEY, JSON.stringify(linesRef.current));
    } catch { /* A corrupt or blocked session must not break browsing. */ }
    finally { setReady(true); }
  }, []);
  const ask = (action: {sku?: string; title?: string}) => {
    returnFocus.current = document.activeElement as HTMLElement;
    setConfirmation(action);
  };
  const dismiss = () => {
    setConfirmation(null);
    requestAnimationFrame(() => { if (returnFocus.current?.isConnected) returnFocus.current.focus(); else document.querySelector<HTMLButtonElement>('[aria-controls="cart-preview"]')?.focus(); });
  };
  // Update the ref synchronously so repeated/batched adds cannot use stale quantities.
  const save = (update: (previous: CartLine[]) => CartLine[]) => {
    const next = update(linesRef.current);
    linesRef.current = next;
    setLines(next);
    try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Keep the in-memory cart usable if storage is unavailable. */ }
  };
  const validChange = (sku: string, pieces: number, mode: BuyMode, existing: number) => {
    const p = getProduct(sku);
    if (!p?.rules || p.price == null || !Number.isSafeInteger(pieces) || pieces <= 0) return false;
    const value = mode === "case" ? pieces / p.rules.caseQty : pieces;
    return validateQuantity(value, mode, p.rules, p.stock, existing) === null;
  };
  const subtotal = lines.reduce((s, l) => s + lineTotal(l.pieces, getProduct(l.sku)?.price ?? 0), 0);
  return (
    <Ctx.Provider value={{
      lines, ready, subtotal: Math.round(subtotal * 100) / 100,
      add: (sku, pieces, mode = "piece") => {
        const existing = linesRef.current.find(l => l.sku === sku)?.pieces ?? 0;
        if (!validChange(sku, pieces, mode, existing)) return false;
        save(previous => previous.some(l => l.sku === sku) ? previous.map(l => l.sku === sku ? { ...l, pieces: l.pieces + pieces, mode: l.mode === mode ? mode : "piece" } : l) : [...previous, { sku, pieces, mode }]);
        return true;
      },
      set: (sku, pieces, mode = "piece") => {
        if (!linesRef.current.some(l => l.sku === sku) || !validChange(sku, pieces, mode, 0)) return false;
        save(previous => previous.map(l => l.sku === sku ? { ...l, pieces, mode } : l));
        return true;
      },
      remove: (sku) => save(previous => previous.filter((l) => l.sku !== sku)),
      clear: () => save(() => []),
      requestRemove: sku => ask({sku, title: getProduct(sku)?.title ?? sku}),
      requestClear: () => { if (lines.length) ask({}); },
    }}>{children}<CartConfirmation action={confirmation} onCancel={dismiss} onConfirm={() => {
      if (!confirmation) return;
      save(previous => confirmation.sku ? previous.filter(l => l.sku !== confirmation.sku) : []);
      toast.success(confirmation.sku ? "Item removed from your cart." : "Your cart has been cleared.");
      dismiss();
    }} /></Ctx.Provider>
  );
}
export const useCart = () => { const c = useContext(Ctx); if (!c) throw new Error("CartProvider missing"); return c; };

/** Do not flash an empty cart or a partial page while session state is restored. */
export function CartReady({ children }: { children: ReactNode }) {
  return useCart().ready ? children : null;
}
