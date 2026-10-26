import { createFileRoute } from "@tanstack/react-router";
import { PRICE_BANDS, PRODUCTS } from "@/data/catalog";
import { Banner, ProductListing } from "@/components/store/ProductListing";

export const Route = createFileRoute("/shop-by-price")({
  validateSearch: (s: Record<string, unknown>) => ({ price: typeof s.price === "string" ? s.price : "577" }),
  head: () => ({ meta: [
    { title: "Shop By Price | Artisan Mart" }, { name: "description", content: "Browse Artisan Mart wholesale items by price band." },
    { property: "og:title", content: "Shop By Price | Artisan Mart" }, { property: "og:description", content: "Wholesale items by price band." },
  ] }),
  component: Page,
});

function Page() {
  const { price } = Route.useSearch();
  const band = PRICE_BANDS.find((b) => b.id === price);
  return <ProductListing key={price} products={PRODUCTS} initialPrice={band?.id} banner={<Banner kind="plain" title={band ? band.label : "Shop By Price"} />} />;
}
