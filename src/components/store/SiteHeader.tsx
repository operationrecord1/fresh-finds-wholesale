import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, Phone, Search, ChevronDown, Megaphone, X } from "lucide-react";
import { CATEGORIES, PRICE_BANDS, slugify } from "@/data/catalog";
import { BUSINESS_PHONE, BUSINESS_PHONE_HREF } from "@/lib/business";
import "./SiteHeader.css";
import { MiniCart } from "./MiniCart";
import { CustomerAccountMenu } from "./CustomerAccountMenu";
import { useArtisanAuth } from "@/lib/artisan-auth";

export function SiteHeader() {
  const {user}=useArtisanAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const mobilePanel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!mobileOpen) return;
    const outside = (e: PointerEvent) => { if (!mobilePanel.current?.contains(e.target as Node) && !mobileToggle.current?.contains(e.target as Node)) setMobileOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") { setMobileOpen(false); mobileToggle.current?.focus(); } };
    const resize = () => { if (window.innerWidth >= 760) setMobileOpen(false); };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape); window.addEventListener("resize", resize);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); window.removeEventListener("resize", resize); };
  }, [mobileOpen]);
  const [q, setQ] = useState("");
  const [menu, updateMenu] = useState<null | "cat" | "price" | "kc">(null);
  const activeMenu = useRef<typeof menu>(null);
  const setMenu = (next: typeof menu) => { activeMenu.current = next; updateMenu(next); };
  const header = useRef<HTMLElement>(null);
  const catTrigger = useRef<HTMLButtonElement>(null);
  const priceTrigger = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState({ left: 12, top: 0, width: 360 });
  const kcTrigger = useRef<HTMLButtonElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);
  const openHover = (next: "cat" | "price" | "kc") => {
    if (window.matchMedia("(hover: hover)").matches) setMenu(next);
  };
  useEffect(() => {
    const triggers = { cat: catTrigger, price: priceTrigger, kc: kcTrigger };
    const leaveRegion = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = event.target as Node;
      // Resolve the new trigger first; an old menu cannot close its replacement.
      for (const key of ["cat", "price", "kc"] as const) {
        if (triggers[key].current?.contains(target)) { setMenu(key); return; }
      }
      if (activeMenu.current && !dropdown.current?.contains(target)) setMenu(null);
    };
    const outside = (event: PointerEvent) => {
      if (!Object.values(triggers).some(ref => ref.current?.contains(event.target as Node)) &&
          !dropdown.current?.contains(event.target as Node)) setMenu(null);
    };
    document.addEventListener("pointermove", leaveRegion);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("pointermove", leaveRegion);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  const navigation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenu(null);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(null); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", escape); };
  }, []);
  useLayoutEffect(() => {
    if (!menu) return;
    const position = () => {
      const h = header.current?.getBoundingClientRect();
      const trigger = ({ cat: catTrigger, price: priceTrigger, kc: kcTrigger }[menu]).current?.getBoundingClientRect();
      if (!h) return;
      const width = Math.min(menu === "cat" ? 1100 : menu === "kc" ? (trigger?.width ?? 160) : 370, h.width - 24);
      const left = Math.max(12, Math.min((trigger?.left ?? h.left + 12) - h.left, h.width - width - 12));
      setAnchor({ left, top: (trigger?.bottom ?? h.bottom) - h.top, width });
    };
    position();
    window.addEventListener("resize", position);
    const viewport = navigation.current;
    viewport?.addEventListener("scroll", position);
    return () => { window.removeEventListener("resize", position); viewport?.removeEventListener("scroll", position); };
  }, [menu]);
  const nav = useNavigate();
  const toggle = (m: typeof menu) => setMenu(menu === m ? null : m);
  const cols = Array.from({ length: 7 }, (_, i) => CATEGORIES.slice(i * 5, i * 5 + 5));

  return (
    <header onPointerLeave={(e) => { if (e.pointerType === "mouse") setMenu(null); }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMenu(null); }} ref={header} className={`store-header relative z-40 bg-card shadow-sm${user?" store-header-signed-in":""}`}>
      <div className="store-header-layout">
        <button ref={mobileToggle} className="store-mobile-menu-toggle" type="button" aria-label="Browse products menu" aria-expanded={mobileOpen} aria-controls="store-mobile-menu" onClick={() => { setMobileOpen(!mobileOpen); setMenu(null); }}><Menu aria-hidden="true" /></button>
        <Link to="/cart" className="store-minimum bg-gradient-to-b from-minimum to-minimum-deep text-center font-bold text-primary-foreground">
          Minimum <br />Order Amount <br /> $500
        </Link>

        <div className="store-brand-contact">
            <Link to="/" className="store-brand leading-none" aria-label="Artisan Mart home" draggable={false} onDragStart={(e) => e.preventDefault()}>
              <img className="artisan-wordmark" src={`${import.meta.env.BASE_URL}artisan-mart-approved.svg`} alt="Artisan Mart" draggable={false} onDragStart={(e) => e.preventDefault()} />
            </Link>
        </div>
            <form role="search" className="store-search relative" onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav({ to: "/search", search: { q: q.trim() } }); }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" autoComplete="off" name="q" aria-label="Search products" className="h-[54px] w-full rounded-[20px] border border-border bg-secondary px-5 pr-14 font-arial text-lg" />
              <button disabled={!q.trim()} aria-label="Search" className="absolute right-4 top-1/2 -translate-y-1/2 disabled:opacity-70"><Search className="h-7 w-7" /></button>
            </form>
        <a className="store-call-button" href={BUSINESS_PHONE_HREF}><Phone size={20} aria-hidden="true"/><span><small>CALL US TODAY</small><strong>{BUSINESS_PHONE}</strong></span></a>
        <div className="store-navigation-area">
          <div id="store-nav-viewport" ref={navigation} className="store-header-scroll" tabIndex={0} role="region" aria-label="Product navigation">
          <nav className="store-nav" aria-label="Main navigation">
            <button ref={catTrigger} onPointerEnter={() => openHover("cat")} aria-expanded={menu === "cat"} aria-controls="store-dropdown" onClick={(e) => { if (e.detail > 0 && window.matchMedia("(hover: hover)").matches) setMenu("cat"); else toggle("cat"); }} className="flex items-center">Categories <ChevronDown className="h-4 w-4" /></button>
            <button ref={priceTrigger} onPointerEnter={() => openHover("price")} aria-expanded={menu === "price"} aria-controls="store-dropdown" onClick={(e) => { if (e.detail > 0 && window.matchMedia("(hover: hover)").matches) setMenu("price"); else toggle("price"); }} className="flex items-center">Shop By Price <ChevronDown className="h-4 w-4" /></button>
            <Link className="store-nav-imports" to="/collection/$slug" params={{ slug: "imports" }}>Imports</Link>
            <Link className="store-nav-closeouts" to="/collection/$slug" params={{ slug: "closeouts" }}>Closeouts</Link>
            <Link to="/collection/$slug" params={{ slug: "best-sellers" }}>Best Sellers</Link>
            <Link to="/collection/$slug" params={{ slug: "reduced-price" }}>Reduced Price</Link>
            <Link to="/collection/$slug" params={{ slug: "new-arrivals" }}>New Arrivals</Link>
          </nav>
          </div>
        </div>
        <div className="store-utilities" role="group" aria-label="Customer links">
          <div className="store-utility-links">
            <Link className="store-mobile-hide" to="/careers">Careers</Link><Link to="/contact">Contact Us</Link>
            <button ref={kcTrigger} onPointerEnter={() => openHover("kc")} data-header-secondary="true" aria-expanded={menu === "kc"} aria-controls="store-dropdown" onClick={(e) => { if (e.detail > 0 && window.matchMedia("(hover: hover)").matches) setMenu("kc"); else toggle("kc"); }} className="flex items-center">Knowledge Center <ChevronDown className="h-4 w-4" /></button>

          </div>
          <div className="store-account-links leading-tight">
            <CustomerAccountMenu />
            {user&&<Link to="/account" hash="orders" className="store-orders-link">Orders</Link>}
            <MiniCart />
            {!user&&<Link to="/newsletter" className="store-mobile-hide flex items-center gap-2"><Megaphone className="h-9 w-9 text-primary" /><span>Join Our <br />Newsletter</span></Link>}
          </div>
        </div>
      </div>
      {mobileOpen && <nav ref={mobilePanel} id="store-mobile-menu" className="store-mobile-menu" aria-label="Browse products" onClick={e => { if ((e.target as HTMLElement).closest('a')) setMobileOpen(false); }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node) && e.relatedTarget !== mobileToggle.current) setMobileOpen(false); }}>
        <div className="store-mobile-menu-heading"><strong>Browse products</strong><button type="button" aria-label="Close menu" onClick={() => { setMobileOpen(false); mobileToggle.current?.focus(); }}><X aria-hidden="true" /></button></div>
        <div className="store-mobile-account"><CustomerAccountMenu fullName /></div>
        {user&&<Link to="/account" hash="orders">Orders</Link>}
        <details><summary>Categories</summary><div>{CATEGORIES.map(name => <Link key={name} to="/category/$slug" params={{slug:slugify(name)}}>{name}</Link>)}</div></details>
        <details><summary>Shop By Price</summary><div>{PRICE_BANDS.map(b => <Link key={b.id} to="/shop-by-price" search={{price:b.id}}>{b.label}</Link>)}</div></details>
        {([['imports','Imports'],['closeouts','Closeouts'],['best-sellers','Best Sellers'],['reduced-price','Reduced Price'],['new-arrivals','New Arrivals']] as const).map(([slug,label]) => <Link key={slug} to="/collection/$slug" params={{slug}}>{label}</Link>)}
        <Link to="/careers">Careers</Link><Link to="/contact">Contact Us</Link>
        <details><summary>Knowledge Center</summary><div>{["Artisan Mart", "Shipping", "Closeouts"].map(name => <Link key={name} to="/info/$page" params={{page:slugify(name)}}>{name}</Link>)}</div></details>
        {!user&&<Link to="/newsletter">Join Our Newsletter</Link>}
      </nav>}
      {menu && (
        <div ref={dropdown} id="store-dropdown" className={`store-dropdown store-dropdown-${menu}`} style={{ left: anchor.left, top: anchor.top, width: anchor.width }} onClick={() => setMenu(null)}>
          <div className="store-dropdown-surface">
            {menu === "cat" && (
              <>
              <div className="store-category-columns">
                {cols.map((c, i) => <ul key={i} className="space-y-2">{c.map((name) => (
                  <li key={name}><Link to="/category/$slug" params={{ slug: slugify(name) }} className="hover:underline">{name}</Link></li>))}</ul>)}
              </div>
              <div className="store-category-collections"><Link to="/collection/$slug" params={{slug:"closeouts"}}>Closeouts</Link><Link to="/collection/$slug" params={{slug:"imports"}}>Imports</Link></div>
              </>
            )}
            {menu === "price" && (
              <ul className="store-price-columns">{PRICE_BANDS.map((b) => (
                <li key={b.id}><Link to="/shop-by-price" search={{ price: b.id }} className="hover:underline">{b.label}</Link></li>))}</ul>
            )}
            {menu === "kc" && (
              <ul className="store-price-columns">{["Artisan Mart", "Shipping", "Closeouts"].map((x) => (
                <li key={x}><Link to="/info/$page" params={{ page: slugify(x) }} className="hover:underline">{x}</Link></li>))}</ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
