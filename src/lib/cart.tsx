import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getProduct } from "@/data/catalog";
import { lineTotal, type BuyMode } from "./wholesale";
import { CartConfirmation } from "@/components/store/CartConfirmation";
import { toast } from "sonner";

export interface CartLine { sku: string; pieces: number; mode?: BuyMode }
interface CartCtx {
  lines: CartLine[]; subtotal: number;
  add: (sku: string, pieces: number, mode?: BuyMode) => void; set: (sku: string, pieces: number, mode?: BuyMode) => void;
  remove: (sku: string) => void; clear: () => void;
  requestRemove: (sku: string) => void; requestClear: () => void;
}
const Ctx = createContext<CartCtx | null>(null);
const KEY = "artisan-mart-cart";

// Session-only cart (frontend). Firebase persistence will replace this later.
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [confirmation, setConfirmation] = useState<{sku?: string; title?: string} | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(KEY) || "[]");
      if (!Array.isArray(stored)) return;
      const valid = new Map<string, CartLine>();
      for (const line of stored) {
        if (!line || typeof line.sku !== "string" || !getProduct(line.sku) || !Number.isSafeInteger(line.pieces) || line.pieces <= 0) continue;
        const old = valid.get(line.sku);
        const pieces = (old?.pieces ?? 0) + line.pieces;
        if (Number.isSafeInteger(pieces)) valid.set(line.sku, {sku: line.sku, pieces, mode: line.mode === "case" ? "case" : "piece"});
      }
      setLines([...valid.values()]);
    } catch { /* A corrupt or blocked session must not break browsing. */ }
  }, []);
  const ask = (action: {sku?: string; title?: string}) => {
    returnFocus.current = document.activeElement as HTMLElement;
    setConfirmation(action);
  };
  const dismiss = () => {
    setConfirmation(null);
    requestAnimationFrame(() => { if (returnFocus.current?.isConnected) returnFocus.current.focus(); else document.querySelector<HTMLButtonElement>('[aria-controls="cart-preview"]')?.focus(); });
  };
  const save = (update: (previous: CartLine[]) => CartLine[]) => setLines(previous => { const next = update(previous); try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Keep the in-memory cart usable if storage is unavailable. */ } return next; });
  const subtotal = lines.reduce((s, l) => s + lineTotal(l.pieces, getProduct(l.sku)?.price ?? 0), 0);
  return (
    <Ctx.Provider value={{
      lines, subtotal: Math.round(subtotal * 100) / 100,
      add: (sku, pieces, mode = "piece") => save(previous => previous.some(l => l.sku === sku) ? previous.map(l => l.sku === sku ? { ...l, pieces: l.pieces + pieces, mode: l.mode === mode ? mode : "piece" } : l) : [...previous, { sku, pieces, mode }]),
      set: (sku, pieces, mode = "piece") => save(previous => previous.map((l) => (l.sku === sku ? { ...l, pieces, mode } : l))),
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
