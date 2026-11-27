import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState } from "react";
import { PackagePlus, Award, Tags, PackageOpen } from "lucide-react";
import { PRODUCTS, type CollectionSlug, type Product } from "@/data/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { HeroCarousel } from "@/components/store/HeroCarousel";
import { QuickView } from "@/components/store/LazyQuickView";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Artisan Mart | Your Source For Wholesale General Merchandise" },
    { name: "description", content: "Shop Artisan Mart new arrivals, best sellers, reduced price items and closeouts at wholesale." },
    { property: "og:title", content: "Artisan Mart | Wholesale General Merchandise" },
    { property: "og:description", content: "New arrivals, best sellers, reduced price items and closeouts at wholesale." },
  ] }),
  component: Home,
});

const PANELS: { slug: CollectionSlug; title: string; color: string }[] = [
  { slug: "new-arrivals", title: "NEW ARRIVALS", color: "bg-[#002655]" },
  { slug: "best-sellers", title: "BEST SELLERS", color: "bg-sec-best" },
  { slug: "reduced-price", title: "REDUCED PRICE", color: "bg-sec-reduced" },
  { slug: "closeouts", title: "CLOSEOUTS", color: "bg-sec-closeout" },
];

function Home() {
  const [qv, setQv] = useState<Product | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  // Match the visible text-to-card spacing, including font metrics, not the h1 box.
  useLayoutEffect(() => {
    const heading = headingRef.current;
    const panels = panelsRef.current;
    if (!heading || !panels) return;
    const mobile = window.matchMedia("(max-width: 780px)");
    const sections = Array.from(panels.querySelectorAll<HTMLElement>(":scope > section"));
    const textBounds = (element: Element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const rects: DOMRect[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        rects.push(...Array.from(range.getClientRects()));
      }
      return {
        top: Math.min(...rects.map(rect => rect.top)),
        bottom: Math.max(...rects.map(rect => rect.bottom)),
      };
    };
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      if (!mobile.matches) {
        panels.style.removeProperty("--store-home-heading-margin");
        return;
      }
      if (sections.length < 4) return;
      const columns = Math.abs(sections[0].getBoundingClientRect().top - sections[1].getBoundingClientRect().top) < 1 ? 2 : 1;
      const first = sections.slice(0, columns);
      const next = sections.slice(columns, columns * 2);
      const cards = first.flatMap(section => Array.from(section.querySelectorAll<HTMLElement>(".store-product-card")))
        .map(card => card.getBoundingClientRect()).filter(rect => rect.height > 0);
      const firstHeadings = first.map(section => section.querySelector("h2"));
      const nextHeadings = next.map(section => section.querySelector("h2"));
      if (!cards.length || firstHeadings.some(h => !h) || nextHeadings.some(h => !h)) return;
      const referenceGap = Math.min(...nextHeadings.map(h => textBounds(h!).top)) - Math.max(...cards.map(card => card.bottom));
      const actualGap = Math.min(...firstHeadings.map(h => textBounds(h!).top)) - textBounds(heading).bottom;
      const currentMargin = parseFloat(getComputedStyle(panels).marginTop);
      const margin = Math.max(0, currentMargin + referenceGap - actualGap);
      if (Number.isFinite(margin) && (Math.abs(margin - currentMargin) > 0.05 || !panels.style.getPropertyValue("--store-home-heading-margin"))) {
        panels.style.setProperty("--store-home-heading-margin", margin + "px");
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(heading);
    observer.observe(panels);
    sections.forEach(section => observer.observe(section));
    window.addEventListener("resize", measure);
    mobile.addEventListener("change", measure);
    void document.fonts.ready.then(measure);
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", measure);
      mobile.removeEventListener("change", measure);
      panels.style.removeProperty("--store-home-heading-margin");
    };
  }, []);
  const pick = (slug: CollectionSlug) => {
    const list = PRODUCTS.filter((p) => p.collections.includes(slug) && p.price != null);
    return slug === "new-arrivals" ? list.sort((a, b) => (a.newestRank ?? 999) - (b.newestRank ?? 999)).slice(0, 4) : list.slice(0, 4);
  };

  return (
    <div className="store-container">
      <h1 ref={headingRef} className="store-home-title text-center font-bold tracking-wide text-primary"><span className="store-home-title-line">Your Premier Source For</span>{" "}<span className="store-home-title-line">Wholesale General Merchandise</span></h1>
      <HeroCarousel />
      <div ref={panelsRef} className="store-home-panels mt-4 grid gap-5 lg:grid-cols-2">
        {PANELS.map((pnl) => (
          <section key={pnl.slug} data-collection={pnl.slug} className="relative rounded-t-[20px] bg-card hover:z-30 focus-within:z-30">
            <div className={`store-featured-header flex h-[58px] rounded-t-[20px] items-center justify-center gap-5 font-arial text-[22px] font-bold text-primary-foreground ${pnl.color}`}>
              {(() => { const Icon = { "new-arrivals": PackagePlus, "best-sellers": Award, "reduced-price": Tags, closeouts: PackageOpen, imports: PackageOpen }[pnl.slug]; return <Icon aria-hidden="true" className="h-8 w-8 shrink-0" strokeWidth={1.25} />; })()}
              <h2 className="uppercase">{pnl.title.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}</h2>
              <Link to="/collection/$slug" params={{ slug: pnl.slug }} className="store-featured-view-all text-lg underline">View All</Link>
            </div>
            <div className="store-home-products grid grid-cols-3 gap-2 p-3">{pick(pnl.slug).map((p) => <ProductCard key={p.sku} p={p} onQuickView={setQv} />)}</div>
          </section>
        ))}
      </div>
      <QuickView p={qv} onClose={() => setQv(null)} />
    </div>
  );
}
