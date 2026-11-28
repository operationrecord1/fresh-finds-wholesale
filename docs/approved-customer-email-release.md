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

## Verified activation blocker

2026-11-28: the read-only configuration workflow run `46107575076` failed because
`SUPABASE_MANAGEMENT_TOKEN` is absent. No auth configuration was changed by that run.
The browser account `operationrecord1` only exposes the Fulfilment organization and
Supabase reported that it does not have access to Artisan project `gbsyaembvdtadkuldpbe`.
The correctly authorized project owner must sign in before dashboard activation can finish.
Never put access tokens, SMTP passwords or recovery links in a chat or public file.

## Acceptance

Browser responsive checks verify layout, not Gmail/Outlook/Apple Mail inbox rendering.
After activation, send controlled verification and recovery messages to an owned inbox,
inspect the received logo, button, mobile layout and actual secure link, and complete
the confirmation/recovery flow before claiming end-to-end delivery success.
