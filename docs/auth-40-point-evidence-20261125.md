# Artisan Mart — 40-point authentication evidence matrix (2026-11-25)

PASS = currently supported by actual observed production evidence for the limited specified check; where incomplete follow-up is needed it is stated. FAIL = demonstrated defect. NOT VERIFIED = no sufficient final E2E evidence. Automated build or source implementation alone never counts.

| # | Requirement / expected behavior | Actual observation | Method | Status |
|---|---|---|---|---|
| 1 | Valid customer registration — Real signup to verified account | Two real production signup identities created with confirmation required | Production Playwright 45661109191; 45662635567 | **PASS** |
| 2 | Invalid registration input — Reject invalid fields | Earlier production browser validation PASS | Production Playwright 45628496758 | **PASS** |
| 3 | Mandatory agreements — Block without consent | Existing browser test PASS | Production Playwright 45628496758 | **PASS** |
| 4 | US phone formatting — Display +1 format and store E164 | Display verified; fresh persisted profile untested | Production Playwright 45628496758 | **PASS** |
| 5 | International phone validation — Accept country-valid numbers | UK and Bangladesh inputs verified | Production Playwright 45628496758 | **PASS** |
| 6 | Invalid phone rejection — Prevent invalid phone | Browser rejection verified | Production Playwright 45628496758 | **PASS** |
| 7 | Password realtime validation — Realtime per-rule validation | Browser rules checked | Production Playwright 45628496758 | **PASS** |
| 8 | Red password errors — Unsatisfied requirements red | Browser inspected rule states | Production Playwright 45628496758 | **PASS** |
| 9 | Confirm password matching — Block mismatch | Browser mismatch rejection confirmed | Production Playwright 45628496758 | **PASS** |
| 10 | Supabase user creation — Create new Auth identity | Two newly-created Supabase Auth identities independently confirmed | Auth signup API and SQL user records | **PASS** |
| 11 | Customer profile creation — One accurate profile per identity | Both new identities have exactly one matching customer profile | Supabase production SQL after email confirmation | **PASS** |
| 12 | Verification email delivery — functional email, branding optional | Verification messages delivered through Brevo; branding explicitly deferred | Connected Gmail actual delivered messages and raw headers | **PASS** |
| 13 | Genuine signup confirmation link — Actual token confirms new user | Actual delivered links followed, both QA accounts became confirmed | Gmail confirmation link plus production Supabase SQL | **PASS** |
| 14 | Email confirmation — Confirmed Auth state after token | Both new QA identities have email_confirmed_at set | Supabase production SQL | **PASS** |
| 15 | Successful verified login — Password grant from verified new customer | Two verified customers successfully received password grants | Production Playwright 45661109191; 45662635567 | **PASS** |
| 16 | Wrong password rejection — Real auth denies wrong password | Historical tests; current release not independently retested | None | **NOT VERIFIED** |
| 17 | Unverified account restrictions — Cannot sign in before email confirm | Production explicitly rejected first user's unconfirmed login with HTTP 400 | Production Playwright 45661109191 | **PASS** |
| 18 | Resend verification — New external email reaches inbox | Not freshly executed | None | **NOT VERIFIED** |
| 19 | Customer name header — Actual profile name | Source implemented, authenticated browser pending | None | **NOT VERIFIED** |
| 20 | Account menu — My Account/Logout functional | Real first customer's mobile menu and logout items opened | Production Playwright 45661109191 | **PASS** |
| 21 | My Account page — Private DB info shown to owner | Verified QA account My Account rendered private profile | Production Playwright 45661109191; 45662635567 | **PASS** |
| 22 | Profile edit success — Persist valid update and refresh | Second QA customer changed name, reloaded, updated value persisted | Production Playwright 45662635567 | **PASS** |
| 23 | Invalid profile edit rejection — Reject blank name/bad phone | Source fix only, new browser test pending | None | **NOT VERIFIED** |
| 24 | Failed save recovery — Retry and recover after network failure | Source fix only | None | **NOT VERIFIED** |
| 25 | Session persistence — Refresh/multi-tab/reopen | No new authenticated browser test | None | **NOT VERIFIED** |
| 26 | Logout — Revoke intended session and clear UI | First QA customer signed out successfully | Production Playwright 45661109191 | **PASS** |
| 27 | Private route after logout — No private account data | After logout, original QA account received sign-in prompt on /account | Production Playwright 45661109191 | **PASS** |
| 28 | Forgot-password navigation — Correct route and navigation | Route loads; click journey untested | Production browser smoke | **NOT VERIFIED** |
| 29 | Password recovery email delivery — functional email, branding optional | Real password recovery email delivered to owned QA address via Brevo; branding deferred | Supabase Auth /recover HTTP 200 and Gmail message 1a213b24d5e37045 | **PASS** |
| 30 | Genuine recovery link — Open actual link to /reset-password | Not exercised in new release | None | **NOT VERIFIED** |
| 31 | Password updated — Successful Auth update | Not exercised | None | **NOT VERIFIED** |
| 32 | New-password login — Login with new credential | Not exercised | None | **NOT VERIFIED** |
| 33 | Old-password rejection — Old credential denied after reset | Not exercised | None | **NOT VERIFIED** |
| 34 | Invalid/expired/reused recovery links — All states blocked | Browser test for missing token added; expired/reused pending | New test not deployed yet | **NOT VERIFIED** |
| 35 | Two-user data isolation — A cannot access B data | Second authenticated QA customer queried first user's profile; zero rows returned | Production Playwright 45662635567 RLS integration | **PASS** |
| 36 | Cart preservation — Cart quantities, discounts survive auth | Historical browser evidence only | Historical CI | **NOT VERIFIED** |
| 37 | Guest checkout redirect — Login required | Actual production browser PASS | Production Playwright 45628496758 | **PASS** |
| 38 | Authenticated checkout — Verified user returns to checkout | Verified second QA customer reached authenticated checkout with $580 cart | Production Playwright 45662635567 | **PASS** |
| 39 | Desktop/mobile flows — Works at desktop and mobile | Production 390px smoke and CSS layout passed; full auth journeys pending | Production Playwright 45628496758 | **PASS** |
| 40 | Stripe live checkout activation — verified paid purchase required | Customer live checkout still gated OFF; successful real payment not established | Cloudflare VITE flag and private release flags | **FAIL** |

