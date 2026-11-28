# Approved customer email design

The approved white, teal and blue email design is in `supabase/email-templates`.
The email-safe PNG logo is served at `/email/artisan-mart-logo.png`.
Templates use presentation tables, inline styles, Arial fallback fonts, fluid widths,
mobile padding rules, wrapped action URLs and accessible HTML text/buttons.

## Activation scope

`artisan-auth-email-config.yml` applies confirmation, password recovery, email change
and password-changed notification templates through the Supabase Management API.
It preserves existing SMTP, verification and redirect settings unless dedicated SMTP
credentials were explicitly configured in its environment. It reports configuration
verification separately from actual delivery and recovery verification.

The other approved templates are prepared for backend integration. Adding these files
does not enable welcome, order, shipment, refund or contact acknowledgment sending.
`customer-email-triggers.json` records the event and truthful activation scope for each.
Do not send order confirmations before authoritative payment success, cancellation
confirmations before staff confirmation, or refunds before processor confirmation.

## Production activation

2026-11-28: the read-only configuration workflow run `46107575076` failed because
`SUPABASE_MANAGEMENT_TOKEN` is absent. No auth configuration was changed by that run.
The browser account `operationrecord1` only exposes the Fulfilment organization and
Supabase reported that it does not have access to Artisan project `gbsyaembvdtadkuldpbe`.
The owner subsequently signed in with the account that has access to the Artisan Mart
organization. Activation was completed through the project dashboard on 2026-11-28:

- Signup confirmation: approved HTML saved and reloaded; exact normalized body match.
- Password recovery: approved HTML saved and independently reopened; exact match.
- Email-change confirmation: approved HTML saved and independently reopened; exact match.
- Password-changed notification: approved HTML saved, notification enabled, reloaded and
  checked for exact body match and enabled state.
- Existing custom Brevo SMTP remains enabled with sender name Artisan Mart. Its sender
  address and credentials were preserved; the historical finance sender expectation was
  not used to overwrite the working configuration.
- The hosted PNG loads in the actual email HTML from another origin. Supabase's isolated
  dashboard preview did not load the image; the external email HTML loaded the 570×96 asset.

The earlier workflow failure remains historical evidence, not a current activation blocker.
No management token was created and no SMTP password, redirect or verification setting
was changed. Never put access tokens, SMTP passwords or recovery links in a public file.

## Acceptance

Browser responsive checks verify layout, not Gmail/Outlook/Apple Mail inbox rendering.
Template activation is verified; actual inbox delivery is not yet verified. A customer-owned
existing account email was requested for a controlled password-recovery test.
Send controlled verification and recovery messages to an owned inbox,
inspect the received logo, button, mobile layout and actual secure link, and complete
the confirmation/recovery flow before claiming end-to-end delivery success.
