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
    const viewportWidth = document.documentElement.clientWidth;
    const width = Math.min(304, viewportWidth - 24);
    const left = (viewportWidth <= 500
      ? (viewportWidth - width) / 2
      : Math.max(12, Math.min(rect.left + (rect.width - width) / 2, viewportWidth - width - 12))) - rect.left;
    element.style.setProperty("--purchase-width", `${width}px`);
    element.style.setProperty("--purchase-left", `${left}px`);
    element.style.setProperty("--purchase-pointer-left", `${Math.max(18, Math.min(rect.width / 2 - left, width - 18))}px`);
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
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const card = root.current?.closest<HTMLElement>(".store-product-card");
      const button = root.current?.querySelector<HTMLElement>(".product-touch-action");
      const panel = root.current?.querySelector<HTMLElement>(".product-hover-panel");
      if (!card || !button || !panel) return;
      const cardRect = card.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const { clientX: x, clientY: y } = event;
      const inCardColumn = x >= cardRect.left && x <= cardRect.right && y >= buttonRect.top && y <= panelRect.bottom;
      const inPanel = x >= panelRect.left && x <= panelRect.right && y >= panelRect.top && y <= panelRect.bottom;
      if (!inCardColumn && !inPanel) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("pointermove", pointerMove);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", place);
    };
  }, [open]);
  return <div ref={root} className="universal-cart" data-purchase-open={open} onPointerEnter={place} onFocusCapture={place}>
    <button type="button" className="product-touch-action" aria-expanded={open} aria-controls={id} onClick={() => {
      place();
      if (!open) requestAnimationFrame(() => root.current?.querySelector(".product-hover-panel")?.scrollIntoView({ block: "nearest" }));
      setOpen(value => !value);
    }}>BUY NOW</button>
    <div id={id} className="product-hover-panel">
      <div className="product-hover-surface"><PurchasePanel p={product} compact onDone={() => setOpen(false)} /></div>
    </div>
  </div>;
}
