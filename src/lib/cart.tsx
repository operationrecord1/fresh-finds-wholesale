import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getProduct } from "@/data/catalog";
import { lineTotal } from "./wholesale";

export interface CartLine { sku: string; pieces: number }
interface CartCtx {
  lines: CartLine[]; subtotal: number;
  add: (sku: string, pieces: number) => void; set: (sku: string, pieces: number) => void;
  remove: (sku: string) => void; clear: () => void;
}
const Ctx = createContext<CartCtx | null>(null);
const KEY = "artisan-mart-cart";

// Session-only cart (frontend). Firebase persistence will replace this later.
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => { try { setLines(JSON.parse(sessionStorage.getItem(KEY) || "[]")); } catch { /* ignore */ } }, []);
  const save = (l: CartLine[]) => { setLines(l); sessionStorage.setItem(KEY, JSON.stringify(l)); };
  const subtotal = lines.reduce((s, l) => s + lineTotal(l.pieces, getProduct(l.sku)?.price ?? 0), 0);
  return (
    <Ctx.Provider value={{
      lines, subtotal: Math.round(subtotal * 100) / 100,
      add: (sku, pieces) => { const ex = lines.find((l) => l.sku === sku); save(ex ? lines.map((l) => l.sku === sku ? { ...l, pieces: l.pieces + pieces } : l) : [...lines, { sku, pieces }]); },
      set: (sku, pieces) => save(lines.map((l) => (l.sku === sku ? { ...l, pieces } : l))),
      remove: (sku) => save(lines.filter((l) => l.sku !== sku)),
      clear: () => save([]),
    }}>{children}</Ctx.Provider>
  );
}
export const useCart = () => { const c = useContext(Ctx); if (!c) throw new Error("CartProvider missing"); return c; };
