import type { PurchaseRules } from "@/data/catalog";

export const ORDER_MINIMUM = 500;
export type BuyMode = "piece" | "case";

/** Round a typed piece quantity up to a valid lot multiple, never below MOQ. */
export function normalizePieces(qty: number, r: PurchaseRules): number {
  const q = Math.max(qty || 0, r.moq);
  return Math.ceil(q / r.lot) * r.lot;
}
export const stepUp = (pieces: number, r: PurchaseRules) => normalizePieces(pieces + r.lot, r);
export const stepDown = (pieces: number, r: PurchaseRules) => normalizePieces(pieces - r.lot, r);
export const casesToPieces = (cases: number, r: PurchaseRules) => Math.max(1, Math.floor(cases || 1)) * r.caseQty;
export const lineTotal = (pieces: number, price: number) => Math.round(pieces * price * 100) / 100;
export const meetsMinimum = (subtotal: number) => subtotal >= ORDER_MINIMUM;
export const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
