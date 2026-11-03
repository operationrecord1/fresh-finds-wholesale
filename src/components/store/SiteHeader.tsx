import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Phone, Search, ShoppingCart, ChevronDown, ChevronLeft, ChevronRight, Megaphone, AlertTriangle } from "lucide-react";
import { CATEGORIES, PRICE_BANDS, slugify } from "@/data/catalog";
import { BUSINESS_PHONE, BUSINESS_PHONE_HREF } from "@/lib/business";
import "./SiteHeader.css";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState<null | "cat" | "price" | "kc">(null);
  const header = useRef<HTMLElement>(null);
  const catTrigger = useRef<HTMLButtonElement>(null);
  const priceTrigger = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState({ left: 12, top: 0, width: 360 });
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelLeave = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); };
  const openHover = (next: "cat" | "price") => { cancelLeave(); if (window.matchMedia("(hover: hover)").matches) setMenu(next); };
  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);
  const navigation = useRef<HTMLDivElement>(null);
  const navItems = useRef<HTMLElement>(null);
  const [overflow, setOverflow] = useState({ needed: false, left: false, right: false });
  useEffect(() => {
    const viewport = navigation.current;
    const items = navItems.current;
    if (!viewport || !items) return;
    let active = true;
    const update = () => {
      if (!active) return;
      const max = viewport.scrollWidth - viewport.clientWidth;
      setOverflow({ needed: max > 1, left: viewport.scrollLeft > 1, right: viewport.scrollLeft < max - 1 });
    };
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    observer.observe(items);
    viewport.addEventListener("scroll", update, { passive: true });
    document.fonts.ready.then(update);
    update();
    return () => { active = false; observer.disconnect(); viewport.removeEventListener("scroll", update); };
  }, []);
  const scrollNavigation = (direction: number) => {
    const viewport = navigation.current;
    if (!viewport) return;
    viewport.scrollBy({ left: direction * viewport.clientWidth * .75, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenu(null);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(null); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", escape); };
  }, []);
  useEffect(() => {
    if (!menu) return;
    const position = () => {
      const h = header.current?.getBoundingClientRect();
      const trigger = (menu === "cat" ? catTrigger : priceTrigger).current?.getBoundingClientRect();
      if (!h) return;
      const left = Math.max(12, Math.min((trigger?.left ?? h.left + 12) - h.left, h.width - 240));
      setAnchor({left, top: menu === "kc" ? h.height : (trigger?.bottom ?? h.bottom) - h.top, width: Math.min(menu === "cat" ? 1100 : 370, h.width - left - 12)});
    };
    position();
    window.addEventListener("resize", position);
    const viewport = navigation.current;
    viewport?.addEventListener("scroll", position);
    return () => { window.removeEventListener("resize", position); viewport?.removeEventListener("scroll", position); };
  }, [menu]);
  const nav = useNavigate();
  const { lines } = useCart();
  const toggle = (m: typeof menu) => setMenu(menu === m ? null : m);
  const cols = Array.from({ length: 7 }, (_, i) => CATEGORIES.slice(i * 5, i * 5 + 5));

  return (
    <header onPointerEnter={cancelLeave} onPointerLeave={(e) => { if(e.pointerType === "mouse") leaveTimer.current = setTimeout(() => setMenu(null), 180); }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMenu(null); }} ref={header} className="store-header relative z-40 bg-card shadow-sm">
      <div className="store-promo bg-promo text-center font-arial font-bold italic text-promo-foreground">
        <AlertTriangle className="mr-1 inline h-5 w-5 -translate-y-0.5" /> 8% OFF $1,000+ ORDERS W/ CODE: VIP8
      </div>
      <div className="store-header-layout">
        <Link to="/cart" className="store-minimum bg-gradient-to-b from-minimum to-minimum-deep text-center font-bold text-primary-foreground">
          Minimum <br />Order Amount <br />$500
        </Link>

        <div className="store-brand-contact">
            <Link to="/" className="store-brand leading-none">
              <span className="store-brand-name block font-display font-bold tracking-tight text-primary">ARTISAN<span className="text-accent">MART</span></span>
            </Link>
        </div>
            <form role="search" className="store-search relative" onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav({ to: "/search", search: { q: q.trim() } }); }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products or item numbers" autoComplete="off" name="q" aria-label="Search products" className="h-[54px] w-full rounded-[20px] border border-border bg-secondary px-5 pr-14 font-arial text-lg outline-none focus:ring-2 focus:ring-ring" />
              <button disabled={!q.trim()} aria-label="Search" className="absolute right-4 top-1/2 -translate-y-1/2 disabled:opacity-70"><Search className="h-7 w-7" /></button>
            </form>
        <a className="store-call-button" href={BUSINESS_PHONE_HREF}><Phone size={20} aria-hidden="true"/><span><small>CALL US TODAY</small><strong>{BUSINESS_PHONE}</strong></span></a>
        <div className={`store-navigation-area${overflow.needed ? " has-overflow" : ""}`}>
          {overflow.needed && <div className="store-nav-controls" aria-label="Navigation scroll controls"><button type="button" aria-label="Scroll navigation left" aria-controls="store-nav-viewport" disabled={!overflow.left} onClick={() => scrollNavigation(-1)}><ChevronLeft size={18} aria-hidden="true" /></button><button type="button" aria-label="Scroll navigation right" aria-controls="store-nav-viewport" disabled={!overflow.right} onClick={() => scrollNavigation(1)}><ChevronRight size={18} aria-hidden="true" /></button></div>}
          <div id="store-nav-viewport" ref={navigation} className="store-header-scroll" tabIndex={0} role="region" aria-label="Product navigation">
          <nav ref={navItems} className="store-nav" aria-label="Main navigation">
            <button ref={catTrigger} onPointerEnter={() => openHover("cat")} aria-expanded={menu === "cat"} aria-controls="store-dropdown" onClick={(e) => { if (e.detail > 0 && window.matchMedia("(hover: hover)").matches) setMenu("cat"); else toggle("cat"); }} className="flex items-center">Categories <ChevronDown className="h-4 w-4" /></button>
            <button ref={priceTrigger} onPointerEnter={() => openHover("price")} aria-expanded={menu === "price"} aria-controls="store-dropdown" onClick={(e) => { if (e.detail > 0 && window.matchMedia("(hover: hover)").matches) setMenu("price"); else toggle("price"); }} className="flex items-center">Shop By Price <ChevronDown className="h-4 w-4" /></button>
            <Link to="/collection/$slug" params={{ slug: "imports" }}>Imports</Link>
            <Link to="/collection/$slug" params={{ slug: "closeouts" }}>Closeouts</Link>
            <Link to="/collection/$slug" params={{ slug: "best-sellers" }}>Best Sellers</Link>
            <Link to="/collection/$slug" params={{ slug: "reduced-price" }}>Reduced Price</Link>
            <Link to="/collection/$slug" params={{ slug: "new-arrivals" }}>New Arrivals</Link>
          </nav>
          </div>
        </div>
        <div className="store-utilities" role="group" aria-label="Customer links">
          <div className="store-utility-links">
            <Link className="store-mobile-hide" to="/careers">Careers</Link><Link to="/contact">Contact Us</Link>
            <button data-header-secondary="true" aria-expanded={menu === "kc"} aria-controls="store-dropdown" onClick={() => toggle("kc")} className="flex items-center">Knowledge Center <ChevronDown className="h-4 w-4" /></button>

          </div>
          <div className="store-account-links leading-tight">
            <Link to="/login">Login Or <br />Register</Link>
            <Link to="/cart" className="store-cart-button" aria-label={`Shopping cart, ${lines.length} products`}><span className="store-cart-icon"><ShoppingCart aria-hidden="true"/><b>{lines.length}</b></span><span>Cart</span></Link>
            <Link to="/newsletter" className="store-mobile-hide flex items-center gap-2"><Megaphone className="h-9 w-9 text-primary" /><span>Join Our <br />Newsletter</span></Link>
          </div>
        </div>
      </div>
      {menu && (
        <div id="store-dropdown" className={`store-dropdown store-dropdown-${menu}`} style={{ left: anchor.left, top: anchor.top, width: anchor.width }} onClick={() => setMenu(null)}>
          <div className="store-dropdown-surface">
            {menu === "cat" && (
              <div className="store-category-columns">
                {cols.map((c, i) => <ul key={i} className="space-y-2">{c.map((name) => (
                  <li key={name}><Link to="/category/$slug" params={{ slug: slugify(name) }} className="hover:underline">{name}</Link></li>))}</ul>)}
              </div>
            )}
            {menu === "price" && (
              <ul className="store-price-columns">{PRICE_BANDS.map((b) => (
                <li key={b.id}><Link to="/shop-by-price" search={{ price: b.id }} className="hover:underline">{b.label}</Link></li>))}</ul>
            )}
            {menu === "kc" && (
              <ul className="store-price-columns">{["Artisan Mart", "Sales", "Product Download", "Shipping", "Closeouts", "FBA Sales", "Community Outreach"].map((x) => (
                <li key={x}><Link to="/info/$page" params={{ page: slugify(x) }} className="hover:underline">{x}</Link></li>))}</ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
