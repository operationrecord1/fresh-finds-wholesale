import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { PRICE_BANDS, type Product, type Badge } from "@/data/catalog";
import { ProductCard } from "./ProductCard";
import { QuickView } from "./LazyQuickView";
import { useIncrementalProducts } from "@/lib/useIncrementalProducts";
import "./ProductFilters.css";

const SPECIAL_OPTIONS: {value: Badge; label: string}[] = [
  {value:"new",label:"New Arrivals"}, {value:"hot",label:"Hot Items"},
  {value:"closeout",label:"Closeouts"}, {value:"reduced",label:"Reduced Price"},
  {value:"special",label:"Special"},
];
const QUICK_LINKS = [
  {slug:"best-sellers",label:"Best Sellers"},
  {slug:"new-arrivals",label:"New Items"},
  {slug:"reduced-price",label:"Reduced Price"},
  {slug:"closeouts",label:"Closeouts"},
  {slug:"imports",label:"Imports"},
] as const;

/** Keep the original category-specific default ordering without any sorting UI. */
function initialOrder(list: Product[], sort: string): Product[] {
  const a=[...list];
  const pr=(p:Product)=>p.price??Infinity;
  switch(sort){
    case "price-asc": return a.sort((x,y)=>pr(x)-pr(y));
    case "price-desc": return a.sort((x,y)=>(y.price??-1)-(x.price??-1));
    case "qty-desc": return a.sort((x,y)=>(y.stock??-1)-(x.stock??-1));
    case "sku-asc": return a.sort((x,y)=>x.sku.localeCompare(y.sku));
    case "sku-desc": return a.sort((x,y)=>y.sku.localeCompare(x.sku));
    case "newest": return a.sort((x,y)=>(x.newestRank??999)-(y.newestRank??999));
    case "special": return a.sort((x,y)=>Number(y.badges.includes("special")||y.badges.includes("reduced"))-Number(x.badges.includes("special")||x.badges.includes("reduced")));
    default: return a;
  }
}

type FilterGroup = "price" | "special" | "subcategory";
type Option = {value: string; label: string; count: number};
function FilterAccordion({title,options,active,onSelect,expanded,onToggle,id}:{
  title:string;options:Option[];active:string|null;
  onSelect:(value:string|null)=>void;expanded:boolean;onToggle:()=>void;id:string;
}){
  return <section className="store-filter-group" aria-label={title}>
    <h3>
      <button type="button" className="store-filter-heading" aria-expanded={expanded}
        aria-controls={id} onClick={onToggle}>
        <span>{title}</span><ChevronDown aria-hidden="true" size={18} className={expanded?"store-filter-chevron is-expanded":"store-filter-chevron"}/>
      </button>
    </h3>
    {expanded&&<div id={id} className="store-filter-options" role="group" aria-label={title}>
      {options.length?options.map(opt=><button type="button" key={opt.value}
        className={active===opt.value?"store-filter-option is-selected":"store-filter-option"}
        aria-pressed={active===opt.value}
        onClick={()=>onSelect(active===opt.value?null:opt.value)}>
        <span className="store-filter-option-label">{opt.label}</span>
        <span className="store-filter-option-count">{opt.count}</span>
      </button>):<p className="store-filter-empty">No options in this listing</p>}
    </div>}
  </section>;
}

