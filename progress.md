# Project Progress

## Status
Milestone 2 complete (`v0.2.0` on `main`). Next up: Vercel deploy, then optional polish milestones (Dialog side panel, mainnet support, Cancel button, auth'd subgraph fallback).

## What's Been Built

### Milestone 0 (tag `v0.0.0`)
- Vite 7 + React 19 + TS scaffold at repo root; Tailwind v4; Shadcn (nova preset); react-router v7; ethers 6.
- Path alias `@/*` in `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`.
- Local git identity set to work (`arielssv <ariel@ssvlabs.io>`).

### Milestone 1 (tag `v0.1.0`)
- **Compare page** end-to-end against Hoodi with `buildOperatorRow` + batched sweep.
- 5 metrics (ETH Fee, SSV Fee, Privacy, Status, Validator Count); dynamic-column table per metric.
- Cross-page Context + localStorage (`...:comparison:v2`); Option-A dashboard shell.
- Network toggle (Testnet/Mainnet, mainnet disabled).
- 12 Vitest cases on `buildOperatorRow`.

### Milestone 2 (tag `v0.2.0`)
- **Operator Timeline page** end-to-end on Hoodi:
  - `fetchAllPaginated(entity, where, fields)` generic helper + 9 event fetchers + 2 pre-genesis fetchers + 4 on-chain view calls, sequenced in 3 stages (`events` → `pre-genesis` → `on-chain`).
  - 3-stage stepper during load (checkmark / spinner / empty dot).
  - Pre-Genesis stat cards: Registered at block · Initial Fee · Validators Added · Validators Removed · Net Validators.
  - Timeline split into 4 **collapsable range sections** (genesis, fix, last-fix, default-fee-change). All collapsed by default.
  - `EventCard` with left-border accent + type-specific body renderers (registration, migration, val-added/removed, liquidation/reactivation, fee-change, withdrawal, removal); etherscan links to `hoodi.etherscan.io`.
  - `CurrentStateCard` reuses `OperatorMetricsTable` (shared component in `features/shared/`) — same 5-metric summary as Compare, single row per metric.
  - `TimelineProvider` with single-operator state + localStorage (`...:timeline:v1`); hydrate on mount, save on READY.
  - `not-found` state when subgraph `operator(id)` returns null.
- Unit tests:
  - `groupEvents` — 7 cases (empty / single / same+same+same collapse / different tx / different type / sort by block / tiebreak by type).
  - `fetchAllPaginated` — 4 cases (single page / two pages concatenated / errors payload / HTTP non-OK).
- Total tests: 23 (12 M1 + 11 M2).

## Current File Structure
```
├── src/
│   ├── App.tsx                                # routes + nav + NetworkToggle + providers
│   ├── components/ui/                         # shadcn: button, card, input, progress, select,
│   │                                          # skeleton, table, toggle, toggle-group, badge
│   ├── config.ts                              # Hoodi endpoints + 4 block markers
│   ├── features/
│   │   ├── comparison/                        # (M1) FilterPanel, ResultsTable, StatsCards, NetworkToggle
│   │   ├── shared/
│   │   │   └── OperatorMetricsTable.tsx       # shared across Compare + Timeline
│   │   └── timeline/                          # (M2) OperatorInput, LoadingStepper,
│   │                                          # PreGenesisCard, EventCard, eventColors,
│   │                                          # TimelineRail, CurrentStateCard
│   ├── lib/utils.ts                           # shadcn cn()
│   ├── pages/
│   │   ├── ComparisonPage.tsx
│   │   └── TimelinePage.tsx
│   ├── services/
│   │   ├── __tests__/
│   │   │   ├── compareOperator.test.ts        # 12 cases
│   │   │   ├── groupEvents.test.ts            # 7 cases
│   │   │   └── timelineClient.test.ts         # 4 cases
│   │   ├── compareOperator.ts                 # buildOperatorRow (pure)
│   │   ├── comparison.ts                      # Compare sweep orchestrator
│   │   ├── groupEvents.ts                     # pure, aggregates same type+block+tx
│   │   ├── onChainClient.ts                   # Views singleton + fetchOnChainOperator
│   │   ├── subgraphClient.ts                  # fetchAllOperators (M1)
│   │   ├── timeline.ts                        # Timeline orchestrator (stages)
│   │   └── timelineClient.ts                  # fetchAllPaginated + gql
│   ├── store/
│   │   ├── comparisonContext.tsx              # v2 localStorage, single slab
│   │   └── timelineContext.tsx                # v1 localStorage, single slab
│   ├── types/
│   │   ├── comparison.ts                      # OperatorRow, MetricPair/Triple, ComparisonStats
│   │   └── timeline.ts                        # TimelineEvent union, TimelineState, OperatorNotFoundError
│   └── utils/
│       └── formatTime.ts                      # formatRelativeTime, formatElapsed
```

## Key Decisions Made
- **Shared `OperatorMetricsTable`** — the Compare and Timeline pages both need "here's SG vs on-chain for one operator across 5 metrics". Extracted to `features/shared/` so the visual language is identical.
- **Single-operator cache on Timeline** (not a keyed map) — matches Compare's pattern and matches the user's usage ("check one operator at a time").
- **Timeline ranges collapsable, default collapsed** — keeps the Timeline page compact; user clicks to expand the relevant block range.
- **RPC errors on Timeline surface inline** (`err` in the Current State cells for affected sides) — same tolerance as Compare.
- **`groupEvents` as a pure function** — separate from `loadTimeline` so it's cheaply testable.
- **3-stage stepper, no numeric counter** — the 15 tasks run in 3 parallel bursts; stepper communicates *what's happening* more usefully than a 7/15 counter.
- **Pre-Genesis as 5 separate stat cards** — parallel to Compare's stats cards aesthetic; reads as a dashboard, not a form.
- **Vercel deploy deferred** to a post-M2 step (requires `vercel.json` SPA rewrite).

## Known Issues / Deferred Work
- **`vercel.json` not added yet** — needed before first Vercel deploy for react-router deep links to work. Add in a follow-up commit.
- **Bundle size ~572 KB** (ethers is the big chunk). Code-split if deploy latency becomes noticeable; otherwise leave.
- **Operator-detail Dialog** on Compare — spec listed as nice-to-have, still deferred.
- **Cancel-in-flight button** — `AbortSignal` plumbed in both stores, no UI.
- **Mainnet** — NetworkToggle has Mainnet disabled; config needs mainnet Views address + subgraph URL + logic branching before flipping it on.
- **Auth'd subgraph fallback** — still unused; add if 429s ever land.

## Environment & Config Notes
- **Node:** v24.14.1 (LTS) via `winget`.
- **Dev server port:** 5173 (next-free if held).
- **Hoodi public RPC:** `ethereum-hoodi-rpc.publicnode.com` — rate-limited; `BATCH_SIZE = 20` in `comparison.ts`.
- **Git identity (local):** `arielssv <ariel@ssvlabs.io>`. Global still personal — by design.
- **Scripts:** `npm run dev | build | preview | lint | test | test:watch`.
- **localStorage keys:** `subgraph-verifier:comparison:v2` + `subgraph-verifier:timeline:v1`.
