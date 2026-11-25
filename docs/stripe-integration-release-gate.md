# Artisan Mart Stripe Integration — Verified Release Gate
Date: 2026-11-25 (UTC), implementation branch `development/supabase-backend-20261125`

## Production state — NOT RELEASED

- Correct sole Supabase project `gbsyaembvdtadkuldpbe` in finance@artisanmart.site Free organization.
- Website production branch remains `main`, canonical Cloudflare commit `8795a2231462f56ab367b61b160cd341039a54f5`.
- Database `artisan_private.checkout_release_flags.checkout_enabled=false`. Other flags require verified external Auth SMTP, email redirects, shipping/tax rules, sandbox payment success, and signed production webhook before checkout may become true.
- No new Stripe live checkout, charge, webhook endpoint, or production rollout authorized by an evidence-complete release gate. No other Supabase projects, Fulfillment website or Netlify rollback modified.

## Stripe account and environment verification

- Connected live Artisan Mart LLC account: `acct_1UfSeU3jvjbD68qx`. `charges_enabled=true`, `payouts_enabled=true`, `details_submitted=true`. An identity-document live capture requirement remains pending.
- Independent sandbox key/account API test: Stripe sandbox account `acct_1Uf3Yu3sdabWE5fZ`, `charges_enabled=true`.
- Live Stripe Tax Settings status `pending`, missing `head_office`. Zero live tax registrations. **Cannot assume zero sales tax, automatic tax or free shipping.**
- Stripe sandbox API key stored encrypted in Supabase Vault as `artisan_stripe_test_key`; no secret in GitHub or browser.
- Sandbox signing secret stored directly encrypted in Vault `artisan_stripe_test_webhook_secret`; server-only RPC allows Edge Functions to read allowlisted secrets.
- A live restricted secret cannot be provisioned through available tool safety checks; it is intentionally NOT configured. Do not bypass this control or enable production.

## Server side implementation

- `artisan-create-checkout` Supabase Edge Function: verifies authenticated and email-confirmed identity, server-owned order totals, stock and min order, Stripe account/mode and session association, then attempts Stripe-hosted Checkout. Uses isolated sandbox order/stock tables when mode=test and real order tables only when mode=live. Current Stripe API requires `allowed_payment_method_types` (legacy `payment_method_types` gives HTTP400); fixed in implementation.
- `artisan-stripe-webhook` Edge Function: verifies raw Stripe-Signature HMAC SHA256 and timestamp, expected account+mode, retrieves Stripe Session/charge and validates order ownership, status, amount and USD currency. It writes events via service-only idempotent settlement functions.
- `artisan_sandbox` RLS-protected schema has independent stock/order/items/reservations/events and no exposure of live stock or real customer orders.
- Production order backend has locked idempotency, backend price checks, customer RLS, pending reservations, periodic expiration and strict payment-status permissions. Stripe Session-attached reservations are not expired by blind cron cleanup.
- No card numbers or Stripe keys are persisted in the user-facing website.

## Test evidence

| Test | Method / observed result | Gate |
|---|---|---|
| Product baseline | 125 product records and 354 image associations remain on correct project; previous exact source JSON comparison and all-page browser QA | PASS |
| Existing frontend CI | 65/65 tests, 18 test files, TypeScript, Cloudflare static build — GitHub Actions 45552596751 | PASS for that commit |
| Backend browser preview | 10/10 Playwright groups — GitHub Actions 45546983478 | PASS for that commit |
| Edge Deno/type/signed event unit test | GitHub Actions 45554136721 after API parameter fix | PASS |
| Stripe sandbox account lookup | Real authenticated Stripe API returned expected sandbox account ID with HTTP200 | PASS |
| Sandbox event subscription | Real Stripe sandbox webhook `we_1UfYir3sdabWE5fZPDqqwnCK` enabled with relevant event types | PASS |
| Signature-negative test | Real Supabase Edge endpoint rejected invalid Stripe signature HTTP400 | PASS |
| Valid signed synthetic event | Real Supabase Edge endpoint accepted correctly HMAC-signed irrelevant test event HTTP200 | PASS |
| Stripe sandbox session | Stripe API created a `cs_test_` session for synthetic $580 order, USD, livemode=false | PASS |
| Actual expired checkout webhook | Stripe sandbox session API marked expired; Stripe-generated event caused sandbox order expired/cancelled, stock reserved zero, event receipt one | PASS |
| Sandbox concurrent stock | Two concurrent 40-unit requests against 40 available units: one success and one rejected; live stock unchanged | PASS |
| Sandbox QA cleanup | Expired sandbox checkout and test-user/order deleted; sandbox reservation 0; live DA883 stock 780 and reserved 0 | PASS |
| Successful sandbox card authorization | Hosted Checkout UI automation blocked by available tool safety check; no test card was charged | NOT VERIFIED |
| Failed/declined card and refund processing | Requires actual sandbox payment lifecycle verification | NOT VERIFIED |
| Live key and webhook provisioning | No live secret provisioned and no production signed webhook; must not infer from sandbox | NOT VERIFIED |
| Production external customer signup | Supabase default SMTP only sends to authorized addresses; auth confirmation link observed pointing localhost | FAIL release gate |
| Tax/shipping calculation | No verified tax registrations, tax settings pending; shipping policy unconfirmed | FAIL release gate |
| Stripe identity requirement | Account charges enabled but one identity document verification requirement still pending | NEED REVIEW |
| End-to-end real paid order / inventory deduction | No live charge or production order test; release gate remains OFF | NOT VERIFIED |

