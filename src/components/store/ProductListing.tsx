import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PRICE_BANDS, type Product } from "@/data/catalog";
import { ProductCard } from "./ProductCard";
import { QuickView } from "./QuickView";

export const SORTS = [
  ["position", "Position Descending"], ["newest", "Newest Descending"], ["relevance", "Relevance"],
  ["price-asc", "Price Ascending"], ["price-desc", "Price Descending"], ["qty-desc", "Quantity Descending"],
  ["special", "On Special"], ["sku-asc", "Item # Ascending"], ["sku-desc", "Item # Descending"],
] as const;

function sortProducts(list: Product[], sort: string) {
  const a = [...list];
  const pr = (p: Product) => p.price ?? Infinity;
  switch (sort) {
    case "price-asc": return a.sort((x, y) => pr(x) - pr(y));
    case "price-desc": return a.sort((x, y) => (y.price ?? -1) - (x.price ?? -1));
    case "qty-desc": return a.sort((x, y) => (y.stock ?? -1) - (x.stock ?? -1));
    case "sku-asc": return a.sort((x, y) => x.sku.localeCompare(y.sku));
    case "sku-desc": return a.sort((x, y) => y.sku.localeCompare(x.sku));
    case "newest": return a.sort((x, y) => (x.newestRank ?? 999) - (y.newestRank ?? 999));
    case "special": return a.sort((x, y) => Number(y.badges.includes("special") || y.badges.includes("reduced")) - Number(x.badges.includes("special") || x.badges.includes("reduced")));
    default: return a;
  }
}

const PAGE = 24;

export function ProductListing({ products, banner, defaultSort = "position", initialPrice }: { products: Product[]; banner: ReactNode; defaultSort?: string; initialPrice?: string | undefined }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState(defaultSort);
  const [price, setPrice] = useState<string | null>(initialPrice ?? null);
  const [sub, setSub] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [qv, setQv] = useState<Product | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const inBand = (p: Product, id: string) => { const b = PRICE_BANDS.find((x) => x.id === id)!; return p.price != null && p.price >= b.min && p.price <= b.max; };
  const subs = useMemo(() => { const m = new Map<string, number>(); products.forEach((p) => { const s = p.subcategory ?? p.category; if (s) m.set(s, (m.get(s) ?? 0) + 1); }); return [...m].sort(); }, [products]);
  const filtered = useMemo(() => sortProducts(products.filter((p) => (!price || inBand(p, price)) && (!sub || (p.subcategory ?? p.category) === sub)), sort), [products, price, sub, sort]);

  useEffect(() => { setShown(PAGE); }, [price, sub, sort]);
  useEffect(() => {
    const el = sentinel.current; if (!el) return;
    const io = new IntersectionObserver((e) => e[0]?.isIntersecting && setShown((s) => s + PAGE));
    io.observe(el); return () => io.disconnect();
  }, []);

  const Radio = ({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) => (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm"><input type="radio" checked={on} onChange={onClick} /> {label}</label>
  );

  return (
    <div className="store-container store-listing py-4">
      <button type="button" className="rounded border bg-card px-4 py-3 text-left font-semibold md:hidden" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)}>Sort & filters {filtersOpen ? "−" : "+"}</button>
      <aside id="catalog-filters" className={`${filtersOpen ? "block" : "hidden"} space-y-4 md:block`}>
        <div className="rounded bg-card p-3">
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-transparent py-2 text-base">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="rounded bg-card p-4">
          <div className="mb-2 flex justify-between"><h3>Filter By Price</h3>{(price || sub) && <button className="text-sm text-primary" onClick={() => { setPrice(null); setSub(null); }}>Clear All</button>}</div>
          {PRICE_BANDS.map((b) => { const n = products.filter((p) => inBand(p, b.id)).length; return n ? <Radio key={b.id} on={price === b.id} label={`${b.label} (${n})`} onClick={() => setPrice(b.id)} /> : null; })}
          {subs.length > 0 && <>
            <h3 className="mb-2 mt-5">Filter By Subcategory</h3>
            {subs.map(([s, n]) => <Radio key={s} on={sub === s} label={`${s} (${n})`} onClick={() => setSub(s)} />)}
          </>}
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        {banner}
        <div className="store-catalog-grid mt-4 grid">
          {filtered.slice(0, shown).map((p) => <ProductCard key={p.sku} p={p} onQuickView={setQv} />)}
        </div>
        {filtered.length === 0 && <p className="mt-8 text-center">No products match these filters.</p>}
        <div ref={sentinel} className="h-8" />
      </div>
      <QuickView p={qv} onClose={() => setQv(null)} />
    </div>
  );
}

export function Banner({ kind, title }: { kind: string; title: string }) {
  const cls: Record<string, string> = { new: "bg-sky text-sec-closeout", best: "bg-best-banner text-primary-foreground", closeout: "bg-promo text-hero", reduced: "bg-sec-reduced text-primary-foreground", imports: "bg-hero text-primary-foreground", plain: "bg-primary text-primary-foreground" };
  return <div className={`rounded py-2 text-center font-display text-4xl font-bold uppercase italic tracking-wide md:text-5xl ${cls[kind] ?? cls["plain"]}`}>{title}</div>;
}
