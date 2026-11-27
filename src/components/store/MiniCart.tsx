import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

/** Stable cart navigation with an item count. */
export function MiniCart() {
  const { lines } = useCart();
  const count = lines.reduce((sum, line) => sum + line.pieces, 0);
  return <Link to="/cart" className="store-cart-button" aria-label={`Shopping cart, ${count} items`}>
    <span className="store-cart-icon"><svg aria-hidden="true" viewBox="0 0 40 36" fill="none"><path d="M2 5h5l4 22h23M9 11h29l-4 12H11" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round"/><circle cx="14" cy="32" r="2.5" fill="currentColor"/><circle cx="31" cy="32" r="2.5" fill="currentColor"/></svg><b>{count}</b></span>
    <span>Cart</span>
  </Link>;
}
