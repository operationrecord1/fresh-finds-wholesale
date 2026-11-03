import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getProduct, slugify } from "@/data/catalog";
import { money } from "@/lib/wholesale";
import { Badges, ProductImage } from "@/components/store/ProductCard";
import { PurchasePanel } from "@/components/store/PurchasePanel";

export const Route = createFileRoute("/product/$sku")({
  loader: ({ params }) => { const p = getProduct(params.sku); if (!p) throw notFound(); return { sku: p.sku, title: p.title }; },
  head: ({ loaderData }) => ({ meta: [
    { title: loaderData ? `${loaderData.title} (${loaderData.sku}) | Artisan Mart` : "Product | Artisan Mart" },
    { name: "description", content: loaderData ? `Wholesale ${loaderData.title}, item # ${loaderData.sku}.` : "Wholesale product." },
    { property: "og:title", content: loaderData?.title ?? "Product" },
    { property: "og:description", content: `Item # ${loaderData?.sku ?? ""} at Artisan Mart.` },
  ] }),
  component: Page,
  errorComponent: () => <p className="p-8">Could not load product.</p>,
  notFoundComponent: () => <p className="p-8">Product not found.</p>,
});

function Page() {
  const p = getProduct(Route.useLoaderData().sku)!;
  const [img, setImg] = useState(0);
  const n = Math.max(p.images.length, 1);
  const specs: [string, string][] = [
    ...Object.entries(p.specs), ["UPC", p.upc ?? "Not verified"],
    ["Category", p.category ?? "Not verified"], ["Subcategory", p.subcategory ?? "Not verified"],
  ];
  return (
    <div className="mx-auto grid max-w-[1300px] gap-8 px-4 py-6 md:grid-cols-2">
      <div>
        <div className="relative aspect-square rounded border border-border bg-card p-4">
          <Badges badges={p.badges} /><ProductImage p={p} i={img} eager />
          {n > 1 && <>
            <button aria-label="Previous image" className="absolute left-2 top-1/2" onClick={() => setImg((img - 1 + n) % n)}><ChevronLeft /></button>
            <button aria-label="Next image" className="absolute right-2 top-1/2" onClick={() => setImg((img + 1) % n)}><ChevronRight /></button>
          </>}
        </div>
        <div className="mt-3 flex gap-2">{Array.from({ length: n }, (_, k) => (
          <button aria-label={`View product image ${k + 1}`} aria-pressed={img === k} key={k} onClick={() => setImg(k)} className={`h-20 w-20 rounded border bg-card ${k === img ? "border-primary" : "border-border"}`}><ProductImage p={p} i={k} /></button>))}</div>
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-title">{p.title}{p.titleTruncated ? "…" : ""}</h1>
        {p.titleTruncated && <p className="text-xs text-muted-foreground">Full title not yet verified (reference showed a shortened title).</p>}
        <div className="font-arial">Item # <b>{p.sku}</b> · Qty Avail: <b>{p.stock?.toLocaleString() ?? "—"}</b></div>
        <div className="text-2xl font-bold text-price">Price: {p.price != null ? money(p.price) : "—"}</div>
        <PurchasePanel p={p} />
        <section className="pt-4">
          <h2 className="mb-2 text-xl font-bold">Description</h2>
          <p className="text-sm">{p.description ?? "Product description not yet available from the authorized source."}</p>
        </section>
        <section>
          <h2 className="mb-2 text-xl font-bold">Specifications</h2>
          <table className="w-full text-sm"><tbody>{specs.map(([k, v]) => (
            <tr key={k} className="border-b border-border"><td className="py-1 pr-4 font-semibold">{k}</td><td>
              {k === "Category" && p.category ? <Link to="/category/$slug" params={{ slug: slugify(p.category) }} className="text-primary underline">{v}</Link> : v}
            </td></tr>))}</tbody></table>
        </section>
        {p.californiaWarning && <details className="rounded border border-border bg-card p-3 text-sm"><summary className="cursor-pointer font-semibold">California Warning</summary><p className="mt-2">{p.californiaWarningText ?? "Warning text to be supplied from the authorized product source."}</p></details>}
      </div>
    </div>
  );
}
