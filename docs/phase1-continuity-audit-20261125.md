# Artisan Mart — Phase 1 Continuity Audit (2026-11-25)

## Scope and safety
- Authorized repository: `operationrecord1/fresh-finds-wholesale`.
- Production branch: `main`; inspected production commit `3ca74dd577b0ea09c5c3aedbeff9cd0359aa1733`.
- Verified Cloudflare Pages project: `artisanmart-staging`, production aliases `artisanmart.site`, `www.artisanmart.site`.
- Successful Cloudflare production deployment: `b7ac12b7`, main commit above; build and deployment stages returned success.
- Supabase project: `gbsyaembvdtadkuldpbe`, ACTIVE_HEALTHY.
- **Production Stripe activation prohibited at Phase 1**. Both frontend `VITE_ARTISAN_LIVE_CHECKOUT_ENABLED=false` and private `checkout_enabled=false` observed. Leave off.
- Never commit server secrets, recovery codes, private API credentials or webhook HMAC secrets.

## Direct inspection (this session)
- The authorized Supabase project has 11 public tables, all with RLS enabled. Public catalog: 125 product records, 32 categories, 354 product images historically reported; image accessibility has not been independently retested in this session.
- 3 deployed Edge Functions were listed: `artisan-stripe-webhook-live`, `artisan-stripe-webhook`, `artisan-create-checkout`. Listed/deployed does not establish successful payment settlement.
- Production `src/components/store/AccountForm.tsx` uses Supabase signUp/signInWithPassword and email resend. Real external delivery, branded template activation and confirmation-link flow not independently retested.
- Production `src/routes/reset-password.tsx` calls updateUser and signs out the recovery session; new-password login and old-password rejection were not independently retested.
- `src/lib/artisan-phone.ts` parses E.164 and defaults bare 10-digit numbers to US. Profile `artisan_profile_phone_write` trigger invokes `artisan_private.enforce_profile_phone_e164()`; migration exists and is applied (`20261125123403`).
- Production checkout page explicitly disables the payment button; no charge made.
- `artisan_private.checkout_release_flags`: checkout, auth_email_verified, external_smtp_verified, shipping_policy_verified, tax_policy_verified, stripe_webhook_verified, sandbox_payment_verified all currently FALSE. They are gates, not proof the individual feature is broken.
- Supabase Security Advisor on this audit had one WARN: leaked-password protection disabled (and nine INFO findings for RLS-enabled private/sandbox tables intentionally without policies). Earlier 'zero warning' reports must not supersede current finding. Remediation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Historical test evidence rechecked
- `45616976896` — completed/success release validation: tests, Cloudflare build, TypeScript check and client-secret grep all successful at main SHA `3ca74dd` (workflow head was fix/auth-validation branch).
- `45617256626` — completed/success production phone and precheckout browser audit (audit branch SHA `04e40f9`). The workflow step reports success; separate browser logs and screenshots remain advisable for case-level assertions.
- `45616738518` — earlier failed release validation, later successful `45616976896` at newer SHA; do not describe earlier failure as current failure.
- Historical production end-to-end reports must be distinguished from tests run after this patch.

## Current code correction in isolated branch
- Branch: `fix/artisan-account-profile-validation-20261125` based directly on verified production SHA.
- Changed `src/routes/account.tsx`: reject empty/whitespace/oversize first/last names before update; trim names; use try/catch/finally so exceptions do not strand save UI in busy state; keep phone validation, design and RLS-based user scoping unchanged.
- Existing `artisan-final-auth-validation.yml` temporarily broadened to include this branch so existing release tests/build/typecheck/secret-scan can run automatically.
- Initial source-fix commit: `696882a414a484539e020245ecbb68b9f51bb58d`.
- Initial CI run: `45626429711` (check actual completion and step results before calling PASS).
- Do not merge or deploy this patch before CI and appropriate browser verification.

## Pending and blocked
1. Inspect complete CI logs for the branch patch; investigate failures before merging.
2. Add focused account profile save/browser validation including whitespace name, exceptions, mobile layout and successful save.
3. Verify live signup with a safe, owned QA inbox; confirm profile row, verification email, link redirect, login and logout.
4. Verify current Supabase auth email templates are actually activated. The repository HTML files alone are not evidence of provider activation.
5. Verify recovery email, valid-token password reset, new-password login, old-password rejection, replay/expired-link behavior. Avoid persisting QA passwords.
6. Verify catalog, cart, coupon, authenticated checkout routing and browser errors across desktop/mobile. Confirm $500 order minimum against actual business policy.
7. Enable leaked-password protection where supported by plan and provider settings. Re-run security advisor.
8. Confirm shipping fees, sales-tax registrations/exemptions, capture timing and Stripe verification before payment-phase release. Sandbox then live testing are separate gates.
9. Keep live payment disabled, all release flags truthful, and rollback ready.

