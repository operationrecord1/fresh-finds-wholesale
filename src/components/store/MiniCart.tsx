import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

/** Stable cart navigation with an item count. */
export function MiniCart() {
  const { lines } = useCart();
  const count = lines.reduce((sum, line) => sum + line.pieces, 0);
  return <Link to="/cart" className="store-cart-button" aria-label={`Shopping cart, ${count} items`}>
    <span className="store-cart-icon"><img src={`${import.meta.env.BASE_URL}cart-black-reference.svg`} alt="" aria-hidden="true" /><b>{count}</b></span>
    <span>Cart</span>
  </Link>;
}
