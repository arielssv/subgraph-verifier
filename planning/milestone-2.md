# Milestone 2: Operator Timeline Page

## Goal

Wire the Timeline page on Hoodi: text input for operator ID, Load triggers 9 paginated event queries + 2 pre-genesis queries + 4 RPC reads, results render as a pre-genesis snapshot card, a chronological timeline with colored event cards and block markers, and a current on-chain state card. Cross-page state so navigating away and back keeps the last-loaded operator visible.

## Deliverables

1. `src/services/timelineClient.ts` — generic `fetchAllPaginated(entity, where, fields)` helper
2. `src/services/timeline.ts` — `loadTimeline(operatorId, { onStage, signal })` orchestrator running 3 stages (events, pre-genesis, on-chain)
3. `src/types/timeline.ts` — discriminated union `TimelineEvent`, `TimelineData`, `TimelineState`
4. `src/store/timelineContext.tsx` — single-operator `TimelineProvider` with localStorage v1 hydrate/save
5. `src/features/timeline/` — `OperatorInput`, `LoadingStepper`, `PreGenesisCard`, `EventCard`, `TimelineRail`, `BlockMarker`, `CurrentStateCard`
6. `src/pages/TimelinePage.tsx` — full implementation replacing placeholder
7. Unit tests for `groupEvents` (same-type+block+tx → single group) and minimal `fetchAllPaginated` (1 page stops; 2 pages concatenates)
8. `npm run build`, `npm test`, `npm run dev` all green
9. Commit `feat(milestone-2): operator timeline page`, tag `v0.2.0`, progress.md updated

## Implementation steps

Complexity: S = trivial, M = one thing can go wrong, L = multiple things.

### Phase A — Types + pagination helper

1. **[M]** `src/types/timeline.ts`:
   - `TimelineEventType` string union (9 values)
   - `TimelineEvent` discriminated union by `type`, each with `block: number`, `tx: string`, `data: {…}`
   - `EventGroup` = `{ type, block, tx, items: data[] }`
   - `TimelineData` = `{ operator, events, preGenesis, onChain }` (all from the loaded state)
   - `TimelineState` = `idle | loading | ready | not-found | error` discriminated union
   - `LoadStage` = `'events' | 'pre-genesis' | 'on-chain'`
2. **[M]** `src/services/timelineClient.ts`:
   - `fetchAllPaginated<T>(entity, where, fields): Promise<T[]>` — loop on `first: 1000, skip`, break when batch < 1000, throw on subgraph errors (matches `subgraphClient.ts` semantics)
   - Uses `SUBGRAPH_URL` from `config.ts`
3. **[M]** `src/services/__tests__/timelineClient.test.ts` — mock `fetch`, assert single-page and multi-page behavior.

### Phase B — Orchestrator + event grouping

4. **[M]** `src/services/groupEvents.ts` — pure function:
   - Input: `TimelineEvent[]`
   - Output: `EventGroup[]`
   - Sort by `block` asc (tiebreak: type string compare to match reference)
   - Walk the sorted list; if `prev.type === curr.type && prev.block === curr.block && prev.tx === curr.tx` → push into `items`; else start a new group
5. **[S]** `src/services/__tests__/groupEvents.test.ts`:
   - empty → empty
   - single event → single group with `items.length === 1`
   - 3 val-addeds same block+tx → one group `items.length === 3`
   - 3 val-addeds different tx (same block) → 3 groups
   - different types same block+tx → different groups
   - mixed sorted correctly by block
6. **[L]** `src/services/timeline.ts` — `loadTimeline(operatorId, { onStage, signal })`:
   - Stage 1 (`events`): fetch the `operator` entity + 9 event queries in parallel. If `operator` is `null`, throw `OperatorNotFoundError`.
   - Stage 2 (`pre-genesis`): fetch `validatorAddeds` and `validatorRemoveds` with `blockNumber_lt: STAKING_GENESIS_BLOCK`, in parallel.
   - Stage 3 (`on-chain`): call `getOperatorFee`, `getOperatorFeeSSV`, `getOperatorById`, `getOperatorByIdSSV` in parallel, tolerating individual failures.
   - After each stage, call `onStage(stage)` to notify. Check `signal?.aborted` between stages.
   - Returns `TimelineData`.

### Phase C — Store

7. **[M]** `src/store/timelineContext.tsx`:
   - Reducer over `TimelineState`
   - `load(operatorId)` action — dispatches START then runs `loadTimeline`, updating `stage` between awaits, then READY / NOT_FOUND / ERROR
   - `refresh()` — re-runs `load(state.operatorId)` only if state is `ready` or `error` with a known operatorId
   - Hydrate from localStorage on mount (version check); save on READY
8. **[S]** Mount `<TimelineProvider>` above `<Routes>` in `App.tsx` (next to `ComparisonProvider`).

### Phase D — UI

9. **[M]** `src/features/timeline/OperatorInput.tsx` — `<Input type="number">` + `Button` "Load". Enter key also triggers load. Disabled while loading.
10. **[M]** `src/features/timeline/LoadingStepper.tsx` — 3 rows with dot (✓ / ◐ / ○) + label. Indeterminate progress bar below. Takes `currentStage: LoadStage` prop.
11. **[M]** `src/features/timeline/PreGenesisCard.tsx` — 5 label/value tiles: Registration Block, Registration Fee (SSV), Pre-Genesis ValAdded count, Pre-Genesis ValRemoved count, Net Validators at Genesis.
12. **[L]** `src/features/timeline/EventCard.tsx`:
   - Left-accent-border color by event type
   - Header: uppercase type + count badge (if >1) + "Block N · 0xtx…" with etherscan link
   - Body: per-event-type rendering of details (same field lists as reference HTML `renderEventGroup`)
