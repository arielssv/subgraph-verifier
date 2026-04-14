# Project Progress

## Status
Milestone 1 complete (`v0.1.0` on `main`). Next up: Milestone 2 — Operator Timeline page.

## What's Been Built

### Milestone 0 (tag `v0.0.0`)
- Vite 7 + React 19 + TS scaffold at repo root; Tailwind v4; Shadcn (nova preset); react-router v7; ethers 6.
- Path alias `@/*` in `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`.
- Two placeholder routes, local git identity set to work.

### Milestone 1 (tag `v0.1.0`)
- **Compare page** end-to-end against Hoodi: paginated subgraph fetch + batched on-chain reads + per-operator row builder.
- **5 metrics**: ETH Fee, SSV Fee, Privacy, Status, Validator Count. Each row stores subgraph vs on-chain values with a match flag. RPC errors mark the metric as error+mismatch.
- **Cross-page Context** (`ComparisonProvider` in `App.tsx`): one sweep per explicit Run/Refresh; navigation never re-fetches.
- **localStorage** persistence under key `subgraph-verifier:comparison:v2` (bumped from v1 — old v1 ignored on hydrate).
- **Dashboard UI** (Option A layout): stats cards + filter panel + "Comparing [metric]" section + content area — same outer width for empty/loading/error/ready states, no layout jumps.
- **Stats cards**: Total Operators · Match (green) · Mismatch (red).
- **Filter panel** (horizontal): operator ID input · Show toggle (All/Matching/Mismatch, default Mismatch) · Metric chips with live count based on Show.
- **Results table**: dynamic columns per metric (2 for Fees, 3 for Privacy/Status/Validator Count) + Match column. Sortable by operator ID.
- **Network toggle** in nav: Testnet (selected) / Mainnet (disabled — placeholder for future milestone).
- **Unit tests** (Vitest): 12 cases covering `buildOperatorRow` — matching baseline, each metric's mismatch cases, RPC errors on each side and both sides.

## Current File Structure
```
├── src/
│   ├── App.tsx                         # router + nav + NetworkToggle + ComparisonProvider
│   ├── components/ui/                  # shadcn: button, card, table, input, select, progress,
│   │                                   # skeleton, badge, toggle, toggle-group
│   ├── config.ts                       # Hoodi endpoints + constants
│   ├── features/comparison/
│   │   ├── FilterPanel.tsx             # Show toggle + Metric chips + ID input
│   │   ├── NetworkToggle.tsx           # Testnet/Mainnet nav toggle
│   │   ├── ResultsTable.tsx            # Dynamic columns per metric + Match
│   │   └── StatsCards.tsx              # Total/Match/Mismatch cards + emptyStats()
│   ├── lib/utils.ts                    # shadcn cn()
│   ├── pages/
│   │   ├── ComparisonPage.tsx          # Orchestrates dashboard states
│   │   └── TimelinePage.tsx            # Placeholder (M2)
│   ├── services/
│   │   ├── __tests__/compareOperator.test.ts
│   │   ├── compareOperator.ts          # buildOperatorRow
│   │   ├── comparison.ts               # runComparison orchestrator + batched sweep + stats
│   │   ├── onChainClient.ts            # Views contract singleton + fetchOnChainOperator
│   │   └── subgraphClient.ts           # fetchAllOperators paginated
│   ├── store/
│   │   └── comparisonContext.tsx       # ComparisonProvider + useComparison hook + localStorage v2
│   ├── types/
│   │   └── comparison.ts               # OperatorRow, MetricPair/Triple, ComparisonStats, METRIC_LIST
│   └── utils/
│       └── formatTime.ts               # formatRelativeTime, formatElapsed
```

## Key Decisions Made
- **React Context over Zustand** — one page owns state in M1; selectors not worth the dep.
- **localStorage keyed by schema version** (`...:v2`). Model change bumps the key; old payloads are ignored.
- **Single metric view with dynamic columns** (not multi-metric rows). User explicitly preferred the simpler per-metric slice over a wide matrix.
- **3 stats cards, not 4.** Dropped "Metric checks passed" — read as noise, not signal.
- **Match column is text-only** (green ✓ / red ✗). Cell backgrounds removed as loud.
- **ToggleGroups use primary color for active state** via `data-[state=on]:bg-primary` override — matches nav link styling. Without it shadcn's default is muted/low-contrast.
- **Network toggle disabled for Mainnet** — reserved for a future milestone (nothing else in config supports mainnet yet).
- **Subgraph authenticated-endpoint fallback: deferred.** Public endpoint works for Hoodi; wire only if 429s land.
- **Full-layout skeleton for idle/loading states** (Option A). Empty state is a bordered CTA panel inside the same shell; loading shows progress + skeleton rows in the table slot.

## Known Issues / Deferred Work
- **Bundle size warning (~550 KB)** — ethers is the big chunk. Not a problem on a dev tool; revisit if deploy latency is noticed.
- **Operator-detail Dialog** (side panel showing full SG + chain record for a clicked operator) — spec lists as nice-to-have, deferred.
- **Cancel-in-flight button** — `AbortSignal` plumbing is already in `runComparison` and the store; no UI yet.
- **Mainnet toggle** — disabled; flipping it on later requires config-per-network and a second Views contract address.
- **Subgraph 429 fallback** — not wired; pure-public for now.
- **Claude-refs `subgraph-hoodi/schema.graphql`** has a local modification blocking `git pull origin ssv-staking`. Not owned by this project; flag to user if a schema update is needed.

## Environment & Config Notes
- **Node:** v24.14.1 (LTS). Installed via `winget install OpenJS.NodeJS.LTS` during M0.
- **Dev server port:** 5173 (picks next free port if held).
- **Public Hoodi RPC:** `ethereum-hoodi-rpc.publicnode.com` — rate-limited; `BATCH_SIZE = 20` in `comparison.ts` is the tuning knob.
- **Git identity:** local override `arielssv <ariel@ssvlabs.io>`. Global remains personal — by design.
- **Scripts:** `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm test`, `npm run test:watch`.
