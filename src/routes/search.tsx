import { createFileRoute, Link } from "@tanstack/react-router";
import { searchProducts } from "@/lib/search";
import { PRODUCTS } from "@/data/catalog";
import { Banner, ProductListing } from "@/components/store/ProductListing";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s["q"] === "string" ? s["q"] : "" }),
  head: () => ({ meta: [
    { title: "Search Results | Artisan Mart" }, { name: "description", content: "Search the Artisan Mart wholesale catalog by keyword or item number." },
    { property: "og:title", content: "Search | Artisan Mart" }, { property: "og:description", content: "Search the Artisan Mart catalog." },
  ] }),
  component: Page,
});

function Page() {
  const { q } = Route.useSearch();
  const results = searchProducts(PRODUCTS, q);
  if (!results.length) return (
    <div className="mx-auto max-w-2xl p-10 text-center">
      <h1 className="text-2xl font-bold">{q.trim() ? `No matches found for “${q}”` : "Search our products"}</h1>
      <p className="mt-4">Try a product name, category or item number. Check the spelling or use fewer words.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-primary underline">
        <Link to="/collection/$slug" params={{ slug: "new-arrivals" }}>New Arrivals</Link>
        <Link to="/collection/$slug" params={{ slug: "closeouts" }}>Clearance Sale</Link>
        <Link to="/collection/$slug" params={{ slug: "reduced-price" }}>Limited Time Offers</Link>
        <Link to="/collection/$slug" params={{ slug: "best-sellers" }}>Best Sellers</Link>
      </div>
    </div>
  );
  return <ProductListing key={q} products={results} defaultSort="relevance" banner={<Banner kind="plain" title={`Search: ${q}`} />} />;
}
