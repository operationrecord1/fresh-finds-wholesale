import { createFileRoute, Link } from "@tanstack/react-router";
import { SimplePage, meta } from "@/components/store/SimplePage";
import { ExpressOrder } from "@/components/store/ExpressOrder";

export const Route = createFileRoute("/express-order")({ head: () => meta("Express Order", "Order Artisan Mart items quickly by item number or CSV."), component: () => (
  <SimplePage title="Express Order"><ExpressOrder open /><Link to="/cart" className="text-primary underline">Go to cart</Link></SimplePage>
) });
