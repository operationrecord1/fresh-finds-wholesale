import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import type { Badge, Product } from "@/data/catalog";
import { money } from "@/lib/wholesale";
import { PurchasePanel } from "./PurchasePanel";

const BADGE: Record<Badge, [string, string]> = {
  new: ["NEW ITEM", "bg-sec-reduced"], closeout: ["CLOSEOUT", "bg-sec-closeout"],
  hot: ["HOT ITEM", "bg-badge-hot"], reduced: ["REDUCED PRICE", "bg-sec-best"], special: ["SPECIAL", "bg-badge-special"],
};

export function Badges({ badges }: { badges: Badge[] }) {
  return (
    <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-2">
      {badges.map((b) => <span key={b} className={`rounded-full px-3 py-0.5 font-arial text-xs font-bold text-primary-foreground ring-2 ring-card ${BADGE[b][1]}`}>{BADGE[b][0]}</span>)}
    </div>
  );
}

export function ProductImage({ p, i = 0, className = "" }: { p: Product; i?: number; className?: string }) {
  const src = p.images[i];
  if (src) return <img src={src} alt={p.title} loading="lazy" className={`h-full w-full object-contain ${className}`} />;
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-muted text-muted-foreground ${className}`}>
      <ImageOff className="h-8 w-8" />
      <span className="font-arial text-xs font-bold">{p.sku}</span>
      <span className="px-2 text-center text-[10px]">Image pending authorization</span>
    </div>
  );
}

export function ProductCard({ p, onQuickView }: { p: Product; onQuickView?: (p: Product) => void }) {
  return (
    <div className="store-product-card group relative flex h-full flex-col rounded-md bg-card p-3 text-center hover:z-30 focus-within:z-30">
      <Badges badges={p.badges} />
      <button onClick={() => onQuickView?.(p)} className="store-product-photo block w-full" aria-label={`Quick view ${p.title}`}>
        <ProductImage p={p} />
      </button>
      <Link to="/product/$sku" params={{ sku: p.sku.toLowerCase() }} className="mt-3 line-clamp-2 min-h-[2.5em] font-semibold text-lg leading-tight text-title hover:underline">
        {p.title}{p.titleTruncated ? "…" : ""}
      </Link>
      <div className="mt-3 font-arial text-xs font-bold">Item # {p.sku}</div>
      <div className="font-arial text-sm">Qty Avail: {p.stock != null ? p.stock.toLocaleString() : "—"}</div>
      <div className="mt-3 font-arial text-lg font-bold text-price">Price: {p.price != null ? money(p.price) : "—"}</div>
      {/* Kole Imports: hovering a card reveals a purchase box anchored below it (desktop only). */}
      {p.rules && p.price != null && (
        <div className="absolute left-1/2 top-full hidden w-[304px] -translate-x-1/2 pt-2 text-left lg:group-hover:block lg:group-focus-within:block">
          <div className="rounded-lg border border-border bg-muted p-3 shadow-xl">
            <PurchasePanel p={p} compact />
            <p className="mt-2 text-center text-sm font-semibold">*Sold in Lots of {p.rules.lot}</p>
          </div>
        </div>
      )}
    </div>
  );
}
