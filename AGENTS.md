<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Storefront catalog currently uses `src/data/catalog.ts`; Supabase is authoritative for checkout pricing, stock reservations and order settlement. Verify parity before catalog changes; null = unverified, never guess.
- Wholesale math (lot, MOQ, case, $500 minimum) lives in `src/lib/wholesale.ts` with tests in `wholesale.test.ts`; UI must not reimplement it.
- Cart state is frontend-managed (`src/lib/cart.tsx`); Supabase Auth and Edge Functions handle verified customer checkout. Do not add another production database without user approval.
- Store UI components live in `src/components/store/`; routes stay thin.

## Permanent implementation and release policy
- Implementation requests authorize scoped changes, commits, merges and production deployments without repeated routine approval. Preserve unrelated approved design, data, business rules and security controls.
- Inspect and reproduce first; implement targeted corrections; run unit tests, TypeScript, production build, browser and relevant backend/sandbox tests; resolve failures and review actual screenshots and final diff before merging.
- Merge validated changes into main, synchronize necessary Supabase deployments, verify Cloudflare production deployment and exact commit, inspect live website and complete post-deployment regression checks.
- Never equate passing CI with visual acceptance. Measure visible glyph edges and actual outer card boundaries at relevant viewport breakpoints; preserve reference section spacing. Test 240–2500px when applicable.
- Recheck running workflows and deployments using available capabilities; do not stop for routine pending work or request repeated continue instructions. Try supported alternatives if verification fails. Stop only for genuine technical, permission or security blockers; report exact evidence and unresolved items, never claim unverified success.
- Never expose secrets, charge real cards during QA, enable unapproved payment settings or perform destructive migrations. Recover deployed backend source before modifying functions; never overwrite a working function with incomplete source.