## Acceptance status discipline
- SOURCE IMPLEMENTED is not equal to VERIFIED IN PRODUCTION.
- Previous CI PASS is not equal to new patch PASS.
- No new paid order, live Stripe settlement, or comprehensive 40/40 Phase 1 proof in this audit.

## Second session implementation milestone — 2026-11-25
- Extended the same isolated fix PR, preserving existing production branch until tested.
- Corrected malformed forgot-password email regex by sharing `isValidArtisanEmail` with login/registration; added validation regression tests.
- Added explicitly required Terms of Sale + Privacy Policy consent checkbox to signup, checked before Supabase signup; saved terms acceptance timestamp in signup metadata. Existing optional newsletter checkbox remains optional. Note: auth metadata is not an immutable legal-audit log; do not describe it as one.
- Profile page now handles failed profile reads with a retry (instead of showing Loading indefinitely), displays inline name errors and refreshes header name after successful profile updates.
- New `scripts/artisan-production-auth-smoke.cjs` and workflow `artisan-production-auth-smoke.yml`: non-destructive browser checks on actual production after pushes to main, including registration validation, country-aware phone input, password errors, forgot email validation, unauthorized checkout redirect and mobile screenshots. These checks cannot prove real SMTP delivery or successful password reset.
- Prior exact baseline CI `45626505322` PASS for account fix; newer code requires its own exact SHA CI proof.
- Direct interactive browser connection unavailable in current Chat session (requires originating connected browser context). Production browser evidence must be collected via Actions and inspected after deployment.
- Hosted Supabase Auth SMTP and confirmation/reset email templates cannot be edited with the currently exposed Supabase connector operations (no Auth config management write). As documented by Supabase, hosted Auth settings must be updated in the Auth Templates/SMTP dashboard or via Management API with authorized auth_config_write credentials. Do not attempt SQL modification of Auth SMTP configuration or fabricate successful activation.
- Current AUTH security advisor recorded leaked-password protection disabled; investigate plan and Auth settings, without incurring costs.
- Actual customer signup->Brevo delivery->email confirmation->password recovery->new login remains NOT VERIFIED. No fake completion flags.
- Live Stripe payments and all private checkout release flags must remain disabled until their independent acceptance gates.

## Production deployment and actual browser verification — 2026-11-25
- Existing PR #1 was reviewed and squash merged (merge SHA `00f803385d95ee2438e4cdb2e6ee43d962950e70`). All changed code confined to auth/form/profile, tests, documentation and workflow; Stripe remains untouched.
- Exact branch CI `45628292525` / SHA `bee718379b655dbce8286ca5eb92ec989eb128ce`: unit tests, Cloudflare build, TypeScript check and client-secret grep all PASS. A prior candidate `45628094380` failed TypeScript due Supabase PromiseLike.catch usage; fixed with `Promise.resolve(...)` and successfully reran.
- Cloudflare production deployment `ae9735e5` succeeded on squash SHA `00f803385d95ee2438e4cdb2e6ee43d962950e70`, serving `artisanmart.site` and `www.artisanmart.site`.
- Production Playwright smoke `45628496758`, job `139255010501`, PASS for all 6 assertions: consent enforcement (no signup), country-specific phone and password validation, forgot-password input validation, guest checkout redirect, mobile auth pages/screenshots, and no browser page exceptions. **Non-destructive smoke does not verify successful signup, profile save, SMTP delivery, verified login, password reset or multi-user isolation.**
- Post-deploy Supabase release flags remain all FALSE, including checkout_enabled. Cloudflare public `VITE_ARTISAN_LIVE_CHECKOUT_ENABLED=false` verified.
- Current Auth database counts: 1 confirmed user identity and 1 profile. Owner-based SELECT/UPDATE RLS exists for profiles with `user_id=auth.uid()` and ownership checks on addresses and orders.
- Actual Gmail evidence from November 25: verification email at 12:37 UTC and reset email at 11:57 UTC delivered from `Artisan Mart <finance@artisanmart.site>`. However both arrived with generic Supabase template subjects (`Confirm your email address` and `Reset your password`) and default body text, not the authorized branded template subject/body. **Branded transactional templates: FAIL, not merely unverified.** SMTP provider behind From header cannot be inferred from those messages alone.
- Supabase organization `upbnbhhgxptssahoolwa` is on Free tier. Leaked password protection is a paid Pro-or-higher feature; upgrade not authorized. Custom SMTP is supported on Free, and required for brand-customizable templates in projects created after 2026-06-03.
- **Mandatory owner/config action**: In Supabase Authentication > SMTP Settings, confirm/configure the pre-existing Brevo SMTP host/port/login/password and sender `finance@artisanmart.site`. In Authentication > Email Templates activate the existing repository `confirm-signup.html` and `reset-password.html` using subjects `Welcome to Artisan Mart — Verify Your Email Address` and `Reset Your Artisan Mart Password`. Validate redirect allow-list for `https://artisanmart.site/login` and `https://artisanmart.site/reset-password`; then send fresh controlled tests, inspect external inbox HTML and complete real recovery + new-password login. Supabase connector exposes database/Edge tools but not Auth config management PATCH. Do not share SMTP passwords in GitHub or chat.
- Final all-journey answer is **NO** until the untested cases genuinely pass. Do not flip private release flags or enable Stripe payments to conceal missing evidence.

