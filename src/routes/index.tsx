import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PackagePlus, Award, Tags, PackageOpen } from "lucide-react";
import { PRODUCTS, type CollectionSlug, type Product } from "@/data/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { HeroCarousel } from "@/components/store/HeroCarousel";
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

const PANELS: { slug: CollectionSlug; title: string; color: string }[] = [
  { slug: "new-arrivals", title: "NEW ARRIVALS", color: "bg-sec-new" },
  { slug: "best-sellers", title: "BEST SELLERS", color: "bg-sec-best" },
  { slug: "reduced-price", title: "REDUCED PRICE", color: "bg-sec-reduced" },
  { slug: "closeouts", title: "CLOSEOUTS", color: "bg-sec-closeout" },
];

function Home() {
  const [qv, setQv] = useState<Product | null>(null);
  const pick = (slug: CollectionSlug) => {
    const list = PRODUCTS.filter((p) => p.collections.includes(slug) && p.price != null);
    return slug === "new-arrivals" ? list.sort((a, b) => (a.newestRank ?? 999) - (b.newestRank ?? 999)).slice(0, 3) : list.slice(0, 3);
  };

  return (
    <div className="store-container">
      <h1 className="store-home-title text-center font-bold tracking-wide text-primary">Your Premier Source For Wholesale General Merchandise</h1>
      <HeroCarousel />
      <div className="store-home-panels mt-4 grid gap-5 lg:grid-cols-2">
        {PANELS.map((pnl) => (
          <section key={pnl.slug} className="relative rounded-t-[20px] bg-card hover:z-30 focus-within:z-30">
            <div className={`flex h-[58px] rounded-t-[20px] items-center justify-center gap-5 font-arial text-[22px] font-bold text-primary-foreground ${pnl.color}`}>
              {(() => { const Icon = { "new-arrivals": PackagePlus, "best-sellers": Award, "reduced-price": Tags, closeouts: PackageOpen, imports: PackageOpen }[pnl.slug]; return <Icon aria-hidden="true" className="h-8 w-8 shrink-0" strokeWidth={1.25} />; })()}
              <h2>{pnl.title}</h2>
              <Link to="/collection/$slug" params={{ slug: pnl.slug }} className="text-lg underline">View All</Link>
            </div>
            <div className="store-home-products grid grid-cols-3 gap-2 p-3">{pick(pnl.slug).map((p) => <ProductCard key={p.sku} p={p} onQuickView={setQv} />)}</div>
          </section>
        ))}
      </div>
      <QuickView p={qv} onClose={() => setQv(null)} />
    </div>
  );
}
