# Milestone 1: Comparison Page

## Goal

Wire the Comparison page end-to-end on Hoodi: paginated subgraph fetch + batched on-chain reads + diff computation, with progress UI, sortable/filterable results table, localStorage persistence, and cross-page React Context so navigation never costs a re-fetch.

## Deliverables

1. Typed port of `compareOperator`, `fetchAllOperators`, `fetchOnChainOperator` from `sub-diff/compare-operators.mjs`
2. `runComparison({ onProgress })` service running the batched sweep end-to-end
3. Cross-page React Context (`ComparisonContext`) holding the Comparison page's state slab; provider mounted in `App.tsx`
4. localStorage persistence under `subgraph-verifier:comparison:v1` — hydrate on init, save on every transition into `ready`
5. `ComparisonPage` UI: empty state → progress UI → results table with filters + sort + Refresh
6. Vitest installed; unit tests covering every branch of `compareOperator`
7. `npm run build`, `npm run dev`, `npm test` all green
8. Commit `feat(milestone-1): comparison page end-to-end`, tag `v0.1.0`, progress.md updated

## Implementation steps

Order matters. Complexity: S = trivial, M = one thing can go wrong, L = multiple things.

### Phase A — Types and pure logic (testable in isolation)

1. **[S]** `npm install -D vitest` and add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
2. **[M]** `src/types/comparison.ts` — define types: `SubgraphOperator`, `OnChainOperator`, `OnChainResult` (`{ eth, ssv }`), `Diff`, `DiffRow`, `DiffCategory` (string union), `OperatorDiffs` (per-operator group). Also: `categorizeDiff(field: string): DiffCategory` mapper.
3. **[M]** `src/services/compareOperator.ts` — typed verbatim port of `compareOperator` (`compare-operators.mjs:88-155`). Returns `Diff[]` for one operator. Pure function.
4. **[M]** `src/services/__tests__/compareOperator.test.ts` — fixtures cover: no diff (matching ETH+SSV); ETH owner diff; SSV fee diff; ETH-side RPC error; SSV-side RPC error; both errors; isPrivate/active/removed mismatches; validatorCount mismatch.
5. **[S]** Run `npm test` — all green before moving on.

### Phase B — Network layer

6. **[M]** `src/services/subgraphClient.ts` — `fetchAllOperators(): Promise<SubgraphOperator[]>` typed port of `compare-operators.mjs:15-53`. Uses `SUBGRAPH_URL` from `config.ts`. Throws on `json.errors` rather than just `console.error` (callers need to know).
7. **[M]** `src/services/onChainClient.ts` — `getViewsContract()` returns a singleton `ethers.Contract` over `JsonRpcProvider(RPC_URL)`. `fetchOnChainOperator(contract, operatorId)` typed port of `compare-operators.mjs:56-85`.
8. **[L]** `src/services/comparison.ts` — `runComparison({ onProgress, signal? }): Promise<{ diffs: DiffRow[]; totalOperators: number }>`. Internally:
   - Fetch all operators from subgraph
   - Init Views contract once
   - Loop with `BATCH_SIZE = 20`, `Promise.all` *within* a batch only
   - After each batch: call `onProgress(checked, total)`, check `signal.aborted` and throw `DOMException('Aborted')` if so
   - Aggregate per-operator diffs into a flat `DiffRow[]` (operatorId duplicated across rows so the table is row-per-diff)
   - Return `{ diffs, totalOperators }`

### Phase C — State and persistence

9. **[M]** `src/store/comparisonContext.tsx` — Context + Provider. Internal `useReducer` with actions `START`, `PROGRESS`, `READY`, `ERROR`, `REFRESH_RESET`. Hydrate from localStorage on mount (try/catch, version check). Save to localStorage on `READY`. Expose hook `useComparison()` returning `{ state, run, refresh }`.
10. **[S]** Wire `<ComparisonProvider>` in `App.tsx` *above* `<Routes>`.

### Phase D — UI

11. **[S]** Install shadcn components: `npx shadcn@latest add table input select progress skeleton badge --yes`.
12. **[M]** `src/features/comparison/CategoryBadge.tsx` — small badge with color-by-category. Categories: `fee-eth`, `fee-ssv`, `owner-eth`, `owner-ssv`, `isPrivate-eth`, `isPrivate-ssv`, `active/removed-eth`, `active/removed-ssv`, `validatorCount`, `rpc-error`.
13. **[M]** `src/features/comparison/CategoryFilter.tsx` — multi-select-style checkbox group built around the shadcn `Select` UI primitive *or* a plain checkbox cluster. Default = all selected. Emits `Set<DiffCategory>`.
14. **[M]** `src/features/comparison/ResultsTable.tsx` — shadcn `Table` rendering `DiffRow[]`. Sortable by Operator ID (asc/desc). Internal `useMemo` for filter + sort.
15. **[L]** `src/pages/ComparisonPage.tsx` — replace placeholder. Three states:
    - `idle` → Card with explainer + large "Run comparison" button
    - `loading` → `Progress` bar + `Checked X/Y operators` text + elapsed time + `Skeleton` rows under
    - `ready` → header showing `lastFetchedAt` + Refresh button + count of `{visible} of {total} mismatches` + filters + table
    - `error` → simple error card + Retry button
