import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingCart, ChevronDown, Megaphone, AlertTriangle } from "lucide-react";
import { CATEGORIES, PRICE_BANDS, slugify } from "@/data/catalog";
import { BUSINESS_PHONE, BUSINESS_PHONE_HREF } from "@/lib/business";
import "./SiteHeader.css";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState<null | "cat" | "price" | "kc">(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenu(null);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(null); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", escape); };
  }, []);
  const nav = useNavigate();
  const { lines } = useCart();
  const toggle = (m: typeof menu) => setMenu(menu === m ? null : m);
  const cols = Array.from({ length: 7 }, (_, i) => CATEGORIES.slice(i * 5, i * 5 + 5));

  return (
    <header ref={header} className="store-header relative z-40 bg-card shadow-sm">
      <div className="store-promo bg-promo text-center font-arial font-bold italic text-promo-foreground">
        <AlertTriangle className="mr-1 inline h-5 w-5 -translate-y-0.5" /> 8% OFF $1,000+ ORDERS W/ CODE: VIP8
      </div>
      <div className="store-header-layout">
        <Link to="/cart" className="store-minimum bg-gradient-to-b from-minimum to-minimum-deep text-center font-bold text-primary-foreground">
          Minimum <br />Order Amount <br />$500
        </Link>

            <Link to="/" className="store-brand leading-none">
              <span className="store-brand-name block font-display font-bold tracking-tight text-primary">ARTISAN<span className="text-accent">MART</span></span>
              <span className="store-brand-caption block font-semibold text-title">WHOLESALE MERCHANDISE</span>
            </Link>
            <form role="search" className="store-search relative" onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav({ to: "/search", search: { q: q.trim() } }); }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products or item numbers" autoComplete="off" name="q" aria-label="Search products" className="h-[54px] w-full rounded-[20px] border border-border bg-secondary px-5 pr-14 font-arial text-lg outline-none focus:ring-2 focus:ring-ring" />
              <button disabled={!q.trim()} aria-label="Search" className="absolute right-4 top-1/2 -translate-y-1/2 disabled:opacity-70"><Search className="h-7 w-7" /></button>
            </form>
            <div className="store-phone leading-tight">
              <div className="text-lg">CALL US TODAY</div>
              <a href={BUSINESS_PHONE_HREF} className="store-phone-number">{BUSINESS_PHONE}</a>
            </div>
        <div className="store-header-scroll" tabIndex={0} role="region" aria-label="Store navigation - scroll horizontally for more links">
          <nav className="store-nav" aria-label="Main navigation">
            <button aria-expanded={menu === "cat"} aria-controls="store-dropdown" onClick={() => toggle("cat")} className="flex items-center">Categories <ChevronDown className="h-4 w-4" /></button>
            <button aria-expanded={menu === "price"} aria-controls="store-dropdown" onClick={() => toggle("price")} className="flex items-center">Shop By Price <ChevronDown className="h-4 w-4" /></button>
            <Link to="/collection/$slug" params={{ slug: "imports" }}>Imports</Link>
            <Link to="/collection/$slug" params={{ slug: "closeouts" }}>Closeouts</Link>
            <Link to="/collection/$slug" params={{ slug: "best-sellers" }}>Best Sellers</Link>
            <Link to="/collection/$slug" params={{ slug: "reduced-price" }}>Reduced Price</Link>
            <Link to="/collection/$slug" params={{ slug: "new-arrivals" }}>New Arrivals</Link>
          </nav>
        <div className="store-utilities">
          <div className="store-utility-links">
            <Link to="/careers">Careers</Link><Link to="/contact">Contact Us</Link>
            <button aria-expanded={menu === "kc"} aria-controls="store-dropdown" onClick={() => toggle("kc")} className="flex items-center">Knowledge Center <ChevronDown className="h-4 w-4" /></button>

          </div>
          <div className="store-account-links leading-tight">
            <Link to="/login">Login Or <br />Register</Link>
            <Link to="/cart" className="flex items-center gap-2"><ShoppingCart className="h-10 w-10 text-accent" /><span>Your cart <br />({lines.length} Items)</span></Link>
            <Link to="/newsletter" className="flex items-center gap-2"><Megaphone className="h-9 w-9 text-primary" /><span>Join Our <br />Newsletter</span></Link>
          </div>
        </div>
        </div>
      </div>
      {menu && (
        <div id="store-dropdown" className="absolute inset-x-0 top-full z-50 px-4" onClick={() => setMenu(null)}>
          <div className="mx-auto max-w-[1452px] rounded-xl bg-menu p-6 text-primary-foreground shadow-xl">
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
