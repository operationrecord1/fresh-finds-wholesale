# Checkout confirmation verification — 28 November 2026

## Confirmed faults and corrections
- Production browser displayed the duplicate `returnUrl` / session `return_url` error.
- Real Stripe sandbox execution then exposed duplicate session email submission and a phone submission without enabled Stripe phone collection. Confirmation now relies on the session's email/return URL; the order retains the submitted phone.
- Confirmation supplies the selected billing and delivery addresses, including apartment/suite.
- One shared formatter renders existing unique order sequences as `114-5401022-4638625` (3-7-7 digits). Database IDs and existing records remain unchanged.
- Independent Auth/vault and item/account verification requests run concurrently. UI shows preparation immediately and brings the payment section into view.
- US-only billing displays `United States`; duplicate Stripe billing fields are suppressed and the validated US address is passed to confirmation.

## Genuine Stripe sandbox browser transaction
- Used the actual production `StripePayment` component, Stripe Checkout Elements SDK, a real Stripe test session, and isolated `artisan_sandbox` order/stock tables.
- An insufficient-funds card produced Stripe's actual decline response and stayed on checkout for retry.
- Stripe detected Visa and Mastercard dynamically during entry.
- Authentication-required test card opened the real Stripe 3D Secure 2 test challenge. Completing it led to `Payment confirmed by Stripe` in the component.
- Stripe API independently reported session `complete`, payment `paid`, `livemode=false`, total USD 580.00 and PaymentIntent `pi_3Ugbpq3sdabWE5fZ1LEft4vu`.
- The selected separate delivery address, including Suite 2, was present in Stripe's collected shipping details.
- Real signed webhook settled sandbox order `75f1b144-33e9-4cc7-8491-013215f408eb` to `confirmed/paid`.
- Isolated SKU DA883 stock changed from 740 to 700, with reserved stock returning to 0. No production stock or real funds were changed.

## Scope of evidence
The browser transaction used a localhost QA harness mounting the production component with a server-created, attached sandbox session. It verifies real card confirmation and signed webhook settlement, not a real-money charge. Production deployment and authenticated checkout preparation are checked separately. The local harness/client secret is excluded from Git and production builds.