export function ProductListing({ products, banner, defaultSort = "position", initialPrice }: {
  products:Product[];banner:ReactNode;defaultSort?:string;initialPrice?:string|undefined;
}){
  const panelId=useId();
  const priceId=useId(),specialId=useId(),subId=useId();
  const path=useLocation({select:loc=>loc.pathname});
  const activeCollection=path.match(/^\/collection\/([^/]+)\/?$/)?.[1]??"";
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [expanded,setExpanded]=useState<FilterGroup|null>(null);
  const [price,setPrice]=useState<string|null>(initialPrice??null);
  const [special,setSpecial]=useState<Badge|null>(null);
  const [sub,setSub]=useState<string|null>(null);
  const [qv,setQv]=useState<Product|null>(null);

  useEffect(()=>{
    setPrice(initialPrice??null);setSpecial(null);setSub(null);setExpanded(null);setFiltersOpen(false);
  },[initialPrice,defaultSort]);
  useEffect(()=>{
    if(!filtersOpen)return;
    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setFiltersOpen(false);};
    document.addEventListener("keydown",onKey);
    return()=>document.removeEventListener("keydown",onKey);
  },[filtersOpen]);

  const priceOptions=useMemo<Option[]>(()=>PRICE_BANDS.map(b=>({
    value:b.id,label:b.label,count:products.filter(p=>p.price!=null&&p.price>=b.min&&p.price<=b.max).length,
  })).filter(o=>o.count>0),[products]);
  const specialOptions=useMemo<Option[]>(()=>SPECIAL_OPTIONS.map(o=>({
    value:o.value,label:o.label,count:products.filter(p=>p.badges.includes(o.value)).length,
  })).filter(o=>o.count>0),[products]);
  const subOptions=useMemo<Option[]>(()=>{
    const counts=new Map<string,number>();
    for(const p of products){const s=p.subcategory??p.category;if(s)counts.set(s,(counts.get(s)??0)+1);}
    return [...counts].sort(([a],[b])=>a.localeCompare(b)).map(([value,count])=>({value,label:value,count}));
  },[products]);
  const filtered=useMemo(()=>{
    const list=products.filter(p=>{
      const band=price?PRICE_BANDS.find(b=>b.id===price):null;
      return (!price||(!!band&&p.price!=null&&p.price>=band.min&&p.price<=band.max))
        &&(!special||p.badges.includes(special))
        &&(!sub||(p.subcategory??p.category)===sub);
    });
    return initialOrder(list,defaultSort);
  },[products,price,special,sub,defaultSort]);
  const resultKey=JSON.stringify([price,special,sub,defaultSort,filtered.map(p=>p.sku)]);
  const {count:shown,hasMore,pending,sentinel,loadMore}=useIncrementalProducts(filtered.length,resultKey);
  const clear=()=>{setPrice(null);setSpecial(null);setSub(null);};
  const clearActive=!!(price||special||sub);
  const toggle=(name:FilterGroup)=>setExpanded(prev=>prev===name?null:name);

  const filterPanel=(mode:"mobile"|"desktop")=><div className="store-filters-panel-inner">
    <div className="store-filters-panel-top">
      <strong>Filter Products</strong>
      <button type="button" className="store-filter-clear" onClick={clear} disabled={!clearActive}>Clear All</button>
      <button type="button" className="store-filter-close" aria-label="Close filters" onClick={()=>setFiltersOpen(false)}><X size={20}/></button>
    </div>
    <FilterAccordion title="Filter by Price" options={priceOptions} active={price}
      onSelect={setPrice} expanded={expanded==="price"} onToggle={()=>toggle("price")} id={priceId+"-"+mode}/>
    <FilterAccordion title="Filter by Special Options" options={specialOptions} active={special}
      onSelect={v=>setSpecial(v as Badge|null)} expanded={expanded==="special"} onToggle={()=>toggle("special")} id={specialId+"-"+mode}/>
    <FilterAccordion title="Filter by Subcategory" options={subOptions} active={sub}
      onSelect={setSub} expanded={expanded==="subcategory"} onToggle={()=>toggle("subcategory")} id={subId+"-"+mode}/>
  </div>;

  return <div className="store-container store-listing py-4">
    <div className="store-filter-mobile-toolbar">
      <button type="button" className="store-filter-trigger" aria-label="Open filters"
        aria-expanded={filtersOpen} aria-controls={panelId}
        onClick={()=>{setExpanded(null);setFiltersOpen(prev=>!prev);}}>
        <SlidersHorizontal size={20} aria-hidden="true"/>
      </button>
      <nav className="store-quick-navigation" aria-label="Quick product navigation">
        {QUICK_LINKS.filter(item=>item.slug!==activeCollection).map(item=>
          <Link key={item.slug} to="/collection/$slug" params={{slug:item.slug}}
            className="store-quick-navigation-link">{item.label}</Link>)}
      </nav>
      {filtersOpen&&<>
        <button type="button" className="store-filter-outside" aria-label="Close filters outside panel"
          onClick={()=>setFiltersOpen(false)}/>
        <div id={panelId} className="store-filter-popover" role="dialog" aria-modal="false" aria-label="Product filters">
          {filterPanel("mobile")}
        </div>
      </>}
    </div>
    <aside className="store-filters-desktop" aria-label="Product filters">
      {filterPanel("desktop")}
    </aside>
    <div className="min-w-0 flex-1">
      {banner}
      <div className="store-catalog-grid mt-4 grid" aria-busy={pending}>
        {filtered.slice(0,shown).map(p=><ProductCard key={p.sku} p={p} onQuickView={setQv}/>)}
      </div>
      {filtered.length===0&&<p className="mt-8 text-center">No products match these filters.</p>}
      <div ref={sentinel} className="h-8"/>
      {hasMore&&<button type="button" disabled={pending}
        className="mx-auto block rounded border bg-white px-5 py-3"
        onClick={loadMore}>{pending?"Loading products...":"Load more products"}</button>}
      <p className="my-4 text-center text-sm text-muted-foreground" role="status">
        Showing {Math.min(shown,filtered.length)} of {filtered.length} products
      </p>
    </div>
    <QuickView p={qv} onClose={()=>setQv(null)}/>
  </div>;
}

export function Banner({ kind, title }: { kind: string; title: string }) {
  const cls: Record<string, string> = { new: "bg-sky text-sec-closeout", best: "bg-best-banner text-primary-foreground", closeout: "bg-promo text-hero", reduced: "bg-sec-reduced text-primary-foreground", imports: "bg-hero text-primary-foreground", plain: "bg-primary text-primary-foreground" };
  return <div className={`rounded py-2 text-center font-display text-4xl font-bold uppercase italic tracking-wide md:text-5xl ${cls[kind] ?? cls["plain"]}`}>{title}</div>;
}
