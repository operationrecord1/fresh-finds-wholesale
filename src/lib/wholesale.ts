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

/** Maximum selectable units, respecting the existing piece lot or purchasing case. */
export function maximumQuantity(mode: BuyMode, r: PurchaseRules, stock: number | null, existing = 0): number | undefined {
  if (stock == null) return undefined;
  const remaining = Math.max(0, stock - existing);
  const maximum = mode === "case" ? Math.floor(remaining / r.caseQty) : Math.floor(remaining / r.lot) * r.lot;
  return mode === "piece" && maximum < r.moq ? 0 : maximum;
}

/** Validate purchase input without silently changing the customer's quantity. */
export function validateQuantity(value: number, mode: BuyMode, r: PurchaseRules, stock: number | null, existing = 0): string | null {
  if (!Number.isSafeInteger(value) || value <= 0) return "Enter a whole quantity greater than zero.";
  const pieces = mode === "case" ? value * r.caseQty : value;
  if (!Number.isSafeInteger(pieces) || !Number.isSafeInteger(pieces + existing)) return "Enter a whole quantity within the available stock.";
  if (mode === "piece" && pieces < r.moq) return `Minimum order is ${r.moq} pieces.`;
  if (mode === "piece" && pieces % r.lot !== 0) {
    const lower = Math.max(normalizePieces(0, r), Math.floor(pieces / r.lot) * r.lot);
    return `Order in lots of ${r.lot}. Choose ${lower} or ${lower + r.lot} pieces.`;
  }
  if (stock != null && pieces + existing > stock) {
    const increment = mode === "case" ? r.caseQty : r.lot;
    const available = Math.max(0, Math.floor((stock - existing) / increment) * increment);
    return `Maximum available for this order is ${available} pieces${existing ? " after items already in your cart" : ""}.`;
  }
  return null;
}
