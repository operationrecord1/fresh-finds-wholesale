import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { Product } from "@/data/catalog";
import { money } from "@/lib/wholesale";
import { Badges, ProductImage } from "./ProductCard";
import { PurchasePanel } from "./PurchasePanel";

export function QuickView({ p, onClose, initialPieces }: { p: Product | null; onClose: () => void; initialPieces?: number }) {
  if (!p) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={onClose}>
      <div className="relative grid max-h-[90vh] w-full max-w-4xl gap-6 overflow-auto rounded-xl bg-card p-6 md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
        <button aria-label="Close" onClick={onClose} className="absolute right-3 top-3"><X /></button>
        <div className="relative aspect-square"><Badges badges={p.badges} /><ProductImage p={p} /></div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-title">{p.title}{p.titleTruncated ? "…" : ""}</h2>
          <div className="font-arial text-sm">Item # {p.sku} · Qty Avail: {p.stock?.toLocaleString() ?? "—"}</div>
          <div className="text-xl font-bold">Price: {p.price != null ? money(p.price) : "—"}</div>
          <PurchasePanel p={p} initialPieces={initialPieces} onDone={onClose} label={initialPieces != null ? "Update Cart" : "Add To Cart"} />
          <Link to="/product/$sku" params={{ sku: p.sku.toLowerCase() }} className="inline-block pt-2 text-primary underline">View full product details</Link>
        </div>
      </div>
    </div>
  );
}