## Authentication failure-resolution continuation — 2026-11-25
- Investigated the official Supabase Management API, not merely the connected Supabase database/Edge connector. Auth config can be read/written with a scoped personal Management token via `GET/PATCH /v1/projects/gbsyaembvdtadkuldpbe/config/auth`; required permissions include `auth_config_write`, `project_admin_write`.
- Added and merged PR #2, SHA `0dd174406fe47e604b47a223918d66f065837757`, containing `scripts/artisan-auth-management-config.cjs`, GitHub manual `artisan-auth-email-config.yml`, `docs/auth-email-template-activation-20261125.md`, `docs/auth-40-point-evidence-20261125.md`, and expanded production browser tests. CI syntax/Go template checks passed in run `45630621265`.
- **A Management API Auth config PATCH has NOT been run**: no authorized Management API token and Brevo SMTP credentials were accessible to the current connector/CI. The workflow refuses to apply without a valid Brevo SMTP relay configuration. Owner can store the required credentials securely as GitHub Actions secrets or use dashboard. Do not place credentials in chat, repository files or client settings.
- Raw Gmail header review **confirmed existing Brevo delivery**: messages from `gy.d.sender-sib.com`, headers `X-sib-id` and `X-Mailin-EID`, DKIM selector `brevo1` for artisanmart.site, and receiver SPF/DKIM/DMARC PASS. This improves prior uncertainty around provider. Existing delivered subject/body remain default Supabase, not branded.
- Cloudflare DNS currently has Brevo DKIM `brevo1._domainkey.artisanmart.site` and `brevo2._domainkey.artisanmart.site` CNAME entries.
- Production Playwright `45630730966` shows **8/8 PASS**, including anonymous My Account no private data and reset route denial without recovery session, beyond earlier six checks. This is NOT a successful real recovery or multi-user test.
- Full signup/confirmation/reset/new-password-login/cross-user isolation and branded external email remain mandatory and unverified. Live Stripe remains off, no additional profiles/charges/orders created by this session.
- Full point-by-point status and evidence: `docs/auth-40-point-evidence-20261125.md`. Required owner configuration steps and exact existing HTML files: `docs/auth-email-template-activation-20261125.md`.

