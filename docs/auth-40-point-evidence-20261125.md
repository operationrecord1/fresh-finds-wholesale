# Artisan Mart — 40-point authentication evidence matrix (2026-11-25)

PASS = currently supported by actual observed production evidence for the limited specified check; where incomplete follow-up is needed it is stated. FAIL = demonstrated defect. NOT VERIFIED = no sufficient final E2E evidence. Automated build or source implementation alone never counts.

| # | Requirement / expected behavior | Actual observation | Method | Status |
|---|---|---|---|---|
| 1 | Valid customer registration — Real signup to verified account | No fresh end-to-end signup in this session | Live controlled E2E | **NOT VERIFIED** |
| 2 | Invalid registration input — Reject invalid fields | Earlier production browser validation PASS | Production Playwright 45628496758 | **PASS** |
| 3 | Mandatory agreements — Block without consent | Existing browser test PASS | Production Playwright 45628496758 | **PASS** |
| 4 | US phone formatting — Display +1 format and store E164 | Display verified; fresh persisted profile untested | Production Playwright 45628496758 | **PASS** |
| 5 | International phone validation — Accept country-valid numbers | UK and Bangladesh inputs verified | Production Playwright 45628496758 | **PASS** |
| 6 | Invalid phone rejection — Prevent invalid phone | Browser rejection verified | Production Playwright 45628496758 | **PASS** |
| 7 | Password realtime validation — Realtime per-rule validation | Browser rules checked | Production Playwright 45628496758 | **PASS** |
| 8 | Red password errors — Unsatisfied requirements red | Browser inspected rule states | Production Playwright 45628496758 | **PASS** |
| 9 | Confirm password matching — Block mismatch | Browser mismatch rejection confirmed | Production Playwright 45628496758 | **PASS** |
| 10 | Supabase user creation — Create new Auth identity | Historical test only; no new final lifecycle | Supabase database read | **NOT VERIFIED** |
| 11 | Customer profile creation — One accurate profile per identity | Only existing single profile observed | Supabase database read | **NOT VERIFIED** |
| 12 | Branded verification email — Delivered with branded HTML/subject | Delivered generic Supabase template historically; config not changed | External Gmail message read | **FAIL** |
| 13 | Genuine signup confirmation link — Actual token confirms new user | Not executed for current release | None | **NOT VERIFIED** |
| 14 | Email confirmation — Confirmed Auth state after token | Not executed for current release | None | **NOT VERIFIED** |
| 15 | Successful verified login — Password grant from verified new customer | Not executed for current release | None | **NOT VERIFIED** |
| 16 | Wrong password rejection — Real auth denies wrong password | Historical tests; current release not independently retested | None | **NOT VERIFIED** |
| 17 | Unverified account restrictions — Cannot sign in before email confirm | Historical auth log only | Auth logs from earlier run | **NOT VERIFIED** |
| 18 | Resend verification — New external email reaches inbox | Not freshly executed | None | **NOT VERIFIED** |
| 19 | Customer name header — Actual profile name | Source implemented, authenticated browser pending | None | **NOT VERIFIED** |
| 20 | Account menu — My Account/Logout functional | Authenticated browser untested | None | **NOT VERIFIED** |
| 21 | My Account page — Private DB info shown to owner | Source implemented, private live browser pending | None | **NOT VERIFIED** |
| 22 | Profile edit success — Persist valid update and refresh | Source fix; authenticated browser untested | None | **NOT VERIFIED** |
| 23 | Invalid profile edit rejection — Reject blank name/bad phone | Source fix only, new browser test pending | None | **NOT VERIFIED** |
| 24 | Failed save recovery — Retry and recover after network failure | Source fix only | None | **NOT VERIFIED** |
| 25 | Session persistence — Refresh/multi-tab/reopen | No new authenticated browser test | None | **NOT VERIFIED** |
| 26 | Logout — Revoke intended session and clear UI | No new authenticated browser test | None | **NOT VERIFIED** |
| 27 | Private route after logout — No private account data | Only anonymous route verified historically | Production browser 45628496758 for guest checkout | **NOT VERIFIED** |
| 28 | Forgot-password navigation — Correct route and navigation | Route loads; click journey untested | Production browser smoke | **NOT VERIFIED** |
| 29 | Branded recovery email — Delivered with branded HTML/subject | Delivered generic Supabase template historically | External Gmail message read | **FAIL** |
| 30 | Genuine recovery link — Open actual link to /reset-password | Not exercised in new release | None | **NOT VERIFIED** |
| 31 | Password updated — Successful Auth update | Not exercised | None | **NOT VERIFIED** |
| 32 | New-password login — Login with new credential | Not exercised | None | **NOT VERIFIED** |
| 33 | Old-password rejection — Old credential denied after reset | Not exercised | None | **NOT VERIFIED** |
| 34 | Invalid/expired/reused recovery links — All states blocked | Browser test for missing token added; expired/reused pending | New test not deployed yet | **NOT VERIFIED** |
| 35 | Two-user data isolation — A cannot access B data | RLS reviewed, cross-user test pending | Read-only policy review | **NOT VERIFIED** |
| 36 | Cart preservation — Cart quantities, discounts survive auth | Historical browser evidence only | Historical CI | **NOT VERIFIED** |
| 37 | Guest checkout redirect — Login required | Actual production browser PASS | Production Playwright 45628496758 | **PASS** |
| 38 | Authenticated checkout — Verified user returns to checkout | New authenticated session E2E pending | None | **NOT VERIFIED** |
| 39 | Desktop/mobile flows — Works at desktop and mobile | Production 390px smoke and CSS layout passed; full auth journeys pending | Production Playwright 45628496758 | **PASS** |
| 40 | Live Stripe payment disabled — No live checkout activation | Cloudflare flag false, private DB flag false | Cloudflare and Supabase read | **PASS** |

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