import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

/** Stable cart navigation with an item count. */
export function MiniCart() {
  const { lines } = useCart();
  const count = lines.reduce((sum, line) => sum + line.pieces, 0);
  return <Link to="/cart" className="store-cart-button" aria-label={`Shopping cart, ${count} items`}>
    <span className="store-cart-icon"><ShoppingCart aria-hidden="true" /><b>{count > 99 ? "99+" : count}</b></span>
    <span>Cart</span>
  </Link>;
}