## Key blockers

1. Supabase Auth URL configuration must point at `https://artisanmart.site`; add exact safe redirect allowlist entries. Existing delivered test confirmation email's redirect was `http://localhost:3000`.
2. Production-ready SMTP and branded confirmation/recovery templates must be configured using supported Auth settings; test real external customer email confirmation and password reset.
3. Verify business shipping and taxes, including applicable legal sales-tax registrations; Stripe Tax settings are pending and no registrations are listed.
4. Finish actual successful and declined sandbox card payment tests, duplicate/late/out-of-order webhook, settlement and refunds; tests must be safely isolated.
5. Provision live Stripe API and live webhook signing secrets in approved server-side secret manager through an authorized path, then verify permission to create sessions/webhooks. Do not place secrets in GitHub.
6. Review and address Supabase Security Advisor warnings: security-definer authenticated RPC exposure and leaked password protection. Harden release policies and run exact release commit regression.
7. Only after all release gates pass may main merge, Cloudflare production variables, SSL/webhook checks and live checkout flag activation occur.

## Backup and recovery

- Original website backup branch `backup/artisanmart-pre-cloudflare-20261125`.
- Hosting migration production baseline commit `8795a2231462f56ab367b61b160cd341039a54f5`.
- Former Netlify deployment remains preserved for rollback.
- SQL migrations are additive; never drop or overwrite product catalog, real order history, auth users or financial logs without reconciliation.

## Urgent production release follow-up — November 25, 2026

The owner has explicitly authorized a live release **only after essential acceptance verification**. The current database release constraint remains OFF, so there is no real checkout available yet.

Work added:
- Dedicated `artisan-stripe-webhook-live` Edge Function version 1 isolates the **live** Stripe mode from the previously verified **sandbox** `artisan-stripe-webhook`. It cannot process events without the approved live API key and signing secret.
- Deno/GitHub Actions run `45556189329` passed the Checkout Edge TypeScript check, HMAC-signature tests, and both sandbox/live webhook typechecks.
- A real HTTP request to the live webhook function returned HTTP **503** due to unconfigured server-side credentials (expected secure fail-closed result). A correctly signed synthetic sandbox event still returned HTTP **200** after creating the live handler.
- Frontend checkout cancellation return message now explicitly avoids claiming a payment failure without a verified provider result; full frontend CI run `45556020684` passed.
- Supabase Vault `artisan_stripe_live_key` and `artisan_stripe_live_webhook_secret` are **both absent**. Connected live Stripe Dashboard reports zero live webhook endpoints. A prior attempt to store the restricted key through the connector was blocked by the tool safety checks; **do not circumvent the block**.
- Stripe live charges and payouts remain enabled, but Stripe requires a pending identity-document live capture action.
- Stripe Tax Settings remains `pending`, missing the verified head-office address, with no live tax registrations.
- The published Terms of Sale mentions multiple carrier/LTL options, local freight rates, and collection of sales tax without a resale number. No validated universal shipping/tax calculation can be inferred from those terms.
- Supabase Auth production Site URL/redirect allowlist and external SMTP are still not configurable via the available account connector. Prior test confirmation email redirected to `http://localhost:3000`, so real external customer verification is NOT operational.
- Sandbox card authorization/paid-order lifecycle still unverified; a real `checkout.session.expired` Stripe webhook and sandbox stock release were verified, and QA data cleaned up.
- Final database read confirmed 125 products, 354 image associations, 0 live orders, 0 sandbox orders, 0 reserved units, checkout flag FALSE.

Mandatory owner-only tasks:
1. Supabase Dashboard → Artisan Mart project → Authentication → URL Configuration: set Site URL `https://artisanmart.site` and explicitly allow `https://artisanmart.site/login`, `https://artisanmart.site/reset-password`. Keep email confirmation required.
2. Supabase Dashboard → Authentication → Emails → SMTP Settings: install authenticated transactional SMTP with sender on verified `artisanmart.site` domain; then test signup/recovery to an ordinary external mailbox. In Email Templates apply reviewed `supabase/email-templates/` templates with `{{ .ConfirmationURL }}`.
3. Stripe Dashboard → Settings → Tax: confirm actual head-office address, relevant products and valid sales-tax registrations. Do not invent registrations or infer no tax.
4. Confirm physical fulfillment origin, carrier shipping-charge calculation, whether tax-exempt wholesale buyers may provide verified resale certificates, and eligible US states. Do not silently assume free shipping.
5. Stripe Dashboard → notification banner → View Account Status: complete `document_live_capture` verification for the required person.
6. Supabase project → Database → Vault: create encrypted secrets with exact names `artisan_stripe_live_key` and `artisan_stripe_live_webhook_secret`, values supplied only into the dashboard securely. Stripe Dashboard → Developers → Webhooks → Live mode must target `https://gbsyaembvdtadkuldpbe.supabase.co/functions/v1/artisan-stripe-webhook-live` and subscribe to the configured supported events; after creation use its own signing secret for Vault. Never paste either secret in GitHub or this report.

After these prerequisites, the exact full release commit must pass successful and declined sandbox Stripe-hosted card payments, email login/reset, live webhook signature/amount/currency/ID tests, inventory reconciliation, and Cloudflare production verification. Only then mark release flags true and enable checkout, with the existing Netlify and GitHub backups intact.
