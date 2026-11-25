# Artisan Mart — verified production release gate (2026-11-25)

This document is for the isolated development branch only. The public site at artisanmart.site must not enable checkout until every release flag is independently verified.

## Confirmed infrastructure

- Dedicated Supabase project: `gbsyaembvdtadkuldpbe` (finance@artisanmart.site).
- Original product catalog: 125 SKU records; 354 product images and all baseline catalog/Git blob SHA values preserved.
- Existing live Stripe account: `acct_1UfSeU3jvjbD68qx` (charges and payouts enabled).
- Existing Stripe live webhook: `we_1Ufa723jvjbD68qxXCtqmP6L`, enabled with exactly five configured events.
- Four named Stripe test/live credentials/signing secrets found in encrypted Supabase Vault without displaying their values.
- Correct live restricted API credential verified by Stripe `GET /v1/account` HTTP 200; live webhook `GET` HTTP 200.
- Actual live webhook endpoint returned HTTP 200 for a correctly signed, **irrelevant synthetic** event using the encrypted Vault signing secret.
- The same webhook must not be described as a verified real paid-order webhook without an actual successful payment.
- Anonymous checkout Edge call returned HTTP 401. Customer RPC price-reservation bypass removed; service-only functions deployed. Supabase Security Advisor critical WARN count is zero.
- Stripe Tax Settings status now ACTIVE but has zero tax registrations; account Tax Information status does not establish zero sales-tax liability.
- The original Terms of Sale include multiple freight prices/methods and state that tax is collected without resale number. Actual shipping/tax policy still requires business verification.
- External Brevo DNS foundation includes DKIM, SPF and DMARC. Real external signup/verification and password-recovery completion remain unverified; an isolated signup test attempt was blocked by tool safety controls.
- A production Cloudflare build will receive the publishable Supabase URL/key and an explicit checkout-enabled FALSE flag. No server-side secrets are in frontend configuration.
- No production merge, real checkout session, real paid order, live inventory deduction, or live charge has been performed.

## Release blockers

- Successfully complete external customer confirmation email, correct redirect, real login/recovery/session/logout.
- Successful sandbox card capture, refund, declined and out-of-order event reconciliation are not verified. Sandbox session expiry webhook and concurrent stock isolation *are* verified.
- Determine accurate shipping charge and sales-tax/tax-exemption treatment, including whether orders authorize immediately or only capture on shipment as existing terms currently say.
- Review Stripe representative's pending `verification.document_live_capture` requirement and the legal-name / public business-name distinction.
- Verify signed live payment events and webhook settlement under real authorized paid-order integration.
- Run browser E2E and exact release-commit CI after business constraints are resolved.

## Safe deployment rule

Checkout can only be enabled after all database release flags are truthfully verified; never flip booleans solely to satisfy a deployment. Preserve hosting rollback and the original catalog.
