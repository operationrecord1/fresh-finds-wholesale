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
- Catalog data lives only in `src/data/catalog.ts` (Product shape); null = unverified, never guess. Swap for the authorized feed/Firebase later without changing components.
- Wholesale math (lot, MOQ, case, $500 minimum) lives in `src/lib/wholesale.ts` with tests in `wholesale.test.ts`; UI must not reimplement it.
- Cart state is frontend-only (`src/lib/cart.tsx`, sessionStorage) until Firebase is integrated; do not add another production database without user approval.
- Store UI components live in `src/components/store/`; routes stay thin.
