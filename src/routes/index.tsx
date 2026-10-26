import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PRODUCTS, type CollectionSlug, type Product } from "@/data/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { QuickView } from "@/components/store/QuickView";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Artisan Mart | Your Source For Wholesale General Merchandise" },
    { name: "description", content: "Shop Artisan Mart new arrivals, best sellers, reduced price items and closeouts at wholesale." },
    { property: "og:title", content: "Artisan Mart | Wholesale General Merchandise" },
    { property: "og:description", content: "New arrivals, best sellers, reduced price items and closeouts at wholesale." },
  ] }),
  component: Home,
});

const SLIDES = [
  { h: "WHOLESALE GENERAL MERCHANDISE", s: "Closeouts & Imports", b: ["Serving Retailers, Resellers, Nonprofits & more", "Constantly Changing Assortment"] },
  { h: "8% OFF $1,000+ ORDERS", s: "Use code VIP8 at checkout", b: ["$500 order minimum", "Piece and case purchasing"] },
  { h: "SHOP NEW ARRIVALS", s: "Fresh items added regularly", b: ["Browse by category or price", "Express Order by SKU"] },
];

const PANELS: { slug: CollectionSlug; title: string; color: string }[] = [
  { slug: "new-arrivals", title: "NEW ARRIVALS", color: "bg-sec-new" },
  { slug: "best-sellers", title: "BEST SELLERS", color: "bg-sec-best" },
  { slug: "reduced-price", title: "REDUCED PRICE", color: "bg-sec-reduced" },
  { slug: "closeouts", title: "CLOSEOUTS", color: "bg-sec-closeout" },
];

function Home() {
  const [i, setI] = useState(0);
  const [qv, setQv] = useState<Product | null>(null);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6000); return () => clearInterval(t); }, []);
  const s = SLIDES[i];
  const pick = (slug: CollectionSlug) => {
    const list = PRODUCTS.filter((p) => p.collections.includes(slug) && p.price != null);
    return slug === "new-arrivals" ? list.sort((a, b) => (a.newestRank ?? 999) - (b.newestRank ?? 999)).slice(0, 3) : list.slice(0, 3);
  };

  return (
    <div className="mx-auto max-w-[1460px] px-4">
      <h1 className="py-3 text-center text-3xl font-bold tracking-wide text-primary md:text-[2.6rem]">Your Premier Source For Wholesale General Merchandise</h1>
      <section className="relative overflow-hidden rounded-2xl bg-hero px-8 py-12 text-primary-foreground md:min-h-[300px] md:pl-[45%]">
        <h2 className="font-display text-3xl font-bold md:text-5xl">{s.h}</h2>
        <p className="mt-2 text-2xl text-accent md:text-4xl">{s.s}</p>
        <ul className="mt-4 space-y-2 text-xl">{s.b.map((x) => <li key={x} className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-accent" />{x}</li>)}</ul>
        <div className="mt-6 flex gap-2">{SLIDES.map((_, k) => <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-3 w-3 rounded-full ${k === i ? "bg-primary-foreground" : "bg-primary-foreground/40"}`} />)}</div>
        <span className="absolute bottom-3 left-6 hidden text-xs opacity-60 md:block">Hero artwork pending</span>
      </section>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {PANELS.map((pnl) => (
          <section key={pnl.slug} className="overflow-hidden rounded-t-[20px] bg-card">
            <div className={`flex h-[58px] items-center justify-center gap-5 font-arial text-[22px] font-bold text-primary-foreground ${pnl.color}`}>
              {pnl.title}
              <Link to="/collection/$slug" params={{ slug: pnl.slug }} className="text-lg underline">View All</Link>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3">{pick(pnl.slug).map((p) => <ProductCard key={p.sku} p={p} onQuickView={setQv} />)}</div>
          </section>
        ))}
      </div>
      <QuickView p={qv} onClose={() => setQv(null)} />
    </div>
  );
}
