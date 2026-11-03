import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Info, Store, Heart, Package, BookOpen, ArrowUp, ShoppingBag, School, Building2 } from "lucide-react";
import "./AboutPage.css";
const sections = [
 { id: "about-us", label: "About Us", icon: Info },
 { id: "industries-served", label: "Industries Served", icon: Store },
 { id: "artisan-cares", label: "Artisan Cares", icon: Heart },
 { id: "easy-shipping", label: "Easy Shipping", icon: Package },
 { id: "blog", label: "Blog", icon: BookOpen },
];
export function AboutPage() {
 const [active, setActive] = useState("about-us");
 useEffect(() => {
  const observer = new IntersectionObserver(entries => {
   for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
  }, { rootMargin: "-10% 0px -65% 0px", threshold: 0 });
  sections.forEach(({id})=>{const el=document.getElementById(id);if(el)observer.observe(el);});
  return ()=>observer.disconnect();
 }, []);
 return <main className="about-page">
  <nav className="about-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">About Us</span></nav>
  <div className="about-layout">
   <nav className="about-nav" aria-label="About Us sections">
    {sections.map(({id,label,icon:Icon})=><a key={id} href={`#${id}`} aria-current={active===id?"location":undefined} onClick={()=>setActive(id)}><Icon aria-hidden="true"/><span>{label}</span></a>)}
    <a className="about-back" href="#about-us"><ArrowUp size={16} aria-hidden="true"/>Back to top</a>
   </nav>
   <div className="about-content">
    <section id="about-us" tabIndex={-1} className="about-section about-overview" aria-labelledby="about-title">
     <h1 id="about-title">ABOUT US</h1><p className="about-lead">Wholesale essentials. Clear choices. A better way to buy in bulk.</p>
     <div className="about-brand-panel"><ShoppingBag size={48} aria-hidden="true"/><strong>ARTISAN <span>MARKET</span></strong><p>General merchandise for your next opportunity.</p></div>
     <p>Artisan Market brings general merchandise, imports and closeouts into one place. Browse by category, compare item details and plan purchases around your business needs.</p>
     <p>Our focus is a straightforward wholesale experience: clear product information, visible quantities and an easy path from browsing to building an order.</p>
     <Link className="about-action" to="/collection/$slug" params={{slug:"imports"}}>Explore the catalog</Link>
    </section>
    <section id="industries-served" tabIndex={-1} className="about-section" aria-labelledby="industries-title">
     <h2 id="industries-title">INDUSTRIES SERVED</h2><p className="about-lead">Different businesses. Everyday merchandise needs.</p><p>Explore merchandise for retail shelves, online storefronts and organizational purchasing. Product availability, pack sizes and minimum quantities vary by item.</p>
     <div className="about-industry-grid">
      {[{title:"Retail & resale",icon:Store,items:["Variety and discount stores","Convenience stores","Gift and party shops","Market stalls"]},{title:"Online businesses",icon:ShoppingBag,items:["Independent online stores","Marketplace sellers","Specialty retailers","Seasonal sellers"]},{title:"Organizations",icon:School,items:["Schools and educational groups","Nonprofit organizations","Community groups","Event organizers"]},{title:"Specialty & everyday",icon:Building2,items:["Pet supply shops","Office supply businesses","Home and household stores","Sporting goods retailers"]}].map(({title,icon:Icon,items})=><div key={title} className="about-industry"><Icon aria-hidden="true"/><h3>{title}</h3><ul>{items.map(item=><li key={item}>{item}</li>)}</ul></div>)}
     </div>
    </section>
    <section id="artisan-cares" tabIndex={-1} className="about-section" aria-labelledby="cares-title">
     <h2 id="cares-title">ARTISAN CARES</h2><p className="about-lead">Our community matters.</p>
     <div className="about-care-panel"><Heart size={48} aria-hidden="true"/><div><h3>Thoughtful support starts with listening.</h3><p>Artisan Cares is the space for our future community initiatives, organizational partnerships and opportunities to give back.</p></div></div>
     <p>As programs are established, we will share their purpose, participation details and updates here. No active donation program or charitable partnership is currently announced.</p>
    </section>
    <section id="easy-shipping" tabIndex={-1} className="about-section" aria-labelledby="shipping-title">
     <h2 id="shipping-title">EASY SHIPPING</h2><p className="about-lead">Know what to check before your order ships.</p>
     <div className="about-shipping-grid"><div><span className="about-step">01</span><h3>Check your items</h3><p>Review each item's available quantity, lot size and minimum order quantity. A purchasing case and a physical shipping carton may have different quantities.</p></div><div><span className="about-step">02</span><h3>Confirm delivery details</h3><p>Have the destination address, postal code and any delivery requirements ready when discussing your order.</p></div><div><span className="about-step">03</span><h3>Review the shipping terms</h3><p>Carrier options, freight services, delivery times and charges will be published when confirmed. No shipping rate or delivery date is guaranteed here.</p></div></div>
    </section>
    <section id="blog" tabIndex={-1} className="about-section" aria-labelledby="blog-title">
     <h2 id="blog-title">BLOG</h2><p className="about-lead">Notes for smarter wholesale buying.</p>
     <div className="about-guide"><span className="about-guide-label">BUYING BASICS</span><h3>Understand the quantity before you buy</h3><p>A unit price is only one part of a wholesale purchase. Check the minimum order quantity and the required lot increment alongside the price.</p><p>Keep purchasing quantities separate from carton quantities. When the two differ, use the product's stated buying rules to plan the order.</p></div>
     <div className="about-guide"><span className="about-guide-label">ORDER PLANNING</span><h3>Build a useful product shortlist</h3><p>Save the item number, quantity needed and intended use for each product. Comparing this information makes it easier to choose between similar items and prepare an accurate inquiry.</p></div>
    </section>
   </div>
  </div>
 </main>;
}
