import { BUSINESS_PHONE, BUSINESS_PHONE_HREF } from "@/lib/business";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Mail, MessageSquare, Package, ArrowRight } from "lucide-react";
import { meta } from "@/components/store/SimplePage";
import "@/components/store/ContactPage.css";

export const Route = createFileRoute("/contact")({ head: () => meta("Contact Us", "Contact Artisan Mart about wholesale products, orders and closeouts."), component: Contact });
function Contact() {
 const [topic, setTopic] = useState("new");
 const [ticket, setTicket] = useState<string | null>(null);
 const [sending, setSending] = useState(false);
 const [error, setError] = useState<string | null>(null);
 return <main className="contact-page">
  <nav className="contact-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Contact Us</span></nav>
  <header className="contact-intro"><span className="contact-eyebrow">LET'S TALK WHOLESALE</span><h1>How can we help?</h1><p>Questions about products, an order, or selling your closeouts? You're in the right place.</p></header>
  <div className="contact-layout">
   <section className="contact-form-card" aria-labelledby="contact-form-title">
    <h2 id="contact-form-title">Contact Us</h2><p className="contact-muted">Choose your inquiry type and tell us what you need.</p>
    <div className="contact-topics" role="group" aria-label="Inquiry type">{[{id:"new",label:"New order inquiry",icon:MessageSquare},{id:"existing",label:"Existing order inquiry",icon:Package}].map(({id,label,icon:Icon})=><button key={id} type="button" aria-pressed={topic===id} onClick={()=>{setTopic(id);setTicket(null);setError(null);}}><Icon size={19} aria-hidden="true"/>{label}</button>)}</div>
    <form onChange={()=>{setTicket(null);setError(null);}} onSubmit={async e=>{
      e.preventDefault();
      if (ticket || sending) return;
      const form = e.currentTarget;
      const values = Object.fromEntries(new FormData(form).entries());
      setSending(true);setError(null);
      try {
       const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, topic }) });
       const result = await response.json() as { ok?: boolean; reference?: string; error?: string };
       if (!response.ok || !result.ok || !result.reference) throw new Error(result.error || "Message could not be sent.");
       setTicket(result.reference);
       form.reset();
      } catch (cause) { setError(cause instanceof Error ? cause.message : "Message could not be sent. Please try again."); }
      finally { setSending(false); }
     }}>
     <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
     <div className="contact-fields"><label>Full name <span>*</span><input name="name" autoComplete="name" required maxLength={120}/></label><label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label>Company <small>(optional)</small><input name="company" autoComplete="organization" maxLength={160}/></label><label>Phone <small>(optional)</small><input name="phone" type="tel" autoComplete="tel" maxLength={40}/></label></div>
     {topic==="existing"&&<label className="contact-order">Order number <span>*</span><input name="order" required maxLength={80}/></label>}
     <label>Your message <span>*</span><textarea name="message" rows={5} required maxLength={5000} placeholder={topic==="existing"?"Tell us what you need help with regarding your order.":"Include product names, item numbers or quantities, if available."}/></label>
     <p className="contact-form-note" id="contact-delivery-note">Your inquiry will be sent to Artisan Mart customer service at email@artisanmart.site.</p>
     <button className="contact-primary" aria-describedby="contact-delivery-note" type="submit" disabled={!!ticket || sending}>{sending ? "Sending…" : ticket ? "Message sent" : "Send message"} <ArrowRight size={17} aria-hidden="true"/></button>
     {error&&<p className="contact-status contact-error" role="alert">{error} <a href="mailto:email@artisanmart.site">Email us directly</a>.</p>}
     {ticket&&<section className="contact-status contact-ticket" role="status" aria-live="polite" aria-label="Ticket reference">
      <span className="contact-ticket-label">YOUR TICKET REFERENCE</span>
      <strong className="contact-ticket-number">{ticket}</strong>
      <p>{topic === "new" ? "New order inquiry" : "Existing order inquiry"} · Sent to Artisan Mart</p>
      <p>Your message has been sent. Keep this reference for your records.</p>
      <button type="button" className="contact-ticket-again" onClick={()=>setTicket(null)}>Send another message</button>
     </section>}
    </form>
   </section>
   <aside className="contact-sidebar" aria-label="Business contact information">
    <section className="contact-info-card"><span className="contact-icon"><MapPin aria-hidden="true"/></span><h2>Our business address</h2><p className="contact-company">ARTISAN MART LLC</p><address>7901 4TH ST N<br/>STE 18005<br/>ST. PETERSBURG, FL 33702<br/>United States</address><p className="contact-muted">Principal office &amp; mailing address</p><p><a className="contact-email" href={BUSINESS_PHONE_HREF}>{BUSINESS_PHONE}</a></p></section>
    <section className="contact-info-card"><span className="contact-icon"><Mail aria-hidden="true"/></span><h2>Have closeouts to sell?</h2><p>Share your product details and available quantities with our team.</p><a className="contact-email" href="mailto:offer@artisanmart.site">offer@artisanmart.site <ArrowRight size={16} aria-hidden="true"/></a></section>
    <section className="contact-help"><h2>Looking for a quick answer?</h2><Link to="/about-us" hash="easy-shipping">Shipping information <ArrowRight size={16}/></Link><Link to="/info/$page" params={{page:"sales"}}>Sales FAQ <ArrowRight size={16}/></Link></section>
   </aside>
  </div>
 </main>;
}
