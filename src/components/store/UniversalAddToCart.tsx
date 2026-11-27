import { useEffect, useId, useRef, useState } from "react";
import type { Product } from "@/data/catalog";
import { PurchasePanel } from "./PurchasePanel";
import "./UniversalAddToCart.css";

export function UniversalAddToCart({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const card = root.current?.closest<HTMLElement>(".store-product-card");
    if (card) card.dataset["purchaseOpen"] = String(open);
    return () => { if (card) delete card.dataset["purchaseOpen"]; };
  }, [open]);
  const place = () => {
    const element = root.current;
    const card = element?.closest<HTMLElement>(".store-product-card");
    if (!element || !card) return;
    const rect = card.getBoundingClientRect();
    const width = Math.min(304, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.left + (rect.width - width) / 2, window.innerWidth - width - 12)) - rect.left;
    element.style.setProperty("--purchase-left", `${left}px`);
  };
  useEffect(() => {
    const card = root.current?.closest<HTMLElement>(".store-product-card");
    card?.addEventListener("pointerenter", place);
    card?.addEventListener("focusin", place);
    return () => { card?.removeEventListener("pointerenter", place); card?.removeEventListener("focusin", place); };
  }, []);
  useEffect(() => {
    const closeForQuickView = () => setOpen(false);
    document.addEventListener("store:quick-view-open", closeForQuickView);
    return () => document.removeEventListener("store:quick-view-open", closeForQuickView);
  }, []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", place);
    };
  }, [open]);
  return <div ref={root} className="universal-cart" data-purchase-open={open} onPointerEnter={place} onFocusCapture={place} onPointerLeave={() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setOpen(false);
  }}>
    <button type="button" className="product-touch-action" aria-expanded={open} aria-controls={id} onClick={() => { place(); setOpen(value => !value); }}>BUY NOW</button>
    <div id={id} className="product-hover-panel">
      <div className="product-hover-surface"><PurchasePanel p={product} compact onDone={() => setOpen(false)} /></div>
    </div>
  </div>;
}
