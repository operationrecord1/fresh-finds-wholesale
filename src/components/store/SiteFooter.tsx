import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Store, Heart, BriefcaseBusiness, Phone, Megaphone, Facebook, Youtube, Star, ChevronDown, ArrowUp, X } from "lucide-react";
import "./SiteFooter.css";

const shortcuts = [
  { title: "Industries Served", page: "industries-served", icon: Store },
  { title: "Artisan Cares", page: "community-outreach", icon: Heart },
  { title: "Career Opportunities", page: "careers", icon: BriefcaseBusiness },
  { title: "Contact Us", page: "contact", icon: Phone },
];
const aboutLinks: [string, string][] = [
  ["Industries Served", "industries-served"],
  ["Artisan Cares", "community-outreach"], ["Easy Shipping", "shipping"],
  ["Contact Us", "contact"], ["Artisan Market Careers", "careers"], ["Blog", "blog"],
];
function FooterLink({ page, children }: { page: string; children: React.ReactNode }) {
  if (page === "careers") return <Link to="/about-us" hash="careers">{children}</Link>;
  if (page === "contact") return <Link to="/contact">{children}</Link>;
  if (page === "privacy") return <Link to="/privacy">{children}</Link>;
  if (page === "terms-of-sale") return <Link to="/terms-of-sale">{children}</Link>;
  const section = ({ "industries-served": "industries-served", "community-outreach": "artisan-cares", shipping: "easy-shipping", blog: "blog" } as Record<string, string>)[page];
  if (section) return <Link to="/about-us" hash={section}>{children}</Link>;
  return <Link to="/info/$page" params={{ page }}>{children}</Link>;
}
export function SiteFooter() {
  const [notice, setNotice] = useState("");
  return (
    <footer className="artisan-footer" aria-label="Artisan Market footer">
      <nav className="footer-shortcuts footer-wrap" aria-label="Explore Artisan Market">
        {shortcuts.map(({ title, page, icon: Icon }) => <FooterLink key={page} page={page}><Icon aria-hidden="true" /><span>{title}</span></FooterLink>)}
      </nav>
      <div className="footer-main">
        <div className="footer-wrap footer-columns">
          <section className="footer-contact" aria-labelledby="footer-brand">
            <h2 id="footer-brand">Artisan Market</h2>
            <address>7901 4TH ST N, STE 18005<br />ST. PETERSBURG, FL 33702, US</address>
            
            
            <div className="footer-contact-links"><p>Customer Service: <a href="https://email.artisanmart.com">email.artisanmart.com</a></p><p>Sell Closeouts: <a href="mailto:offer@artisanmart.com">offer@artisanmart.com</a></p></div>
          </section>
          <section className="footer-about" aria-label="About Us">
            <h2 className="footer-desktop-heading">About Us</h2>
            <div className="footer-desktop-links"><AboutLinks /></div>
            <details className="footer-mobile-links"><summary>About Us <ChevronDown aria-hidden="true" size={18} /></summary><AboutLinks /></details>
          </section>
          <section className="footer-newsletter" aria-labelledby="footer-newsletter-title">
            <h2 id="footer-newsletter-title"><Megaphone aria-hidden="true" size={23} /> Join Our Newsletter To Get Exclusives</h2>
            <Link to="/newsletter" className="footer-subscribe">Subscribe To Newsletter</Link>
            <div className="footer-social" aria-label="Social media">
              <button type="button" aria-label="Facebook — coming soon" onClick={() => setNotice("Our Facebook page will be linked here soon.")}><Facebook fill="currentColor" aria-hidden="true" /></button>
              <button type="button" aria-label="X — coming soon" onClick={() => setNotice("Our X profile will be linked here soon.")}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" /></svg></button>
              <button type="button" aria-label="YouTube — coming soon" onClick={() => setNotice("Our YouTube channel will be linked here soon.")}><Youtube aria-hidden="true" /></button>
            </div>
            {notice && <p className="footer-notice" role="status">{notice}<button type="button" aria-label="Dismiss social media notice" onClick={() => setNotice("")}><X size={16} /></button></p>}
          </section>
        </div>
        <div className="footer-wrap footer-top-row"><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}>Back to top <ArrowUp size={16} aria-hidden="true" /></button></div>
      </div>
      <div className="footer-wrap footer-bottom">
        <p>© {new Date().getFullYear()} Artisan Market. All rights reserved.</p>
        <nav aria-label="Legal"><FooterLink page="terms-of-sale">Terms of Sale</FooterLink><FooterLink page="privacy">Privacy Policy</FooterLink><FooterLink page="sitemap">Sitemap</FooterLink></nav>
        <div className="footer-review-preview" aria-label="Customer reviews design preview, no verified rating"><div><strong>Artisan Market</strong><span className="footer-stars" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} fill="currentColor" />)}</span></div><span>Review preview · Not yet rated</span></div>
      </div>
    </footer>
  );
}
function AboutLinks() {
  return <ul className="footer-about-list">{aboutLinks.map(([label, page]) => <li key={page}><FooterLink page={page}>{label}</FooterLink></li>)}</ul>;
}
