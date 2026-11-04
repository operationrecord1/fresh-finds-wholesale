# Cart behavior audit — 2026-11-04

Reference: live KOLE Imports DA883 product and /checkout/cart, tested through the browser before source changes.

## Observed

- Add To Cart displays Please Wait, stays on the product page and updates the header count.
- Moving the pointer onto the cart exposes a mini-cart with item count, total, product image/title, SKU, price, quantity, subtotal, REMOVE, CHANGE, View Your Cart and checkout controls. Pointer placement used a neutral-area drag ending at the cart because this browser interface has no standalone hover API; the resulting visible panel was inspected and clicked.
- CHANGE opens the product gallery/quantity modal. Case plus/minus changed 10 -> 20 -> 10 pieces and $72.50 -> $145 -> $72.50. Update shows a pending state, commits and closes the modal without leaving the product page.
- Opening Change again, changing the draft and closing the modal leaves the committed 20-piece cart unchanged.
- DELETE opens a custom centered overlay: Remove this item? / Cancel / OK. Cancel retains item and total; OK removes it and updates count and totals to zero on the same cart page.
- CLEAR CART opens Remove all item? / Cancel / OK. Cancel retains the cart; OK empties it, displays No data and disables checkout. Test cart left empty.
- Supplier anomaly reproduced twice: adding the displayed single 10-piece DA883 case resulted in 8 pieces/$58 in cart. Explicitly updating to 20 pieces produced 20/$145. We preserve exact customer-selected case quantities rather than reproduce that mismatch.
- Attempted multi-item Express Order test stalled at the supplier loading overlay, so that particular reference flow is not verified. Reload recovered the page with an empty cart. Multi-item cancellation/clear is covered in our automated tests and live QA.

## Implementation

- Shared custom accessible confirmation for full cart and mini-cart removal; Cancel/Escape do not mutate storage. OK commits one atomic update.
- Desktop hover preview; desktop click opens full cart. Touch/keyboard can toggle the preview. Escape/outside click close it. CHANGE opens the existing product modal.
- Cart quantities retain case/piece mode, merge repeated SKU additions, calculate exact line totals, and persist through same-tab reloads via sessionStorage. Malformed stored entries are ignored.
- Edit state is a draft until Update Cart. No form submission or location reload is used for cart mutations.
- Existing catalog, doubled prices, and backend-free scope are preserved. No real payment or order transmission added.
