import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import type { Product } from "@/data/catalog";
import { money } from "@/lib/wholesale";
import { Badges, ProductImage } from "./ProductCard";
import { PurchasePanel } from "./PurchasePanel";

// Kole Imports: clicking a product image opens a full-width, top-anchored overlay with gallery,
// purchase controls, description and specifications.
export function QuickView({ p, onClose, initialPieces }: { p: Product | null; onClose: () => void; initialPieces?: number | undefined }) {
  if (!p) return null;
  const specs: [string, string][] = [...Object.entries(p.specs), ["Upc Code", p.upc ?? "Not verified"], ["Category", p.category ?? "Not verified"], ["Subcategory", p.subcategory ?? "Not verified"]];
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-foreground/50" onClick={onClose}>
      <div role="dialog" aria-label={p.title} className="relative grid w-full gap-6 bg-card px-4 pb-8 pt-12 md:grid-cols-[minmax(0,500px)_1fr] md:px-20 md:pt-14" onClick={(e) => e.stopPropagation()}>
        <button aria-label="Close" onClick={onClose} className="absolute left-4 top-4"><XCircle className="h-7 w-7" /></button>
        <div className="relative aspect-square rounded border border-border p-4"><Badges badges={p.badges} /><ProductImage p={p} /></div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-title">{p.title}{p.titleTruncated ? "…" : ""}</h2>
          <div className="text-title">Item # {p.sku}</div>
          <div className="text-3xl font-bold">Price: {p.price != null ? money(p.price) : "—"}</div>
          <div className="flex flex-wrap justify-between gap-2 text-xl"><span>Qty Avail: {p.stock?.toLocaleString() ?? "—"}</span>{p.rules && <span>*Sold in Lots of {p.rules.lot}</span>}</div>
          <PurchasePanel p={p} initialPieces={initialPieces} onDone={onClose} label={initialPieces != null ? "Update Cart" : "Add To Cart"} />
          <h3 className="pt-2 text-2xl font-semibold">Description</h3>
          <p className="text-sm">{p.description ?? "Product description not yet available from the authorized source."}</p>
          <h3 className="pt-2 text-2xl font-semibold">Specifications</h3>
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">{specs.map(([k, v]) => <div key={k}><div>{k}</div><div>{v}</div></div>)}</div>
          <Link to="/product/$sku" params={{ sku: p.sku.toLowerCase() }} className="inline-block pt-2 text-primary underline">View full product page</Link>
        </div>
      </div>
    </div>
  );
}
