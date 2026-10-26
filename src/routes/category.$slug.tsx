import { createFileRoute, notFound } from "@tanstack/react-router";
import { CATEGORIES, PRODUCTS, slugify } from "@/data/catalog";
import { Banner, ProductListing } from "@/components/store/ProductListing";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => { const name = CATEGORIES.find((c) => slugify(c) === params.slug); if (!name) throw notFound(); return { name }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.name ?? "Category"} Wholesale | Artisan Mart` },
    { name: "description", content: `Wholesale ${loaderData?.name ?? ""} products at Artisan Mart.` },
    { property: "og:title", content: `${loaderData?.name ?? "Category"} | Artisan Mart` },
    { property: "og:description", content: `Wholesale ${loaderData?.name ?? ""} at Artisan Mart.` },
  ] }),
  component: Page,
  errorComponent: () => <p className="p-8">Could not load category.</p>,
  notFoundComponent: () => <p className="p-8">Category not found.</p>,
});

function Page() {
  const { name } = Route.useLoaderData();
  const products = PRODUCTS.filter((p) => p.category === name);
  return (
    <>
      {products.length === 0 && <p className="px-4 pt-4 text-center text-sm text-muted-foreground">Category assignments for most items are not yet verified — awaiting the authorized catalog feed.</p>}
      <ProductListing key={name} products={products} banner={<Banner kind="plain" title={name} />} />
    </>
  );
}