## Real customer E2E and live checkout eligibility enforcement — 2026-11-25
- Actual controlled account `operation.record1+artisan-live-authqa-45661109191@gmail.com` registered from production browser. The genuine Brevo signup-confirmation email arrived in the connected Gmail inbox at 17:06:57 UTC. The real delivered verification URL was followed; Supabase independently confirmed `email_confirmed_at IS NOT NULL` and exactly one associated `artisan_profiles` row. No authentication verification bypass.
- Live GitHub Actions browser E2E run `45661109191` job `139370856338`: real signup HTTP 200, no pre-verification session, attempted unverified password login HTTP 400, real verified password login SUCCESS after email confirmation, My Account private route available, session preserved across reload, mobile customer account menu available, logout protected My Account. These checks were observed, not simulated. QA password remained transient in the runner and was never printed or saved.
- Resale eligibility: merchant already approves resale certificates manually outside the website. Checkout Edge Function `artisan-create-checkout` upgraded from v6 to v7. For **live** charges, after verified Supabase identity, server requires the server-managed `user.app_metadata.artisan_reseller_approved === true`; sandbox remains separate. This is not an automated certificate-verification feature, no extra tables/forms, and client-editable `user_metadata` is not trusted for authorization. Do not set approval for QA or other users without the merchant's genuine offline decision.
- Version-controlled current deployed Edge source in PR #6 squash commit `2caecba27fb94e35cf9189af249aa2bfd357fba7`, `supabase/functions/artisan-create-checkout/index.ts`. Branch CI `45661974613` PASS for full tests, Cloudflare build, TypeScript and guard assertions. Deployed Edge v7 is ACTIVE. Live checkout remains gated until positive sandbox card/webhook/order/inventory E2E is observed.
- The connected Stripe app exposes only Artisan Mart LLC **livemode** account even though the Supabase secure Vault contains a separate valid test key. Test-key GET of Stripe test account returned HTTP 200 earlier, but positive test-mode PaymentIntent request was blocked by execution safety checks; no successful test payment can be claimed. Do not read secrets into logs or publish them; no credential rotation authorized.
- Future QA priorities: genuine password reset via delivered recovery link (including original browser's PKCE verifier), authenticated cart and checkout, two-account RLS isolation, sandbox payment session and signed webhook settlement, order confirmation email, and order history. Nothing in this addendum claims those as PASS.

## November 25 late-session implementation and live acceptance evidence
- Controlled production signup browser run 45661109191 SUCCESS: real Brevo confirmation link consumed, QA identity/profile created, unverified login blocked, verified login, private My Account, session reload persistence, mobile menu, logout protection.
- Independent second customer browser run 45662635567 SUCCESS: second real signup/confirmation/login, second user could not SELECT first user's profile under RLS, customer name edit persisted after refresh, authenticated cart retained $580, verified customer reached /checkout.
- Separate real recovery request to Supabase Auth returned HTTP 200 and a fresh Brevo recovery email was received in the controlled QA inbox. Full browser recovery/new-password login remains **not verified**.
- Supabase isolated sandbox rollback-only transaction asserted $580 exact server total, reservation increment, simulated paid settlement adjusting sandbox stock exactly once, repeated event idempotency, and full refund payment status; it rolled back. **Not a genuine test-card transaction or actual signed webhook settlement**.
- PR #7 merged SHA 499424282cc6fa13ab5beba129da4d6cb22c6874, CI 45663327996 SUCCESS: deployed Stripe signature code snapshot + cryptographic HMAC unit tests.
- PR #8 merged SHA 8b70c54d0c40ee566f977e777bdaf1b8bbf10872, CI 45663460833 SUCCESS: Edge Function v8 sets Stripe payment receipt_email to Supabase-verified customer email; merchant approval guard retained. Do not claim actual receipt delivery before payment success.
- PR #9 merged SHA c6a4b28ba8ff68a0188e3af31d0ea73f3f55e2c9, CI 45663795037 SUCCESS: order confirmation now correctly distinguishes paid/pending/failed/cancelled/refunded/partially refunded; new regression tests.
- Main push 638df2d797e9ba6fef57c61fa32075628edbba9a improved production browser smoke trigger for checkout/order changes. Actual production browser CI 45664048031 PASS 9/9, no JavaScript errors.
- A third controlled QA run 45664458729 completed genuine signup/verification/login and session/mobile checks but failed on an intermittent header logout race. PR #10 merged SHA ab412a33a909eabf3c819d888d4b8808bd78d883, CI 45665000535 SUCCESS: await global signOut before redirecting to login; prevents double-click and adds async sequencing regression test. Production Cloudflare deployment 555e93ed SUCCESS for that code. A further full real-user post-fix logout run has NOT passed; do not overstate.
- Production release flags: auth_email_verified=true, external_smtp_verified=true, shipping_policy_verified=true, tax_policy_verified=true, while stripe_webhook_verified=false, sandbox_payment_verified=false, checkout_enabled=false. Cloudflare VITE_ARTISAN_LIVE_CHECKOUT_ENABLED=false. Four controlled/previous users currently confirmed with matching profile rows; no live paid orders.
- Stripe's connected Plugin context exposes the live Artisan Mart account only, despite valid distinct test credentials stored in Supabase Vault. Actual creation of test PaymentIntent via server-side request was blocked by execution safety checks; no positive Stripe test-card charge has been verified. Do not bypass protections or mark any payment release flags PASS without actual evidence.
- Merchant explicitly forbids credential rotation for now; do not rotate keys. Merchant identity verification is personal responsibility and not an implementation assignment. Shipping 0, eligible reseller tax 0, additional checkout fees 0, email branding optional. Existing live Edge requires server-managed app_metadata.artisan_reseller_approved after merchant offline certification; do not auto-approve arbitrary visitors.