13. **[M]** `src/features/timeline/BlockMarker.tsx` — dashed inline chip spanning the timeline rail ("SSV Staking Genesis — Block 2219331"). 4 variants: genesis, fix, last-fix, default-fee-change.
14. **[L]** `src/features/timeline/TimelineRail.tsx`:
   - Wraps a vertical `border-l` bar
   - Maps `EventGroup[]` to cards, inserting `BlockMarker` components when crossing each of the 4 thresholds
   - Markers always render even if no event crosses them (stacked at the end, matching reference)
   - Empty state if `events.length === 0`: "No events since staking genesis"
15. **[M]** `src/features/timeline/CurrentStateCard.tsx` — 4 sub-sections (SSV, ETH, Validators, General) mirroring the reference `renderCurrentState`. Graceful on partial on-chain data (show `—` or `err`).
16. **[L]** `src/pages/TimelinePage.tsx` — Option-A-style full-layout shell:
    - Header (title + subtitle + Refresh button, enabled when state.status === 'ready')
    - OperatorInput always visible
    - Content swap below:
      - `idle` → centered empty state card "Enter an operator ID"
      - `loading` → `LoadingStepper`
      - `not-found` → inline Card "Operator N not found" + Retry?
      - `error` → inline Card with message + Retry
      - `ready` → `PreGenesisCard` + `TimelineRail` + `CurrentStateCard`

### Phase E — Verify

17. **[S]** `npm test` — all green (M1 tests + new M2 tests)
18. **[S]** `npm run build` — passes
19. **[M]** `npm run dev` — manual smoke:
    - `/timeline` renders idle state
    - Enter `47`, click Load → stepper cycles through 3 stages
    - Ready: 3 sections visible, events chronological, block markers inserted at correct positions, etherscan links open in new tab
    - Enter non-existent ID (e.g. `999999`) → "not found" message
    - Navigate to `/` → back to `/timeline` → last-loaded operator still rendered, no re-fetch
    - Hard browser refresh → restored from localStorage
    - Refresh button → clears localStorage key + re-runs
20. **[S]** Compare visible event count for a test operator with the reference HTML (open `C:/Users/ariel/repositories/sub-diff/operator-timeline.html` in a browser, load same ID, event counts should match)

### Phase F — Commit

21. **[S]** Verify `git config --local user.email` returns `ariel@ssvlabs.io`. STOP if not.
22. **[S]** Strip debug `console.log` from UI code.
23. **[S]** `git add -A && git commit -m "feat(milestone-2): operator timeline page"`.
24. **[S]** `git tag -a v0.2.0 -m "Milestone 2: Operator Timeline"`.
25. **[S]** Update `progress.md`.

## Files created

- `src/types/timeline.ts`
- `src/services/timelineClient.ts`
- `src/services/groupEvents.ts`
- `src/services/timeline.ts`
- `src/services/__tests__/timelineClient.test.ts`
- `src/services/__tests__/groupEvents.test.ts`
- `src/store/timelineContext.tsx`
- `src/features/timeline/OperatorInput.tsx`
- `src/features/timeline/LoadingStepper.tsx`
- `src/features/timeline/PreGenesisCard.tsx`
- `src/features/timeline/EventCard.tsx`
- `src/features/timeline/BlockMarker.tsx`
- `src/features/timeline/TimelineRail.tsx`
- `src/features/timeline/CurrentStateCard.tsx`

## Files modified

- `src/pages/TimelinePage.tsx` — full implementation
- `src/App.tsx` — wrap in `<TimelineProvider>` alongside `ComparisonProvider`
- `progress.md`

## Testing criteria

- [ ] `npm test` passes; `groupEvents` has ≥5 test cases; `fetchAllPaginated` has 1-page + 2-page tests
- [ ] `npm run build` passes
- [ ] `npm run dev`: all flows in step 19 work against real Hoodi
- [ ] Event counts visible in the Timeline match what the reference HTML shows for the same operator
- [ ] Block markers appear at correct positions (before first event whose block exceeds the threshold)
- [ ] Etherscan links point to `https://hoodi.etherscan.io/tx/<hash>` and open in new tab
- [ ] Navigation `/timeline` → `/` → `/timeline` does NOT re-fetch
- [ ] Hard refresh restores from localStorage
- [ ] Refresh button clears + re-runs for the same operator
- [ ] No `console.log` in UI files

## Out of scope (defer)

- Vercel `vercel.json` SPA rewrite — M3 or dedicated deploy milestone
- Cancel-in-flight button — `AbortSignal` plumbed in `loadTimeline`, no UI
- Multi-operator history/cache (rejected this milestone — single slab)
- Mainnet support — toggle is disabled, nothing else network-aware yet
- Deep-linking `/timeline?operatorId=47` — nice-to-have, skip

## Risks / gotchas

- **`operator(id: "47")` returns `null` for unknown IDs** — don't let this throw; treat explicitly as `not-found`.
- **All 4 on-chain calls can revert independently** — each is wrapped in try/catch returning `err`. Partial on-chain data must render (mirror reference behavior).
- **`operatorIds_contains: ["47"]`** — the subgraph requires the array value as a **string**, and operator IDs are always stringified. Escape carefully in query construction.
- **Block marker placement** — markers must render before the first event whose block is > threshold (not ≥, per reference). If no event crosses, the marker renders at the end of the timeline (reference behavior preserved).
- **Same-block+same-tx aggregation** — easy to miss when porting. `groupEvents` tests exercise this explicitly.
- **localStorage quota** — per-operator with many events could grow. Cap event count in persisted form? For now: no cap, reassess if it becomes an issue. One operator's data should be <50 KB even with hundreds of events.
- **StrictMode double-invocation in dev** — provider effects must be idempotent (hydrate is read-only; save is dedup-safe because same state → same payload).
