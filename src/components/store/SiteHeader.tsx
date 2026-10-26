import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShoppingCart, ChevronDown, Megaphone, AlertTriangle } from "lucide-react";
import { CATEGORIES, PRICE_BANDS, slugify } from "@/data/catalog";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState<null | "cat" | "price" | "kc">(null);
  const nav = useNavigate();
  const { lines } = useCart();
  const toggle = (m: typeof menu) => setMenu(menu === m ? null : m);
  const cols = Array.from({ length: 7 }, (_, i) => CATEGORIES.slice(i * 5, i * 5 + 5));

  return (
    <header className="relative z-40 bg-card shadow-sm">
      <div className="bg-promo py-1 text-center font-arial text-xl font-bold italic text-promo-foreground">
        <AlertTriangle className="mr-1 inline h-5 w-5 -translate-y-0.5" /> 8% OFF $1,000+ ORDERS W/ CODE: VIP8
      </div>
      <div className="mx-auto flex max-w-[1880px] items-start gap-4 px-4 pt-2 pb-2">
        <Link to="/cart" className="hidden shrink-0 rounded-b-2xl rounded-t-md bg-gradient-to-b from-minimum to-minimum-deep px-6 py-3 text-center text-lg font-bold leading-snug text-primary-foreground lg:block">
          Minimum<br />Order Amount<br />$500
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/" className="shrink-0 leading-none">
              <span className="block font-display text-4xl font-bold tracking-tight text-primary">ARTISAN<span className="text-accent">MART</span></span>
              <span className="block text-sm font-semibold tracking-[0.3em] text-title">WHOLESALE MERCHANDISE</span>
            </Link>
            <form className="relative min-w-[200px] flex-1" onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav({ to: "/search", search: { q: q.trim() } }); }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" className="h-[54px] w-full rounded-[20px] border border-border bg-secondary px-5 pr-14 font-arial text-lg outline-none focus:ring-2 focus:ring-ring" />
              <button disabled={!q.trim()} aria-label="Search" className="absolute right-4 top-1/2 -translate-y-1/2 disabled:opacity-70"><Search className="h-7 w-7" /></button>
            </form>
            <div className="shrink-0 leading-tight">
              <div className="text-lg">CALL US TODAY</div>
              <div className="text-2xl font-bold text-muted-foreground" title="Artisan Mart phone number not yet provided">(phone TBA)</div>
            </div>
          </div>
          <nav className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-lg font-semibold">
            <button onClick={() => toggle("cat")} className="flex items-center">Categories <ChevronDown className="h-4 w-4" /></button>
            <button onClick={() => toggle("price")} className="flex items-center">Shop By Price <ChevronDown className="h-4 w-4" /></button>
            <Link to="/collection/$slug" params={{ slug: "imports" }}>Imports</Link>
            <Link to="/collection/$slug" params={{ slug: "closeouts" }}>Closeouts</Link>
            <Link to="/collection/$slug" params={{ slug: "best-sellers" }}>Best Sellers</Link>
            <Link to="/collection/$slug" params={{ slug: "reduced-price" }}>Reduced Price</Link>
            <Link to="/collection/$slug" params={{ slug: "new-arrivals" }}>New Arrivals</Link>
          </nav>
        </div>
        <div className="hidden shrink-0 border-l border-border pl-4 text-lg xl:block">
          <div className="flex gap-4">
            <Link to="/careers">Careers</Link><Link to="/contact">Contact Us</Link>
            <button onClick={() => toggle("kc")} className="flex items-center">Knowledge Center <ChevronDown className="h-4 w-4" /></button>
            <span>EN</span>
          </div>
          <div className="mt-3 flex items-center gap-6 leading-tight">
            <Link to="/login">Login Or<br />Register</Link>
            <Link to="/cart" className="flex items-center gap-2"><ShoppingCart className="h-10 w-10 text-accent" /><span>Your cart<br />({lines.length} Items)</span></Link>
            <Link to="/newsletter" className="flex items-center gap-2"><Megaphone className="h-9 w-9 text-primary" /><span>Join Our<br />Newsletter</span></Link>
          </div>
        </div>
      </div>
      {menu && (
        <div className="absolute inset-x-0 top-full z-50 px-4" onClick={() => setMenu(null)}>
          <div className="mx-auto max-w-[1500px] rounded-xl bg-menu p-6 text-primary-foreground shadow-xl">
            {menu === "cat" && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
                {cols.map((c, i) => <ul key={i} className="space-y-2">{c.map((name) => (
                  <li key={name}><Link to="/category/$slug" params={{ slug: slugify(name) }} className="hover:underline">{name}</Link></li>))}</ul>)}
              </div>
            )}
            {menu === "price" && (
              <ul className="grid max-w-md grid-cols-2 gap-2">{PRICE_BANDS.map((b) => (
                <li key={b.id}><Link to="/shop-by-price" search={{ price: b.id }} className="hover:underline">{b.label}</Link></li>))}</ul>
            )}
            {menu === "kc" && (
              <ul className="grid max-w-md grid-cols-2 gap-2">{["Artisan Mart", "Sales", "Product Download", "Shipping", "Closeouts", "FBA Sales", "Community Outreach"].map((x) => (
                <li key={x}><Link to="/info/$page" params={{ page: slugify(x) }} className="hover:underline">{x}</Link></li>))}</ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
