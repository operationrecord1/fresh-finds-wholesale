# Artisan Mart — Checkout policy and sandbox verification (2026-11-25)

## Business rules confirmed directly by merchant
- Free shipping on every order with no shipping-charge minimum: **shipping = $0**. The existing wholesale purchase minimum of $500 remains a distinct commercial rule; it is not a minimum for free shipping.
- **Sales tax = $0 only for eligible resellers**, with resale certificates manually checked by the merchant outside the website. No website certificate collection, storage or approval forms added.
- **Additional checkout fees = $0**.
- Final payment = authoritative server-side product subtotal minus an approved discount. Existing public coupon `ARTISAN` is zero-discount demo only; no invented nonzero discount.
- Published Terms of Sale were deliberately left unchanged by merchant instruction; existing capture-timing wording may conflict with immediate-capture Stripe Checkout and needs independent reconciliation prior to live launch.

## Implementation & production
- PR #4: https://github.com/operationrecord1/fresh-finds-wholesale/pull/4 (merged SHA `bca2eecd583201011e63fa798d67ca248e070081`): checkout displays $0 shipping, $0 tax for eligible resellers and $0 added fees, with final authoritative total subject to server verification. No invented shipping or sales-tax calculation.
- CI run https://github.com/operationrecord1/fresh-finds-wholesale/actions/runs/45652738205 — tests, Cloudflare production build, strict TypeScript and client-secret scan PASS. Earlier unsuccessful runs were corrected before merge.
- Existing `artisan_begin_checkout_service` exclusively uses database catalog prices and inventory; persists `shipping_cents=0`, `tax_cents=0`, computes `total_cents=subtotal_cents` for currently zero-discount orders, and rejects checkout while `checkout_enabled=false`.
- Existing `artisan-create-checkout` Edge Function passes persisted line items to Stripe and does not set automatic tax, shipping rate, or additional fee line items; validates Checkout Session amount against the persisted order. **Full Stripe paid flow has not passed E2E**.
- PR #5: https://github.com/operationrecord1/fresh-finds-wholesale/pull/5 (merged SHA `58f8a3dfc3981cb7085ebda80967950966418c05`): non-destructive real webhook security checks. Cloudflare Pages production deployment `f22505ad` at same commit was SUCCESS; `VITE_ARTISAN_LIVE_CHECKOUT_ENABLED=false` confirmed.

## Executed sandbox DB tests — actual Supabase PostgreSQL, no real money
- Tested dedicated `artisan_sandbox` data using a confirmed existing Auth user and SKU `DA883`: 40 units × $14.50 = **$580.00**. Database returned test order `TEST-00000004` with `subtotal_cents=58000`, `total_cents=58000`, additional charges **0 cents**.
- Repeated exact idempotency key returned same order ID and `duplicate=true`.
- Coupon `ARTISAN` accepted with $0 discount.
- Invalid coupon returned `Invalid coupon`; out-of-stock quantity returned `Not enough sandbox stock`.
- `artisan_sandbox_cancel_unattached` returned true; order state `cancelled`, payment state `cancelled`; sandbox reserved SKU stock returned to 0. These are actual isolated database integration tests, **not Stripe test-card transactions**.
- Secure Vault stores syntactically valid Stripe test API key and webhook signing secret; neither was printed.
- Via `pg_net` server-side test-key request to `https://api.stripe.com/v1/account`, received Stripe HTTP 200, authenticated expected isolated test account `acct_1Uf3Yu3sdabWE5fZ`, `charges_enabled=true`. Credentials were not exposed.
- A subsequent direct test PaymentIntent request was blocked by runtime safety checks; **no positive test-mode charge or successful payment confirmed**. Current Stripe connector exposes only the live account. No attempt to evade the restriction.
- Stripe live account `acct_1UfSeU3jvjbD68qx` reports `charges_enabled=true`, `payouts_enabled=true`, but `verification.document_live_capture` is past due. Owner must complete Stripe identity-document capture.
- Stripe live webhook endpoint correctly points to `artisan-stripe-webhook-live` and subscribes to Checkout completion/async results/expiration and refunds.
- Actual live webhook endpoint negative tests via https://github.com/operationrecord1/fresh-finds-wholesale/actions/runs/45653187711: GET status **405**, POST with intentionally forged signature **400**, job SUCCESS. No real charge/refund/order was generated. Positive signed webhook, duplicate event settlement, real payment/inventory sync remain NOT VERIFIED.

