import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

/** Stable cart navigation with an item count. */
export function MiniCart() {
  const { lines } = useCart();
  const count = lines.reduce((sum, line) => sum + line.pieces, 0);
  return <Link to="/cart" className="store-cart-button" aria-label={`Shopping cart, ${count} items`}>
    <span className="store-cart-icon"><span aria-hidden="true" className="store-cart-artwork"/><b>{count}</b></span>
    <span>Cart</span>
  </Link>;
}
