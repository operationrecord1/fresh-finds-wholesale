import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

/** Stable cart navigation with an item count. */
export function MiniCart() {
  const { lines } = useCart();
  const count = lines.reduce((sum, line) => sum + line.pieces, 0);
  return <Link to="/cart" className="store-cart-button" aria-label={`Shopping cart, ${count} items`}>
    <span className="store-cart-icon"><svg aria-hidden="true" viewBox="0 0 40 36" fill="none"><path d="M2 8h7l8 17h14l7-13" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/><circle cx="17" cy="31" r="2.5" fill="currentColor"/><circle cx="31" cy="31" r="2.5" fill="currentColor"/></svg><b>{count}</b></span>
    <span>Cart</span>
  </Link>;
}
