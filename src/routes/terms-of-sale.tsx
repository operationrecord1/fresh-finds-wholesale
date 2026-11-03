import { createFileRoute, Link } from "@tanstack/react-router";
import { meta } from "@/components/store/SimplePage";
import "@/components/store/TermsPage.css";
export const Route = createFileRoute("/terms-of-sale")({head:()=>meta("Terms of Sale","Artisan Market sales conditions and policy status."),component:Terms});
const conditions = [
 ["Freight responsibility", "Freight responsibility and transfer of risk require confirmation."],
 ["Free shipping", "No free-shipping territory or threshold is currently confirmed."],
 ["Payment timing", "Prepayment and credit-account conditions are pending approval."],
 ["Payment methods", "Accepted methods will be displayed when payment processing is available."],
 ["Card authorization", "Card holds and capture timing are not configured."],
 ["Offline payments", "Offline payment arrangements are not published."],
 ["Order minimums", "The current storefront minimum is $500; item-level minimums also apply."],
 ["Reporting order problems", "Claim deadlines need confirmation before sales launch."],
 ["Delivery services", "Carrier and freight options are pending confirmation."],
 ["Order collection", "Customer pickup is not currently offered on this site."],
 ["Local delivery", "No local-delivery service or fee is confirmed."],
 ["Taxes and resale documents", "Tax handling and document verification require configuration."],
 ["Return authorization", "Return approval procedures and fees are pending."],
 ["Return eligibility", "Packaging requirements and exclusions need approval."],
 ["Special orders", "Custom-order cancellation rules are not finalized."],
 ["Transit damage", "Inspection and damage-reporting procedures are pending."],
 ["Return deadlines", "Return windows have not been established."],
 ["Shipping refunds", "Refundable delivery charges require confirmation."],
 ["Unavailable items", "Substitution and refund procedures are pending approval."],
 ["Promotions", "Promotion eligibility and redemption rules need confirmation."],
];
function Terms(){return <main className="terms-page"><nav aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Terms of Sale</span></nav><article><h1>Terms &amp; Conditions</h1><p className="terms-subtitle">Artisan Market / ARTISAN MART LLC</p><div className="terms-status"><strong>Policy preparation in progress</strong><p>This page organizes the sales conditions being prepared for launch. Pending items are not final contractual terms. Online payment and order processing are not yet available.</p></div><ol>{conditions.map(([title,body])=><li key={title}><h2>{title}</h2><p>{body}</p></li>)}</ol><div className="terms-help"><h2>Questions about these conditions?</h2><Link to="/contact">Open Contact Us</Link></div></article></main>}
