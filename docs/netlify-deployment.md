# Netlify deployment

Import `operationrecord1/fresh-finds-wholesale` in Netlify and deploy the `main` branch. The repository's `netlify.toml` sets the build command to `npm run build:netlify` and publishes `dist/client`. Node 22 is required. No environment variables, Firebase project, API keys, functions, or database are needed.

The build generates a static SPA with a root base path and a fallback for direct product/collection URLs. GitHub Pages remains supported separately through `npm run build:pages` with its existing subpath.

## Catalog

The 125 authorized products and their purchase rules are in `src/data/catalog.ts`. Supplier prices are stored as `originalPrice`; storefront prices are exactly twice that amount. Provenance and the first up to three supplier gallery URLs are recorded in `docs/kole-import-2026-11-04.json`. All 354 images are local WebP files under `public/images/products/`, avoiding supplier hotlink dependence. Prices and available quantities are snapshots, not a live supplier feed.

Product images use browser lazy loading. Listing results render in batches of 24 with a Load More fallback. Product quick view loads on demand. The gallery, piece/case quantities, calculated totals, filtering, search, and cart run in the browser. The cart persists across reloads in the same browser tab via sessionStorage. Closing the session can clear it. No payment is collected and no actual order is transmitted.

Before publication run `npx tsc --noEmit`, `npm test`, and `npm run build:netlify`. Netlify account authorization is required to create or connect a deployment; a successful local build alone does not mean it is deployed.

## Collection presentation

The catalog contains exactly 125 unique SKUs across the two supplied lists. Legacy placeholders are excluded. Collection memberships follow supplier new/closeout/reduced flags and previously observed best-seller assignments. Where a collection has fewer than 51 products, a separately labeled More to Explore section supplies complementary products to bring that page to 51 unique products without inventing badges or sales claims. Category pages remain limited to genuinely matching products.

The supplier provides fewer than three gallery images for 21 products; their real images are retained without duplication.
