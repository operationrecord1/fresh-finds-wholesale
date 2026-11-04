import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Info, Store, Heart, Package, BookOpen, ArrowUp, ShoppingBag, School, Building2, BriefcaseBusiness } from "lucide-react";
import "./AboutPage.css";
const sections = [
 { id: "about-us", label: "About Us", icon: Info },
 { id: "industries-served", label: "Industries Served", icon: Store },
 { id: "artisan-cares", label: "Artisan Cares", icon: Heart },
 { id: "easy-shipping", label: "Easy Shipping", icon: Package },
 { id: "careers", label: "Artisan Market Careers", icon: BriefcaseBusiness },
 { id: "blog", label: "Blog", icon: BookOpen },
];
export function AboutPage() {
 const [active, setActive] = useState("about-us");
 const hash = useLocation({ select: location => location.hash });
 useEffect(() => {
  if (!sections.some(section => section.id === hash)) return;
  const frame = requestAnimationFrame(() => {
   document.getElementById(hash)?.scrollIntoView({ block: "start", behavior: "instant" });
   setActive(hash);
  });
  return () => cancelAnimationFrame(frame);
 }, [hash]);
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
     <div className="distribution-intro"><span className="distribution-eyebrow">WHOLESALE DISTRIBUTION</span><h2 id="industries-title">Industries Served</h2><p className="about-lead">Merchandise for the way your business sells.</p><p>Artisan Mart sources and distributes general merchandise across product categories, helping businesses and resellers purchase for their own sales channels. Our approach brings product selection, ordering support and customer service together around your purchasing needs.</p></div>
     <div className="distribution-heading"><h3>Built around your business needs</h3><p>Explore assortments for your customers, your setting and your next purchasing cycle.</p></div>
     <div className="about-industry-grid">
      {[{title:"Retail & resale",icon:Store,items:["Variety and discount retail","Convenience and neighborhood stores","Gift, party and seasonal merchandise","Independent shops and market sellers"]},{title:"E-commerce & marketplaces",icon:ShoppingBag,items:["Independent online storefronts","Marketplace resale businesses","Category-focused online retailers","Seasonal and promotional assortments"]},{title:"Organizations & institutions",icon:School,items:["School and educational purchasing","Nonprofit and community organizations","Event and program supplies","Everyday operational merchandise"]},{title:"Specialty businesses",icon:Building2,items:["Home and household merchandise","Pet accessories and supplies","Office and everyday essentials","Recreation and lifestyle products"]}].map(({title,icon:Icon,items})=><article key={title} className="about-industry"><Icon aria-hidden="true"/><h3>{title}</h3><ul>{items.map(item=><li key={item}>{item}</li>)}</ul></article>)}
     </div>
     <div className="distribution-heading"><h3>Support throughout the purchasing process</h3></div>
     <div className="distribution-blocks">{[{title:"Purchasing",text:"Discuss product requirements, review available assortments and compare item details against your business priorities."},{title:"Ordering",text:"Review quantities, pack sizes and order requirements so purchasing decisions are clear before proceeding."},{title:"Customer service",text:"Work with our team on product and order questions, with clear communication and a focus on dependable business relationships."}].map(({title,text})=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
     <div className="distribution-note"><h3>A relationship built for the long term</h3><p>We approach wholesale as an ongoing business relationship. Understanding your purchasing priorities and communicating clearly are central to how we support your business. Product availability, pack sizes and minimum quantities vary by item.</p></div>
    </section>
    <section id="artisan-cares" tabIndex={-1} className="about-section" aria-labelledby="cares-title">
     <div className="editorial-intro"><span className="distribution-eyebrow">ARTISAN CARES</span><h2 id="cares-title">Care that starts with understanding.</h2><p className="about-lead">A considered approach to business and community needs.</p><p>Artisan Cares reflects our intention to build thoughtful relationships with the people and organizations around our business. We begin by listening, understanding practical needs and being clear about the support we can provide.</p></div>
     <div className="cares-principles">{[{title:"Listen first",text:"Understand an organization's purpose, the people it serves and the merchandise it needs before discussing possible next steps."},{title:"Plan responsibly",text:"Consider item suitability, quantities, timing and purchasing requirements. Keep expectations clear throughout the conversation."},{title:"Communicate openly",text:"Explain what is available, what needs confirmation and how an inquiry will move forward. Build trust through respectful communication."}].map(({title,text},i)=><article key={title}><span className="editorial-number">0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
     <div className="editorial-panel"><h3>Starting a community conversation</h3><p>For an organizational inquiry, share your organization's name, the purpose of your request, the product categories and quantities you are considering, and your preferred timeline. These details provide a useful starting point for a focused discussion.</p><Link className="about-action" to="/contact">Contact our team</Link></div>
     <div className="editorial-status"><h3>Program updates</h3><p>No active donation program or charitable partnership is currently announced. Any future initiative will be described here with its purpose, eligibility and participation details once confirmed.</p></div>
    </section>
    <section id="easy-shipping" tabIndex={-1} className="about-section" aria-labelledby="shipping-title">
     <h2 id="shipping-title">EASY SHIPPING</h2><p className="about-lead">Know what to check before your order ships.</p>
     <div className="about-shipping-grid"><div><span className="about-step">01</span><h3>Check your items</h3><p>Review each item's available quantity, lot size and minimum order quantity. A purchasing case and a physical shipping carton may have different quantities.</p></div><div><span className="about-step">02</span><h3>Confirm delivery details</h3><p>Have the destination address, postal code and any delivery requirements ready when discussing your order.</p></div><div><span className="about-step">03</span><h3>Review the shipping terms</h3><p>Carrier options, freight services, delivery times and charges will be published when confirmed. No shipping rate or delivery date is guaranteed here.</p></div></div>
    </section>
    <section id="careers" tabIndex={-1} className="about-section" aria-labelledby="careers-title">
     <div className="distribution-intro"><span className="distribution-eyebrow">CAREERS AT ARTISAN MART</span><h2 id="careers-title">Build strong business relationships.</h2><p className="about-lead">Bring care, clarity and accountability to wholesale.</p><p>Our work connects merchandise sourcing and distribution with the businesses that rely on it. Professional purchasing support, accurate order information and responsive customer service are central to that work.</p></div>
     <div className="distribution-heading"><h3>The work behind the service</h3><p>These areas describe the work of our business, rather than advertised vacancies.</p></div>
     <div className="distribution-blocks">{[{title:"Sourcing & merchandising",text:"Understand product categories, organize merchandise information and connect assortment decisions to business purchasing needs."},{title:"Sales & customer support",text:"Listen carefully, communicate product and order information clearly, and help build lasting customer relationships."},{title:"Order coordination",text:"Bring attention to detail, clear documentation and responsible follow-through to the ordering process."}].map(({title,text})=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
     <div className="distribution-note"><h3>How we approach our work</h3><ul className="distribution-values"><li><strong>Professional communication</strong><span>Be clear, respectful and attentive to the needs of business customers.</span></li><li><strong>Accuracy & accountability</strong><span>Check the details, take ownership and follow through on commitments.</span></li><li><strong>Long-term relationships</strong><span>Approach each interaction with care for the partnership beyond a single order.</span></li></ul></div>
     <div className="about-guide distribution-openings"><span className="about-guide-label">CURRENT OPPORTUNITIES</span><h3>No open positions are currently listed.</h3><p>When a position is published, its listing will describe the responsibilities, requirements, work location and application process.</p><h3>Preparing for an opportunity</h3><p>Keep an up-to-date resume highlighting relevant experience, customer service skills and operational responsibilities. Follow the application instructions provided with each published role.</p></div>
    </section>
    <section id="blog" tabIndex={-1} className="about-section" aria-labelledby="blog-title">
     <div className="editorial-intro"><span className="distribution-eyebrow">THE ARTISAN MART JOURNAL</span><h2 id="blog-title">Practical perspectives on wholesale.</h2><p className="about-lead">Clear information for better purchasing conversations.</p><p>Explore the details behind product selection, order planning and ongoing business relationships. These guides explain how to prepare a wholesale purchase and what to discuss with our team.</p></div>
     <article className="journal-article" aria-labelledby="buying-guide-title"><header><span className="about-guide-label">PURCHASING GUIDE</span><h3 id="buying-guide-title">From product shortlist to a clear wholesale order</h3><p className="journal-summary">A useful assortment starts with your customers. A well-prepared order turns that understanding into specific products, quantities and questions.</p></header><div className="journal-body"><h4>Start with the sales channel</h4><p>Consider where you will sell the merchandise and what your customers need. A retail shelf, an online storefront and a seasonal event can call for different product selections. Compare the item's dimensions, features and packaging with the way you intend to present it.</p><h4>Read quantity information together</h4><p>Review the unit price, minimum purchase quantity and lot increment as a set. A case quantity may differ from a shipping carton quantity. Use the product's stated ordering requirements rather than assuming that one box equals one purchasing unit.</p><h4>Build a specific shortlist</h4><p>Record the item number, requested quantity and any product questions. Note whether you are comparing alternatives or planning repeat purchases. A clear shortlist helps our team understand the scope of your inquiry and discuss available options.</p><aside className="journal-callout"><strong>Before moving forward</strong><ul><li>Confirm the selected item and required quantity.</li><li>Review product details and purchase increments.</li><li>Clarify availability, delivery requirements and applicable charges.</li><li>Resolve outstanding questions before confirming the order.</li></ul></aside><h4>Keep the conversation connected</h4><p>Retain your item references and order information for follow-up questions. When your requirements change, explain the revised quantity, timing or assortment so the next discussion starts with accurate information.</p></div></article>
     <article className="journal-article" aria-labelledby="relationship-guide-title"><header><span className="about-guide-label">BUSINESS RELATIONSHIPS</span><h3 id="relationship-guide-title">Making the next purchasing conversation more productive</h3><p className="journal-summary">Long-term wholesale relationships benefit from clear priorities and consistent communication.</p></header><div className="journal-body"><h4>Share what matters to your business</h4><p>Let our team know which categories you are exploring, the quantities you are considering and the questions affecting your decision. This helps keep purchasing support relevant to your sales channel and operating needs.</p><h4>Separate requirements from preferences</h4><p>Identify the details that are essential, such as a specific product type or purchase quantity, and those where alternatives may work. Product availability changes, so confirm the details for each order rather than relying on a previous purchase.</p><h4>Use feedback to improve planning</h4><p>Keep notes on product suitability and the questions that came up during ordering. Bring that feedback into future discussions. Our focus is professional purchasing support, clear order communication and customer service that supports an ongoing business relationship.</p></div></article>
    </section>
   </div>
  </div>
 </main>;
}
