import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Mail, MessageSquare, Package, ArrowRight } from "lucide-react";
import { meta } from "@/components/store/SimplePage";
import "@/components/store/ContactPage.css";

export const Route = createFileRoute("/contact")({ head: () => meta("Contact Us", "Contact Artisan Market about wholesale products, orders and closeouts."), component: Contact });
function Contact() {
 const [topic, setTopic] = useState("new");
 const [ticket, setTicket] = useState<string | null>(null);
 return <main className="contact-page">
  <nav className="contact-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Contact Us</span></nav>
  <header className="contact-intro"><span className="contact-eyebrow">LET'S TALK WHOLESALE</span><h1>How can we help?</h1><p>Questions about products, an order, or selling your closeouts? You're in the right place.</p></header>
  <div className="contact-layout">
   <section className="contact-form-card" aria-labelledby="contact-form-title">
    <h2 id="contact-form-title">Contact Us</h2><p className="contact-muted">Choose your inquiry type and tell us what you need.</p>
    <div className="contact-topics" role="group" aria-label="Inquiry type">{[{id:"new",label:"New order inquiry",icon:MessageSquare},{id:"existing",label:"Existing order inquiry",icon:Package}].map(({id,label,icon:Icon})=><button key={id} type="button" aria-pressed={topic===id} onClick={()=>{setTopic(id);setTicket(null);}}><Icon size={19} aria-hidden="true"/>{label}</button>)}</div>
    <form onChange={()=>setTicket(null)} onSubmit={e=>{
      e.preventDefault();
      if (ticket) return;
      const date = new Date().toISOString().slice(0,10).replaceAll("-", "");
      const unique = crypto.randomUUID().replaceAll("-", "").toUpperCase();
      setTicket(`AM-${topic === "new" ? "N" : "E"}-${date}-${unique}`);
     }}>
     <div className="contact-fields"><label>Full name <span>*</span><input name="name" autoComplete="name" required maxLength={120}/></label><label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label>Company <small>(optional)</small><input name="company" autoComplete="organization" maxLength={160}/></label><label>Phone <small>(optional)</small><input name="phone" type="tel" autoComplete="tel" maxLength={40}/></label></div>
     {topic==="existing"&&<label className="contact-order">Order number <span>*</span><input name="order" required maxLength={80}/></label>}
     <label>Your message <span>*</span><textarea name="message" rows={5} required maxLength={5000} placeholder={topic==="existing"?"Tell us what you need help with regarding your order.":"Include product names, item numbers or quantities, if available."}/></label>
     <p className="contact-form-note" id="contact-delivery-note">Prepare a ticket reference for your inquiry. Online delivery is not available yet; your message will not be sent.</p>
     <button className="contact-primary" aria-describedby="contact-delivery-note" type="submit" disabled={!!ticket}>{ticket ? "Reference prepared" : "Review message"} <ArrowRight size={17} aria-hidden="true"/></button>
     {ticket&&<section className="contact-status contact-ticket" role="status" aria-live="polite" aria-label="Ticket reference">
      <span className="contact-ticket-label">YOUR TICKET REFERENCE</span>
      <strong className="contact-ticket-number">{ticket}</strong>
      <p>{topic === "new" ? "New order inquiry" : "Existing order inquiry"} · Awaiting delivery</p>
      <p>Keep this reference for your records. It was generated in this browser; your message has not been delivered to our team.</p>
      <button type="button" className="contact-ticket-again" onClick={()=>setTicket(null)}>Create another reference</button>
     </section>}
    </form>
   </section>
   <aside className="contact-sidebar" aria-label="Business contact information">
    <section className="contact-info-card"><span className="contact-icon"><MapPin aria-hidden="true"/></span><h2>Our business address</h2><p className="contact-company">ARTISAN MART LLC</p><address>7901 4TH ST N<br/>STE 18005<br/>ST. PETERSBURG, FL 33702<br/>United States</address><p className="contact-muted">Principal office &amp; mailing address</p></section>
    <section className="contact-info-card"><span className="contact-icon"><Mail aria-hidden="true"/></span><h2>Have closeouts to sell?</h2><p>Share your product details and available quantities with our team.</p><a className="contact-email" href="mailto:offer@artisanmart.com">offer@artisanmart.com <ArrowRight size={16} aria-hidden="true"/></a></section>
    <section className="contact-help"><h2>Looking for a quick answer?</h2><Link to="/info/$page" params={{page:"shipping"}}>Shipping information <ArrowRight size={16}/></Link><Link to="/info/$page" params={{page:"sales"}}>Sales FAQ <ArrowRight size={16}/></Link></section>
   </aside>
  </div>
 </main>;
}
