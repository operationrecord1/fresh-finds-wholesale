# Artisan Mart Supabase development — isolated, not production

## Isolation and authoritative baseline

- Production GitHub branch: `main`, commit `8795a2231462f56ab367b61b160cd341039a54f5`
- Development branch: `development/supabase-backend-20261125`
- Dedicated Supabase project: `gbsyaembvdtadkuldpbe`, `finance@artisanmart.site` organization, Free plan
- Do not use the unrelated Fulfilment organization's database.
- Source of truth for recovery: `src/data/catalog.ts` at the baseline commit, 125 SKUs, 354 product images.
- `supabase/migrations/20261125025000_artisan_catalog.sql` creates the catalog and RLS restrictions.
- `supabase/migrations/20261125030000_artisan_catalog_index.sql` adds collection lookup index.
- `node scripts/export-artisan-seed.mjs` deterministically creates `artisan-catalog-seed.sql` from the original catalog; the output is untracked and should be treated as one-time **initial seed only**. Existing product modifications must not be silently overwritten.

## Verification performed

The full original product JSON object for all 125 products was compared recursively with `source_record` in Supabase. Result: 125 / 125 exact matches. The normalized catalog has 125 products, 354 product image associations, 32 catalog categories, five collections, 355 collection memberships, and no orphan image/collection association. Security advisor returned no security warnings; the unindexed collection foreign key was corrected. Every exposed Artisan table has RLS enabled, anonymous read permission and no anonymous/authenticated write permission.

## Release gate

The storefront must **not** be switched to live Supabase data until a controlled database price/stock update is demonstrably reflected in a **development preview** and restored, with all original automated and browser regression checks passing. Inability to fetch current catalog data must show an explicit availability/error state instead of presenting stale hardcoded prices. Do not introduce real checkout or payment fields as part of catalog migration.

Future customer authentication, order processing and inventory transactions require separate verified migrations and tests before public release. Never store a service-role key in a browser or repository.

## Authentication and account readiness (development only)

- Supabase JS pinned in package.json and bun.lock; customer registration/login, email reset, resend confirmation, session provider, protected account page and customer-name dropdown are implemented on the development branch.
- Original guest header remains, and guest cart is preserved before login/verification. The checkout route requires an authenticated user with `email_confirmed_at`.
- The previous demo card input and fake order-success modal have been replaced with a disabled checkout explanation. **There is no public payment, no raw card capture, and no production rollout.**
- Test signup successfully created an unconfirmed QA user and profile; a Supabase confirmation email reached the controlled Gmail alias.
- **BLOCKER:** The delivered confirmation URL redirected to `http://localhost:3000`. The Supabase Auth production Site URL / redirect allowlist needs changing to the real Artisan Mart domain.
- **BLOCKER:** Supabase's default SMTP is not approved for sending signup/recovery emails to arbitrary external customer addresses. Custom SMTP must be configured and verified with real external test addresses. Brevo DKIM DNS exists, but no Brevo SMTP access was available through connected tools. Email templates are staged at `supabase/email-templates/` but are **not yet installed into Supabase Auth settings**.
- Signup email verification completion, password recovery delivery/completion, two verified customer sessions and real logged-in desktop/mobile behavior are NOT VERIFIED.
- Do not merge development auth to production before these gates pass.

## Pending-payment order and inventory foundation (dedicated Artisan Mart database)

Applied migrations include:
- `20261125041000_artisan_orders_inventory.sql`: orders, immutable item price/identity snapshots, private stock reservations, payment event receipts, private release flag OFF, owner-only order RLS, server-price/quantity validation, and 30-minute reservations.
- `20261125044000_artisan_inventory_expiration_cron.sql`: PostgreSQL pg_cron runs pending reservation cleanup every five minutes. One successful scheduled job execution observed.
- `20261125044500_artisan_checkout_idempotency_lock.sql`: transaction advisory lock serializes duplicate order requests per customer/key.
- `20261125045000_artisan_payment_reconciliation_foundation.sql`: **service-role-only**, internal event settlement function, with event-ID deduplication and no publicly accessible webhook or Stripe integration.
- `20261125045500_artisan_catalog_realtime.sql`: product table in Supabase Realtime publication, available inventory view = physical stock less active reserved quantity.
- `20261125050000_artisan_order_request_rate_limit.sql`: per-customer checkout request throttling, retaining idempotency for exact retries.

Test evidence:
- A controlled 40-unit checkout created a 58,000-cent pending/unpaid order and reserved 40 units; retrying with the same idempotency key produced one order.
- Attempted browser prices of $0.01 were ignored: authoritative $14.50/unit and $580 subtotal prevailed.
- Cancelling or expiring a pending order returned reservation to zero without changing physical stock of 780.
- Cross-customer order and item RLS returned zero rows; unauthenticated users cannot access orders.
- Direct customer payment-status and inventory modifications are denied by privileges.
- Negative minimum-order, invalid product, invalid quantity and stock-limit test requests were rejected.
- **All direct order simulations were wrapped in database transactions and rolled back.** Live orders, order items, reservations and reserved stock remained zero; public checkout gate remained OFF.
- A synthetic paid-event application attempt was blocked by tool safety; actual payment confirmation/settlement and simultaneous competing-customer stress tests remain NOT VERIFIED.
- Cron success, event-settlement permissions and reservation constraints are not substitutes for signed Stripe webhook verification.

## Critical release policy and rollback

1. **Do not activate public checkout until the next explicitly approved Stripe payment release**. Payment verification must not trust a success redirect. A future signed webhook server must call the service-only settlement routine only after signature/event verification and idempotent session reconciliation.
2. Keep email-confirmation-required customer checkout, Auth URL/SMTP verification, 125-product/354-image integrity, visual regression, RLS cross-user access and actual parallel reservation tests as release gates.
3. Current production GitHub branch remains `main` commit `8795a2231462f56ab367b61b160cd341039a54f5`, with Cloudflare canonical deployment unchanged. Original GitHub backup: `backup/artisanmart-pre-cloudflare-20261125`, Netlify previous deployment remains for rollback.
4. Database schema migrations are **additive**. To recover catalog data, use baseline `src/data/catalog.ts` and the deterministic seed generator; do not overwrite newer authoritative catalog rows by re-importing historical snapshots. Any order rollback after real customers exist requires careful reconciliation, never a destructive drop migration.
5. Auth production settings and SMTP are **not configurable through the currently connected Supabase tools**, so don't claim them applied. No paid tier, Stripe charge or new production deployment was activated in this work.