16. **[S]** `src/utils/formatTime.ts` — `formatRelativeTime(ms: number)` for "2 minutes ago" style display. Tiny helper, no `date-fns`.

### Phase E — Verify

17. **[S]** `npm test` — passes
18. **[S]** `npm run build` — passes (TypeScript + Vite)
19. **[M]** `npm run dev` — manual smoke:
    - `/` shows empty state with "Run comparison" button
    - Click → progress bar advances; counter increments roughly every 200–800 ms
    - Sweep completes in seconds (real Hoodi data); table populates
    - Filter by operator ID → table updates instantly
    - Toggle a category off → rows of that category disappear
    - Sort toggle works
    - Navigate to `/timeline` → back to `/` → table is still rendered, no re-fetch
    - Hard refresh browser → table is restored from localStorage (lastFetchedAt unchanged)
    - Click Refresh → spinner + new sweep
20. **[S]** Inspect dev console — no React warnings, no uncaught errors, no Tailwind missing-class warnings.

### Phase F — Commit

21. **[S]** Verify `git config --local user.email` returns `ariel@ssvlabs.io`. STOP if not.
22. **[S]** Strip any debug `console.log` from UI components (services may keep progress logs per CLAUDE.md override).
23. **[S]** `git add -A && git commit -m "feat(milestone-1): comparison page end-to-end"`.
24. **[S]** `git tag -a v0.1.0 -m "Milestone 1: Comparison Page"`.
25. **[S]** Update `progress.md`.

## Files created

- `src/types/comparison.ts`
- `src/services/compareOperator.ts`
- `src/services/__tests__/compareOperator.test.ts`
- `src/services/subgraphClient.ts`
- `src/services/onChainClient.ts`
- `src/services/comparison.ts`
- `src/store/comparisonContext.tsx`
- `src/features/comparison/CategoryBadge.tsx`
- `src/features/comparison/CategoryFilter.tsx`
- `src/features/comparison/ResultsTable.tsx`
- `src/utils/formatTime.ts`
- `src/components/ui/table.tsx`, `input.tsx`, `select.tsx`, `progress.tsx`, `skeleton.tsx`, `badge.tsx` (shadcn)

## Files modified

- `src/App.tsx` — wrap routes in `<ComparisonProvider>`
- `src/pages/ComparisonPage.tsx` — full implementation
- `package.json` — add `vitest`, test scripts
- `progress.md` — milestone update

## Testing criteria

Milestone passes when ALL true:

- [ ] `npm test` passes; `compareOperator` test suite has at least 7 cases covering each diff branch + a no-diff baseline
- [ ] `npm run build` passes
- [ ] `npm run dev` boots; manual flow in step 19 works end-to-end against real Hoodi
- [ ] After a sweep, the diff count in the UI matches what the reference `node compare-operators.mjs` script produces (or differs only by the count of operators newly registered/changed since the reference script was last run — flag any other discrepancy)
- [ ] Navigation `/` → `/timeline` → `/` does NOT re-fetch (verified by checking the Network tab: zero subgraph/RPC requests)
- [ ] Hard browser refresh restores the table from localStorage
- [ ] Refresh button clears localStorage and triggers a new sweep
- [ ] No `console.log` in UI files; no `console.error` for handled error states

## Out of scope (do NOT do in this milestone)

- The Operator Timeline page (Milestone 2)
- Authenticated subgraph fallback (deferred — wire if 429s land)
- Cancel-in-flight button (the `AbortSignal` slot is reserved but no UI)
- Operator-detail Dialog side panel (nice-to-have per spec — defer)
- Vercel config (`vercel.json`)
- Pushing to GitHub
- Estimated-time-remaining indicator in progress UI (nice-to-have, can add late if cheap)

## Risks / gotchas

- **`Promise.all` within a batch** is correct (parallel within 20). **Across all operators** is wrong — that's the rate-limit footgun the spec calls out. Code review must catch this if a refactor sneaks it in.
- **BigInt strings vs. JS numbers** — subgraph fees come as strings; on-chain `r[1]` is a `bigint` we `.toString()`. The string compare in `compareOperator` is correct *only* because both sides are stringified. Don't switch to numeric comparison — would lose precision.
- **`removed` vs `isActive`** — opposite polarity. The check `sg.removed === eth.isActive` flags equality (since equality of opposite booleans means a mismatch). Easy to misread.
- **Provider singleton** — instantiating `JsonRpcProvider` per call would leak connections and slow down. Module-level singleton is correct.
- **localStorage quota** — covered in research; ~600 KB worst case. If we ever exceed 5 MB, a try/catch around `setItem` should fall back to in-memory only and warn the user.
- **Strict mode double-invocations in dev** — React 18+ StrictMode runs effects twice in dev. The hydrate-on-mount effect must be idempotent.
