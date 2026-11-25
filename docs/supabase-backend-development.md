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
