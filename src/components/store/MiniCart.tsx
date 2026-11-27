import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

/** Stable cart navigation with an item count. */
export function MiniCart() {
  const { lines } = useCart();
  return <Link to="/cart" className="store-cart-button" aria-label={`Shopping cart, ${lines.length} products`}>
    <span className="store-cart-icon"><ShoppingCart aria-hidden="true" /><b>{lines.length}</b></span>
    <span>Cart</span>
  </Link>;
}
