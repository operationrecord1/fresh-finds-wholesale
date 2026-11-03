import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import type { Product } from "@/data/catalog";
import { money } from "@/lib/wholesale";
import { Badges, ProductImage } from "./ProductCard";
import { PurchasePanel } from "./PurchasePanel";
import "./ProductCommerce.css";

export function QuickView({ p, onClose, initialPieces }: { p: Product | null; onClose: () => void; initialPieces?: number | undefined }) {
  return p ? <ProductDialog key={p.sku + ":" + (initialPieces ?? "new")} p={p} onClose={onClose} initialPieces={initialPieces}/> : null;
}
function ProductDialog({ p, onClose, initialPieces }: { p: Product; onClose: () => void; initialPieces?: number | undefined }) {
  const [image, setImage] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close.current(); }
      if (event.key !== "Tab") return;
      const nodes = [...(dialog.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),summary,[tabindex="0"]') ?? [])].filter(el => el.getClientRects().length);
      const first = nodes[0], last = nodes.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keys);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", keys); previous?.focus(); };
  }, []);
  const specs: [string, string][] = [...Object.entries(p.specs), ["UPC Code", p.upc ?? "Not verified"], ["Category", p.category ?? "Not verified"], ["Subcategory", p.subcategory ?? "Not verified"]];
  return <div className="product-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="quick-product-title" tabIndex={-1} className="product-modal">
      <button type="button" className="product-modal-close" aria-label="Close quick view" onClick={onClose}><XCircle size={28}/></button>
      <div className="product-gallery">
        <div className="product-gallery-main"><Badges badges={p.badges}/><ProductImage p={p} i={image} eager/></div>
        {p.images.length > 1 && <div className="product-thumbnails" aria-label="Product images">{p.images.map((src, index) => <button key={src + index} type="button" aria-label={`View product image ${index + 1}`} aria-pressed={image === index} onClick={() => setImage(index)}><ProductImage p={p} i={index}/></button>)}</div>}
      </div>
      <div className="product-modal-content">
        <h2 id="quick-product-title">{p.title}{p.titleTruncated ? "…" : ""}</h2>
        <p>Item # {p.sku}</p>
        <div className="product-modal-price">Price: {p.price != null ? money(p.price) : "—"}</div>
        <div className="product-availability"><span>Qty Avail: {p.stock?.toLocaleString() ?? "—"}</span>{p.rules && <span>*Sold in Lots of {p.rules.lot}</span>}</div>
        <PurchasePanel p={p} initialPieces={initialPieces} onDone={onClose} label={initialPieces != null ? "Update Cart" : "Add To Cart"}/>
        <h3>Description</h3>
        <p>{p.description ?? "Product description is not yet available from the supplier source."}</p>
        <h3>Specifications</h3>
        <dl className="product-specifications">{specs.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
        {p.californiaWarning && <details className="product-warning"><summary>California Warning</summary><p>This item is marked with a California warning in the catalog. The supplier's exact warning text has not yet been supplied.</p></details>}
        <Link to="/product/$sku" params={{sku:p.sku.toLowerCase()}} onClick={onClose} className="product-detail-link">View full product page</Link>
      </div>
    </div>
  </div>;
}
