import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { meta } from "@/components/store/SimplePage";
import "@/components/store/NewsletterPage.css";

export const Route = createFileRoute("/newsletter")({ head: () => meta("Join Our Newsletter", "Artisan Mart deals, product updates and new arrivals."), component: Newsletter });

function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[unsubscribe,setUnsubscribe]=useState('');
  return <main className="newsletter-page">
    <div className="newsletter-icon"><Mail size={30} aria-hidden="true" /></div>
    <p className="newsletter-eyebrow">STAY IN THE KNOW</p>
    <h1>Join Our Newsletter</h1>
    <p className="newsletter-intro">New arrivals, wholesale offers and product updates, all in one place.</p>
    <form className="newsletter-form" onSubmit={async e => { e.preventDefault();if(busy)return;setBusy(true);setError('');try{const response=await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,consent:true})});const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||'Subscription could not be saved.');setUnsubscribe(result.unsubscribeUrl||'');setSubmitted(true);}catch(cause){setError(cause instanceof Error?cause.message:'Please try again.');}finally{setBusy(false);} }}>
      <label htmlFor="newsletter-email">Email address</label>
      <div className="newsletter-controls"><input id="newsletter-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setSubmitted(false); }} aria-describedby="newsletter-note"/><button type="submit" disabled={submitted||busy}>{busy?'Subscribing…':submitted ? "Subscribed" : "Subscribe"}</button></div>
      <label className="newsletter-note"><input type="checkbox" required/> I agree to receive Artisan Mart offers and product updates by email.</label>
      <p id="newsletter-note" className="newsletter-note">You can unsubscribe at any time.</p>
      {error&&<p role="alert" className="text-red-700">{error}</p>}
      {submitted && <div className="newsletter-confirmation" role="status"><CheckCircle2 size={22} aria-hidden="true"/><div><strong>Your subscription has been saved.</strong><p>Artisan Mart has been notified of your interest in future offers and product updates.</p>{unsubscribe&&<a href={unsubscribe} className="underline">Unsubscribe</a>}</div></div>}
    </form>
  </main>;
}
