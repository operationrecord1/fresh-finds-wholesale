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

## Authorized implementation and release policy
- For an explicitly authorized implementation/release request, complete onboarding, implementation, relevant automated checks, real-browser visual acceptance, review, commit/push, merge to `main`, Cloudflare production deployment monitoring, deployed-commit verification and live regression checks. Do not stop at a plan, branch or PR, or ask for repeated routine approval already granted by the user.
- Stop only for a genuine technical blocker, mandatory platform permission or serious security concern. Never bypass security controls or claim unfinished verification succeeded.
- Preserve valid existing work and published history. Keep changes within the requested scope; do not combine visual work with backend synchronization or historical PRs.
- Listing redesigns must use listing-specific styles/variants. Preserve the homepage, navigation, footer, catalog, pricing, stock validation, wholesale rules, authentication, cart, checkout, Stripe and Supabase unless explicitly included in the task.
- Verify current production and repository state independently. Document discrepancies rather than assuming historical reports describe the current implementation.

### Definition of done — production release
- The deliverable of a website modification is the actual updated production website at https://artisanmart.site. Code, commits, development branches, pull requests, preview screenshots, started tests and pending deployments are not completion.
- Continue monitoring running tests and deployments when execution capabilities permit; independently resolve implementation-related failures and handle branch/PR/merge decisions within the authorized scope without repeated routine approval. Try supported alternatives when verification is unavailable.
- Complete only after relevant tests, final diff review, merge into main, successful Cloudflare production deployment of the intended commit, live browser verification and post-release regressions. For visual changes, capture and inspect fresh live screenshots. Report actual evidence and any unresolved limitation; never claim completion without live verification.
