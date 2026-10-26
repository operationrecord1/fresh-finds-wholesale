import { createFileRoute, notFound } from "@tanstack/react-router";
import { COLLECTIONS, PRODUCTS, type CollectionSlug } from "@/data/catalog";
import { Banner, ProductListing } from "@/components/store/ProductListing";

export const Route = createFileRoute("/collection/$slug")({
  loader: ({ params }) => { const c = COLLECTIONS[params.slug as CollectionSlug]; if (!c) throw notFound(); return { slug: params.slug as CollectionSlug, ...c }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? "Collection"} | Artisan Mart` },
    { name: "description", content: `Shop ${loaderData?.title ?? "this collection"} at Artisan Mart wholesale.` },
    { property: "og:title", content: `${loaderData?.title ?? "Collection"} | Artisan Mart` },
    { property: "og:description", content: `Wholesale ${loaderData?.title ?? ""} at Artisan Mart.` },
  ] }),
  component: Page,
  errorComponent: () => <p className="p-8">Could not load collection.</p>,
  notFoundComponent: () => <p className="p-8">Collection not found.</p>,
});

function Page() {
  const c = Route.useLoaderData();
  const products = PRODUCTS.filter((p) => p.collections.includes(c.slug));
  return (
    <>
      {products.length === 0 && <p className="mx-auto max-w-3xl px-4 pt-4 text-center text-sm text-muted-foreground">No verified products for this collection yet — awaiting the authorized catalog feed.</p>}
      <ProductListing key={c.slug} products={products} defaultSort={c.defaultSort} banner={<Banner kind={c.banner} title={c.title} />} />
    </>
  );
}
