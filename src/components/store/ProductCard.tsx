import { useEffect, useId, useRef, useState } from "react";
import "./ProductCommerce.css";
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
    <div className="store-product-badges" aria-label="Product badges">
      {badges.slice(0, 2).map((b) => <span key={b} className={`store-product-badge rounded-full font-arial font-bold text-primary-foreground ${BADGE[b][1]}`}>{BADGE[b][0]}</span>)}
    </div>
  );
}

export function ProductImage({ p, i = 0, className = "", eager = false }: { p: Product; i?: number; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState<string | null>(null);
  const raw = p.images[i];
  const src = raw && !/^(https?:|data:|blob:)/.test(raw) ? import.meta.env.BASE_URL + raw.replace(/^\//, "") : raw;
  if (src && failed !== src) return <img onError={() => setFailed(src)} src={src} alt={p.title} loading={eager ? "eager" : "lazy"} decoding="async" className={`h-full w-full object-contain ${className}`} />;
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-muted text-muted-foreground ${className}`}>
      <ImageOff className="h-8 w-8" />
      <span className="font-arial text-xs font-bold">{p.sku}</span>
      <span className="px-2 text-center text-[10px]">Image pending authorization</span>
    </div>
  );
}

export function ProductCard({ p, onQuickView }: { p: Product; onQuickView?: (p: Product) => void }) {
  const [expanded, setExpanded] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!expanded) return;
    const outside = (e: PointerEvent) => { if (!card.current?.contains(e.target as Node)) setExpanded(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    const resize = () => { if (card.current) placePanel(card.current); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); window.removeEventListener("resize", resize); };
  }, [expanded]);
  const [panelLeft, setPanelLeft] = useState(0);
  const placePanel = (card: HTMLElement) => {
    const rect = card.getBoundingClientRect();
    const width = Math.min(304, window.innerWidth - 24);
    setPanelLeft(Math.max(12, Math.min(rect.left + (rect.width - width) / 2, window.innerWidth - width - 12)) - rect.left);
  };
  return (
    <div ref={card} data-purchase-open={expanded} onPointerEnter={e => placePanel(e.currentTarget)} onFocusCapture={e => placePanel(e.currentTarget)} className="store-product-card group relative flex h-full min-w-0 flex-col rounded-md bg-card p-3 text-center hover:z-30 focus-within:z-30">
      <div className="store-product-visual relative w-full">
        <button type="button" onClick={() => onQuickView?.(p)} className="store-product-photo block w-full" aria-label={`Quick view ${p.title}`}>
          <ProductImage p={p} />
        </button>
        <Badges badges={p.badges} />
      </div>
      <Link onClick={e => { if (onQuickView && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) { e.preventDefault(); onQuickView(p); } }} to="/product/$sku" params={{ sku: p.sku.toLowerCase() }} className="store-product-title font-semibold text-title hover:underline">
        {p.title}{p.titleTruncated ? "…" : ""}
      </Link>
      <div className="store-product-id font-arial font-bold">Item # {p.sku}</div>
      <div className="store-product-quantity font-arial">Qty Avail: {p.stock != null ? p.stock.toLocaleString() : "—"}</div>
      <button type="button" onClick={() => onQuickView?.(p)} className="store-product-price font-arial font-bold text-price" aria-label={`Quick view price for ${p.title}`}>Price: {p.price != null ? money(p.price) : "—"}</button>
      <button type="button" className="product-touch-action" aria-expanded={expanded} aria-controls={panelId} onClick={() => { if (card.current) placePanel(card.current); setExpanded(!expanded); }}>BUY NOW</button>
      {/* Kole Imports: hovering a card reveals a purchase box anchored below it (desktop only). */}
      {(
        <div id={panelId} className="product-hover-panel" style={{left:panelLeft, right:"auto", transform:"none"}}>
          <div className="product-hover-surface">
            <PurchasePanel p={p} compact onDone={() => setExpanded(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
