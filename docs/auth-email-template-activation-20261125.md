# Artisan Mart — Auth SMTP/Email Template Deployment Gate (2026-11-25)

This procedure uses the **existing** Supabase project `gbsyaembvdtadkuldpbe`, GitHub repository and Brevo sender. It does **not** enable Stripe, create purchases, change the catalog or modify the existing UI. It is for production account-confirmation and password-recovery emails.

## Verified starting point
- Production storefront and auth code: https://artisanmart.site
- Supabase project: https://supabase.com/dashboard/project/gbsyaembvdtadkuldpbe
- Previously delivered real external verification and recovery emails used **default Supabase subjects/body**, not the approved Artisan templates.
- Existing HTML files in this repository are the complete templates:
  - `supabase/email-templates/confirm-signup.html`
  - `supabase/email-templates/reset-password.html`
- The templates' real action URLs are Supabase Go-template variable `{{ .ConfirmationURL }}`; do not replace with a hardcoded website URL.

## Two authorized activation options

### Option A — GitHub Actions Management API workflow (preferred when owner can store credentials)
1. On the proper owner account, obtain a **new least-privileged Supabase Management API token** with `auth_config_write` and `project_admin_write` permission for project `gbsyaembvdtadkuldpbe`. Do not post the token in a chat or commit.
2. Open https://github.com/operationrecord1/fresh-finds-wholesale/settings/secrets/actions and create repository secret `SUPABASE_MANAGEMENT_TOKEN` with that token. Limit access/expiry as appropriate.
3. If the existing Supabase Auth SMTP configuration is not `smtp-relay.brevo.com`, retrieve the **SMTP login** and a **dedicated SMTP key** (NOT the Brevo API key) at https://app.brevo.com/settings/keys/smtp. Create two additional GitHub Actions secrets `BREVO_SMTP_LOGIN`, `BREVO_SMTP_KEY`. If it already is correctly configured, these extra secrets are optional and no SMTP credentials are changed.
4. Open https://github.com/operationrecord1/fresh-finds-wholesale/actions/workflows/artisan-auth-email-config.yml and click **Run workflow** on `main` with **verify** first. It performs Management API GET without printing raw configuration or secrets, then writes sanitized evidence.
5. To activate the complete HTML templates, run the same workflow on `main` with **apply**. It uses PATCH only on `mailer_subjects_confirmation`, `mailer_subjects_recovery`, `mailer_templates_confirmation_content`, `mailer_templates_recovery_content`. If Brevo login/key are present, it additionally updates the six SMTP parameters and preserves `mailer_autoconfirm=false`. It refuses to apply branding if a custom Brevo SMTP relay is neither already configured nor being configured.
6. Run **verify** again and inspect `auth-config-verification/report.json` artifact. This proves stored config match, NOT actual email delivery.
7. Revoke the management token after successful activation if no future automatic use is needed; remove/rotate the repository secret accordingly.

### Option B — direct owner dashboard changes
1. In https://supabase.com/dashboard/project/gbsyaembvdtadkuldpbe/auth/templates choose **Confirm signup**. Set the subject to exactly **Welcome to Artisan Mart — Verify Your Email Address** and paste the **entire** contents of `confirm-signup.html` as the HTML body. Save.
2. Choose **Reset password**. Set subject to exactly **Reset Your Artisan Mart Password** and paste the entire `reset-password.html` contents. Save.
3. In Supabase Authentication > Emails > SMTP Settings, verify **Custom SMTP ON**, Sender email **finance@artisanmart.site**, Sender name **Artisan Mart**, Host **smtp-relay.brevo.com**, Port **587**, Username equal to Brevo's SMTP Login, and Password equal to the Brevo **SMTP key**. Choose existing valid SMTP credentials or rotate in Brevo first. The From domain must be verified in Brevo.
4. In Authentication > URL Configuration, verify Site URL **https://artisanmart.site** and allow-list redirects **https://artisanmart.site/login** and **https://artisanmart.site/reset-password**. Preserve any additional existing legitimate URLs.
5. Ensure Email signup is enabled and **Confirm email** remains ON. Do not disable verification to make tests pass.

## Required acceptance evidence after changing configuration
- Sign up with a new owned test email through the actual production UI; inspect the Auth user ID plus exactly one matching `artisan_profiles` row and E.164 phone.
- Receive the email in an external inbox with sender `Artisan Mart <finance@artisanmart.site>`, the requested subject, the authorized HTML styling and actual valid link. Check SPF/DKIM/DMARC and Brevo Transactional Logs if available.
- Confirm the link redirects to production, then successful login and rejection of pre-confirmation login. Verify resend.
- Use Forgot Password from production and receive a new branded reset email; follow the actual token to `/reset-password`, set a new password, sign out, sign in with the new password, and confirm the previous one fails.
- Validate expired and replayed tokens, missing recovery token, session refresh, multi-tab logout, two-user cross-access isolation, profile updates, cart quantity and coupon preservation, and authenticated checkout routing.
- Run real desktop/mobile Playwright tests with screenshots. **Do not** mark these PASS based only on template config, HTTP 200, mocked tests or previous production reports.
- Supabase private release flags are currently FALSE; leave them truthful. **Stripe live checkout stays disabled**.

## Safety
- Do not paste Brevo SMTP keys, Supabase Management API tokens, email verification tokens, passwords, Stripe keys or recovery codes into repository files, terminal output, email or chat.
- Do not use the Supabase public anon/publishable key or Stripe API keys to call the Management API: they are not management authorization tokens.
- The `artisan-auth-email-config.yml` workflow runs on explicit owner dispatch only for configuration changes, with `contents: read` GitHub permission, and fails closed if missing credentials/configuration.
- If Management API GET/PATCH fails with 401 or 403, check the token's fine-grained scopes and authorized project before trying again. Never print the raw response, which may contain sensitive SMTP config.
- Do not enable Stripe, change shipping/taxes, or modify store products in this authentication phase.

## Brevo click-tracking security check
- The previous delivered confirmation and recovery emails contain link wrappers on `*.sendibt2.com`, a Brevo tracked redirect, rather than a directly exposed Supabase Auth URL. This does not establish a failed link, but links containing single-use verification or password-reset tokens should not be tracked/prefetched by an intermediary.
- In Brevo transactional email settings, disable **click tracking** (and where applicable link rewriting) for Supabase authentication emails. Check the applicable SMTP/transactional campaign setting rather than merely disabling marketing campaign tracking. Send a NEW controlled confirmation and recovery email; inspect their actual hyperlink destinations and verify they lead to the intended Supabase confirmation flow and production redirect. Do not reuse/print old one-time tokens.
- Do not consider link delivery a full PASS until a newly delivered action link has been clicked, verified and completed with a fresh owned QA account.
