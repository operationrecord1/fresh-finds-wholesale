import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-12 bg-hero text-primary-foreground">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-6 py-10 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl font-bold">ARTISAN<span className="text-accent">MART</span></div>
          <p className="mt-3 text-sm opacity-80">Business address, hours and phone: to be provided by Artisan Mart.</p>
        </div>
        <div>
          <h3 className="mb-3 font-bold">About Us</h3>
          <ul className="space-y-1 text-sm opacity-90">
            <li><Link to="/info/$page" params={{ page: "artisan-mart" }}>About Artisan Mart</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/info/$page" params={{ page: "blog" }}>Blog</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Customer Service</h3>
          <ul className="space-y-1 text-sm opacity-90">
            <li><Link to="/info/$page" params={{ page: "shipping" }}>Shipping</Link></li>
            <li><Link to="/info/$page" params={{ page: "sales" }}>Sales FAQ</Link></li>
            <li><Link to="/express-order">Express Order</Link></li>
            <li><Link to="/login">My Account</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Newsletter</h3>
          <Link to="/newsletter" className="inline-block rounded-full bg-accent px-5 py-2 text-sm font-bold">Join Our Newsletter</Link>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 py-4 text-center text-xs opacity-80">
        © {new Date().getFullYear()} Artisan Mart · <Link to="/info/$page" params={{ page: "terms-of-sale" }}>Terms of Sale</Link> · <Link to="/info/$page" params={{ page: "privacy" }}>Privacy</Link> · <Link to="/info/$page" params={{ page: "sitemap" }}>Sitemap</Link>
      </div>
    </footer>
  );
}
