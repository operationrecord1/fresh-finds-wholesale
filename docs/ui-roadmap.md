# Artisan Mart reference-first implementation

## Sources and priority
- Kole Imports research report, October 22, 2026 (42 pages), particularly sections 3-4 and screenshots S01-S05.
- Current Kole Imports homepage inspected November 4, 2026 (Dhaka). Its current campaign artwork differs from the October snapshot.
- Current project: operationrecord1/fresh-finds-wholesale. Earlier artisan-wholesale-market work is reference only, not assumed merged here.
- Latest user direction: finish customer-facing UI first, then authentication and admin workflows. Working changes may be deployed to the existing GitHub Pages preview.

## Preserve
- Artisan Mart identity, existing source-observed catalog, wholesale math and $500 minimum.
- Correct source product/media relationships. Do not invent catalog fields or treat missing media as complete.
- Existing Lovable build and GitHub Pages deployment.
- Firebase remains the planned backend; do not introduce another database.

## Implementation sequence
1. Reference layout: header/navigation, homepage, listings/cards, product details/quick view, cart/checkout, footer and responsive behavior.
2. Authorized product feed/images and promotional artwork; complete product/category mapping and verified purchasing rules.
3. Firebase Authentication; customer sessions/profile; Firestore catalog/orders; Storage media.
4. Secure admin draft/publish/unpublish and order management; customer-specific cart/history.
5. Server-validated ordering/payment integration and release verification.

## Current UI pass
- Responsive header: keep navigation on a deliberate row; account/cart remain available on small screens.
- Shared 1452px content maximum; 300px desktop hero; 220px product photo region; 232px listing sidebar.
- Preserve two homepage panels across with three products per panel at desktop size.
- Collection icons, stronger product-title hierarchy, responsive listing columns, mobile sorting/filter access.
- Category/price/knowledge menus expose expanded state and close on Escape or outside click.

## Remaining parity gaps
- Original hero artwork and product images are not integrated. Current placeholders remain visible.
- Product gallery/share/review details, cart editor/shipping estimator, checkout header/forms, informational/footer pages need further reference comparison.
- No claim of exact visual parity, complete catalog, working login or real payment integration.
