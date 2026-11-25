import type { CartLine } from "@/lib/cart";

const KEY = "artisan-mart-pending-checkout-cart";
const CONTINUE = "artisan-mart-return-to-checkout";
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

export function preserveCartForCheckout(lines: CartLine[]) {
  if (typeof window === "undefined" || !lines.length) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), lines }));
    sessionStorage.setItem(CONTINUE,"yes");
  } catch { /* Browsing still works if storage is unavailable. */ }
}

export function loadCheckoutCart(): CartLine[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const item: unknown = JSON.parse(raw);
    if (!item || typeof item !== "object") return null;
    const { savedAt, lines } = item as { savedAt?: unknown; lines?: unknown };
    if (typeof savedAt !== "number" || Date.now() - savedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY); return null;
    }
    return Array.isArray(lines) ? lines as CartLine[] : null;
  } catch { return null; }
}

export function checkoutReturnRequested(): boolean {
  if (typeof window === "undefined") return false;
  try { return sessionStorage.getItem(CONTINUE) === "yes" || !!loadCheckoutCart(); }
  catch { return false; }
}

export function consumeCheckoutReturn(): boolean {
  if (!checkoutReturnRequested()) return false;
  try { sessionStorage.removeItem(CONTINUE); } catch {}
  return true;
}

/** Keep only an explicitly saved checkout cart in sync with later guest changes. */
export function synchronizeCheckoutCart(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(KEY) === null) return;
    if (!lines.length) {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(CONTINUE);
    } else {
      localStorage.setItem(KEY,JSON.stringify({savedAt:Date.now(),lines}));
    }
  } catch { /* If persistent storage is disabled, the session cart remains active. */ }
}
