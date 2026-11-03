import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { meta } from "@/components/store/SimplePage";
import "@/components/store/NewsletterPage.css";

export const Route = createFileRoute("/newsletter")({ head: () => meta("Join Our Newsletter", "Artisan Mart deals, product updates and new arrivals."), component: Newsletter });

function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return <main className="newsletter-page">
    <div className="newsletter-icon"><Mail size={30} aria-hidden="true" /></div>
    <p className="newsletter-eyebrow">STAY IN THE KNOW</p>
    <h1>Join Our Newsletter</h1>
    <p className="newsletter-intro">New arrivals, wholesale offers and product updates, all in one place.</p>
    <form className="newsletter-form" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
      <label htmlFor="newsletter-email">Email address</label>
      <div className="newsletter-controls"><input id="newsletter-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setSubmitted(false); }} aria-describedby="newsletter-note"/><button type="submit" disabled={submitted}>{submitted ? "Thank you" : "Subscribe"}</button></div>
      <p id="newsletter-note" className="newsletter-note">Email subscriptions are opening soon.</p>
      {submitted && <div className="newsletter-confirmation" role="status"><CheckCircle2 size={22} aria-hidden="true"/><div><strong>Thank you for your interest!</strong><p>Newsletter delivery is not active yet. Your email has not been subscribed; please check back when subscriptions open.</p></div></div>}
    </form>
  </main>;
}