## Current new work and evidence
- New safe Supabase Auth configuration script: `scripts/artisan-auth-management-config.cjs`.
- Opt-in GitHub workflow: `.github/workflows/artisan-auth-email-config.yml`; branch syntax and Go-template placeholder check PASS (GitHub Actions 45630273074). This does not mean the template PATCH or SMTP delivery was executed.
- Exact template subjects and HTML are already in `supabase/email-templates/`; repository files do not activate hosted Supabase templates automatically.
- Configuration owner action/runbook: `docs/auth-email-template-activation-20261125.md`.
- Non-destructive browser smoke extended with anonymous account and missing-token reset checks; require post-deployment browser run to mark those specific subchecks verified.
- Supabase Management API requires `auth_config_write` + `project_admin_write` and a proper token; currently connected Supabase connector exposes database/Edge operations only, not auth-config PATCH. GitHub workflow can perform it securely once the owner has stored credentials as Actions secrets.
- No new paid orders, no Stripe activation, no user test account created in this latest phase.

## Acceptance gate
The system **cannot be declared fully operational** until both branded-template delivery and real signup->confirmation->login->reset->new-password-login journeys are independently verified with two owned test accounts, cross-account RLS validation and cart-to-checkout E2E. Do not flip release flags to fabricate success.

Evidence: GitHub Actions 45628496758 (production browser 6/6), CI 45628292525, Supabase owner RLS policy query and customer Auth log, Gmail messages showing default subjects. Exact new workflow CI 45630273074.
## Latest production verification addendum — November 25, 2026
- Production code merge: PR #2 squash SHA `0dd174406fe47e604b47a223918d66f065837757`, Cloudflare Pages deployment `9cf47c6d` SUCCESS. Live Stripe checkout remains disabled. PR #2 contains only safe auth-template deployment tooling, documentation, and expanded browser tests.
- New production browser suite: GitHub Actions [45630730966](https://github.com/operationrecord1/fresh-finds-wholesale/actions/runs/45630730966), job `139262879090`, **8/8 PASS**. Adds two specific real-browser checks: anonymous My Account does not show private profile; Reset Password cannot open its password form without a recovery session. These do **not** prove post-logout isolation or expired/replayed token security. Previous six checks also passed; desktop and mobile screenshots retained in the workflow artifact.
- Brevo delivery attribution **confirmed from actual Gmail raw SMTP headers**, not inferred merely from sender address: `Received: from gy.d.sender-sib.com`, Brevo `X-sib-id` and `X-Mailin-EID`; DKIM selector `brevo1` signed by `artisanmart.site`. Google Authentication-Results for both 2026-11-25 verification and recovery messages: **SPF PASS, DKIM PASS, DMARC PASS**. This verifies Brevo delivered both types of auth email at those timestamps, though the full current hosted SMTP config has not been read from the Supabase Management API.
- Both actual emails still used Supabase's default subjects and HTML body. **Branded email templates remain FAIL until new delivered emails after activation show exact requested subjects and HTML.** Do not mark verified without independent inbox evidence.
- Supabase config deploy path available through official Management API via opt-in `.github/workflows/artisan-auth-email-config.yml`; syntax CI [45630621265](https://github.com/operationrecord1/fresh-finds-wholesale/actions/runs/45630621265) PASS. **This was syntax validation only, not a successful API GET/PATCH or actual SMTP/template activation.** The owner must store a correctly scoped Supabase Management API token as Actions secret and, if needed, existing Brevo SMTP login/key. See `docs/auth-email-template-activation-20261125.md`.
- Keep all 40-item statuses conservative. A newly passing *subcheck* does not convert a composite customer journey to PASS without complete real signup->verification->login->reset->new-password login and two-account isolation testing.

## Live independently verified QA addendum (2026-11-25)
- Real controlled customer 1, GitHub Actions [45661109191](https://github.com/operationrecord1/fresh-finds-wholesale/actions/runs/45661109191): signup, real Brevo confirmation link, SQL confirmed user and one profile, unverified password denial, verified login, My Account, reload persistence, mobile menu, logout and private route protection. All logged checks PASS.
- Real controlled customer 2, GitHub Actions [45662635567](https://github.com/operationrecord1/fresh-finds-wholesale/actions/runs/45662635567): signup/confirmation/login, cross-user RLS query returns 0 foreign profile rows, name edit persists across refresh, $580 cart preserved, authenticated checkout route. All 6 logged checks PASS.
- Actual Supabase /auth/v1/recover request for first test account HTTP 200; a separate real Brevo recovery email delivered to Gmail. **Password change, new-password login and old-password rejection remain NOT VERIFIED** (PKCE browser recovery session not completed). Branded email templates were explicitly deferred by merchant; functional delivery is the current requirement.
- Isolated Supabase sandbox DB transaction (rolled back) asserted exact $580 amount, inventory reservation and reduction on simulated paid event, repeated event idempotency, full-refund status. This is **database settlement logic only**, not an actual Stripe test-mode card payment or positive signed Stripe webhook. No public inventory was changed.
- Live Stripe webhook HMAC pure cryptographic unit test suite CI [45663327996](https://github.com/operationrecord1/fresh-finds-wholesale/actions/runs/45663327996) passed, and prior actual endpoint invalid signature rejection 400 passed. **Positive Stripe webhook payment settlement remains unverified.**
- Live checkout Edge Function v8 enforces server-owned `app_metadata.artisan_reseller_approved` for zero-tax live sales and includes `payment_intent_data[receipt_email]` for verified customers. Source is version-controlled. This does not prove Stripe has delivered a paid receipt to an actual customer.
- Latest contract demands live payment activation rather than the original disabled-payment assertion. Hence item 40 is now FAIL until genuine sandbox paid transaction, order and inventory reconciliation and final production release pass. No release flags were falsely set to PASS.
