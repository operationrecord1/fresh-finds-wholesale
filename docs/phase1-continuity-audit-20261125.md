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
