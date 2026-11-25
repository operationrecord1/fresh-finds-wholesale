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

## Final same-day verification update

- Supabase Vault read of secret **names** independently confirms `artisan_stripe_test_key`, `artisan_stripe_test_webhook_secret`, `artisan_stripe_live_key`, and `artisan_stripe_live_webhook_secret` in the correct dedicated Artisan Mart project. Values were not read into any public report.
- Live restricted key, accessed only via server-side Vault, returned HTTP 200 on Stripe `GET /v1/account`, matching `acct_1UfSeU3jvjbD68qx`, and HTTP 200 for existing webhook `we_1Ufa723jvjbD68qxXCtqmP6L`. Actual live webhook HMAC-signature using the encrypted Vault secret returned HTTP 200 on an **irrelevant synthetic** event, not a paid order.
- Stripe Tax Settings status is now **active**, but list of live tax registrations is empty. Existing public Terms of Sale require sales tax without resale number, and multiple shipping/freight charges are described; do not interpret zero registrations as no tax obligation.
- Supabase Auth public settings endpoint HTTP 200 shows email signup enabled, automatic confirmation disabled. Brevo DNS foundation: SPF, DMARC and two Brevo DKIM CNAME records present.
- A controlled external **password recovery email was actually delivered** to the connected Gmail mailbox, from `Artisan Mart <finance@artisanmart.site>`, and Supabase Auth recovery endpoint returned HTTP 200. The first synthetic fixture returned HTTP 500 due to an invalid/null `confirmation_token`; Supabase Auth logs confirmed this synthetic fixture problem. Corrected fixture returned HTTP 200 and a real recovery email; both QA users were deleted. Clicking the token link and resetting/login were not tested. Actual new-customer signup/confirmation is NOT VERIFIED.
- Security finding: Supabase Security Advisor previously warned of 2 authenticated SECURITY DEFINER RPCs; migration `20261125070000_artisan_service_only_checkout.sql` removed direct signed-in-user execute privileges. Post-fix advisor has **0 WARN findings**. Edge Checkout v6 uses only privileged service RPC after validated customer JWT; direct anonymous POST to Edge returned HTTP 401.
- Rollback-safe service-only order test created an unpaid 40-unit order, idempotency repeat and cancellation, restoring reservation zero and original product stock. No permanent order created.
- Cloudflare production build variables now include the **public** Supabase URL and publishable key, plus `VITE_ARTISAN_LIVE_CHECKOUT_ENABLED=false`; no private Stripe secrets were placed in Cloudflare/frontend.
- Exact development candidate GitHub Actions `45568895181` passed frontend tests, TypeScript, build, both signed webhook checks and client-secret grep. Further checkout-address change passed `45568895224` full frontend CI.
- Latest actual Cloudflare **development-only** preview deployment `ebea2d5c` passed Playwright GitHub Actions `45569229326` with 10/10 groups, all 125 product routes and 354 images, guest checkout login redirect/cart restoration, database outage fail-closed and visual comparison. No production merge.
- Final release gate still disabled. Full external signup verification, login/password reset completion, successful sandbox card authorization, live paid-order webhook settlement and inventory deduction, applicable shipping/tax amounts and pending representative identity verification remain unverified.