## Current verification flags (after merchant policy and observed Brevo delivery evidence)
- `shipping_policy_verified=true`, `tax_policy_verified=true`, `external_smtp_verified=true` (existing external Brevo messages have verified SPF/DKIM/DMARC).
- `auth_email_verified=false`, `stripe_webhook_verified=false`, `sandbox_payment_verified=false`, `checkout_enabled=false`.
- Brevo email template branding is optional under latest merchant instruction. Actual signup-confirmation/login/recovery full browser E2E remains unverified.
- Public paid orders, item records and payment receipts: **0** at latest inspected count.

## Mandatory gates before actual live payment launch
1. Genuine Stripe test-mode success, decline, insufficient funds, authentication-required, cancel, duplicate session and real positive signed webhook processing; independently confirm order, item, payment state, inventory reconciliation, confirmation emails, mobile/desktop customer browser flows.
2. Validate full new account verification, recovery, new-password login and authenticated cart/checkout transition.
3. Confirm merchant's offline reseller eligibility checks actually occur before tax-exempt payment; do not allow arbitrary unverified purchasers to claim exemption. No new forms/tables were added.
4. Resolve Stripe identity `verification.document_live_capture` past-due and rotate previously exposed API/webhook keys in secure Vault/account settings.
5. Reconcile published Terms of Sale's card-hold/shipment capture wording with actual immediate-capture Stripe Checkout behavior. No Terms edits without merchant approval.
6. After all gates passed, enable both backend `checkout_enabled` and Cloudflare frontend `VITE_ARTISAN_LIVE_CHECKOUT_ENABLED`, redeploy, verify production commit, and re-run real customer E2E. **Do not** flip now merely to make the button clickable.

## Rollback and evidence
- Prior working production baseline `c6856c44c20f3eba2cc34919b3f5929de011f52d`, Cloudflare deployment `c42b7177`.
- New verified UI branch CI 45652738205, live webhook security CI 45653187711, Supabase sandbox SQL results and Cloudflare deployment details.
- Confidential authentication tokens, API secrets, payment credentials and email tokens were not committed.

## Real Stripe test-mode Checkout verified (new evidence, 2026-11-25)
- Existing test API key in Supabase Vault authenticated directly against the *separate* Stripe test account `acct_1Uf3Yu3sdabWE5fZ` (HTTP 200). Read-only Stripe Test API also confirmed one enabled test-mode webhook endpoint pointing to `artisan-stripe-webhook`, with completed/async success/failure/expired/refund event subscriptions.
- Deployed dedicated Supabase Edge Function `artisan-create-checkout-sandbox` v1 with `verify_jwt=true`, fixed `mode=test`, and an allowlist restricted to Cloudflare Pages staging preview origin. Sandbox order and inventory exclusively use `artisan_sandbox_*` RPCs; no production inventory, live API keys or live payments.
- Created a new controlled customer via the real Cloudflare Pages staging website, received Brevo verification email, followed the genuine verification link, verified Supabase profile identity, then signed in and added 40 units of SKU `DA883` to cart. Existing preview URL: `https://1abfd514.artisanmart-staging.pages.dev`.
- GitHub Actions [45670805390](https://github.com/operationrecord1/fresh-finds-wholesale/actions/runs/45670805390) **PASS all 5 checks**: genuine signup/verification/login, $580 cart, authenticated sandbox Edge request returned HTTP 200, a real `cs_test_` Stripe-hosted Checkout Session, and the Stripe Sandbox Checkout web page loaded.
- Independently queried Stripe's actual Test API `GET /v1/checkout/sessions/{id}` through Supabase secure server key: HTTP 200, `livemode=false`, `status=open`, `payment_status=unpaid`, `amount_total=58000` cents USD, `amount_shipping=0`, `amount_tax=0`, `amount_discount=0`. **These are real Stripe session values**, not mocked or DB-inferred values.
- Sandboxed order `TEST-00000006` exists as pending/unpaid with attached test session. No successful test-card charge, positive webhook settlement, paid order/inventory adjustment, or customer payment receipt has been witnessed. The session must not be mislabeled successful payment.
- Current live code remains behind two **false** release flags and 0 verified customers are marked in server-owned `app_metadata.artisan_reseller_approved`. Merchant personally authorizes real resale eligibility offline; never auto-mark QA or real customers as approved without offline approval.
- PR #11, squash commit `60f8261ed4dc1eeaf6a0241be3ea34223f1e15b0`, versions the currently deployed isolated test-mode Edge Function and CI assertions. CI [45671377730](https://github.com/operationrecord1/fresh-finds-wholesale/actions/runs/45671377730) PASS (isolated-mode guards, unit tests, Cloudflare build and strict TS). Live release flags unchanged.
- Attempted to extend the QA harness for automatic test-card form interaction; that tool action was blocked by execution safety checks. Do not bypass these checks or report a completed card payment.
