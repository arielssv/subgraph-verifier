# Research

Living research doc. New milestones append sections below; older sections are preserved.

---

## Milestone 0: Project Scaffold

### Goal

Stand up a frontend-only Vite + React + TypeScript project with Tailwind, Shadcn, react-router, and ethers v6 — verifiable with `npm run dev` and `npm run build`.

### Stack confirmation

The spec (`c:\Users\ariel\md-files\new-webapp-handoff.md`) already pins the stack. No alternatives considered — the constraint is *static-only, Vercel-deployable*, and this stack is the smallest thing that satisfies it.

- **Vite + React + TypeScript** — standard SPA scaffold, produces static output
- **Tailwind CSS v4** — current major version; setup differs meaningfully from v3 (see below)
- **Shadcn/ui** — component library consumed via CLI (`npx shadcn@latest add`)
- **react-router** — two-route SPA
- **ethers v6** (`^6.16.0`) — matches `C:/Users/ariel/repositories/sub-diff/package.json`; the reference diff logic targets v6 API

### Current setup procedure (verified 2026-04-14 against shadcn docs)

Tailwind v4 is a breaking change from v3 — no PostCSS config, no `tailwind.config.js` by default, single-line CSS import. The shadcn docs assume v4 throughout.

**Order of operations (npm, not pnpm):**

1. `npm create vite@latest . -- --template react-ts` — scaffold in the current (non-empty) directory; Vite will prompt to ignore existing files.
2. `npm install`
3. `npm install tailwindcss @tailwindcss/vite` — Tailwind v4 + official Vite plugin.
4. Replace `src/index.css` contents with a single line: `@import "tailwindcss";`
5. `npm install -D @types/node` — needed so `vite.config.ts` can `import path`.
6. Edit `vite.config.ts`: add `tailwindcss()` plugin and `resolve.alias["@"] = path.resolve(__dirname, "./src")`.
7. Edit both `tsconfig.json` AND `tsconfig.app.json`: add `baseUrl: "."` and `paths: { "@/*": ["./src/*"] }`. Both files are required — shadcn docs are explicit about this.
8. `npx shadcn@latest init` — interactive; creates `components.json`. Accept defaults (style = new-york, base color = neutral or slate).
9. `npx shadcn@latest add button card` — install the first two components to sanity-check.
10. `npm install react-router ethers@^6.16.0`

**Gotchas:**
- The `@types/node` install step is easy to miss — `path` from Node stdlib is used in `vite.config.ts`. Without it, TypeScript complains.
- `tsconfig.app.json` *and* `tsconfig.json` both need the path alias — shadcn's code generator and Vite look at different configs.
- `react-router` v7+ replaces `react-router-dom` as a single package — the spec says `react-router`, use that name.
- Tailwind v4 does NOT need `tailwind.config.js` for basic usage — shadcn generates one only if its init detects v3 workflow. We're on v4, so no config file is expected.

### Folder structure decisions

Per CLAUDE.md, `src/` lives at repo root (no `frontend/` subfolder). Milestone 0 creates:

```
src/
├── pages/              # ComparisonPage.tsx, TimelinePage.tsx (placeholders)
├── features/           # empty, populated in later milestones
├── components/
│   └── ui/             # shadcn-generated (button, card initially)
├── hooks/              # empty
├── services/           # empty
├── store/              # empty
├── utils/              # empty
├── types/              # empty
├── config.ts           # RPC_URL, SUBGRAPH_URL, VIEWS_ADDRESS, VIEWS_ABI, block markers
├── App.tsx             # router setup
├── main.tsx            # Vite entry
└── index.css           # @import "tailwindcss"
```

### `src/config.ts` contents (copied verbatim from spec)

```ts
export const RPC_URL = "https://ethereum-hoodi-rpc.publicnode.com";
export const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/71118/ssv-network-hoodi/version/latest";
export const VIEWS_ADDRESS = "0x5AdDb3f1529C5ec70D77400499eE4bbF328368fe";

export const VIEWS_ABI = [
  "function getOperatorById(uint64 operatorId) external view returns (tuple(address owner, uint256 fee, uint32 validatorCount, address whitelistedAddress, bool isPrivate, bool isActive))",
  "function getOperatorByIdSSV(uint64 operatorId) external view returns (tuple(address owner, uint256 fee, uint32 validatorCount, address whitelistedAddress, bool isPrivate, bool isActive))",
  "function getOperatorFee(uint64 operatorId) external view returns (uint256)",
  "function getOperatorFeeSSV(uint64 operatorId) external view returns (uint256)",
];

export const STAKING_GENESIS_BLOCK = 2219331;
export const FIX_BLOCK = 2259628;
export const LAST_FIX_BLOCK = 2434756;
export const DEFAULT_OPERATOR_FEE_CHANGE_BLOCK = 2569939;
```

### Router shape for Milestone 0

Two routes, both rendering placeholder content:

- `/` → `ComparisonPage` — placeholder: "Comparison (coming in milestone 1)" + a Shadcn button labeled "Run comparison" (disabled, wired later)
- `/timeline` → `TimelinePage` — placeholder: "Operator timeline" + a text input

A simple top nav with two links is enough. Real layout comes in later milestones.

### Dependencies & risks

- **Low risk:** the full scaffold stack is well-trodden; Vercel static deploy is the default Vite output shape.
- **Moderate:** Tailwind v4 is recent enough that some third-party Shadcn tutorials still assume v3. Stick with the official shadcn docs (fetched 2026-04-14) as the source of truth. If `shadcn init` behaves differently from what the docs describe, stop and re-verify — don't guess.
- **Deferred:** Vercel config (spec says we'll confirm local first). For react-router on Vercel, a SPA-rewrite rule (`vercel.json`) is required later so deep links don't 404; not in scope for Milestone 0.

### External references

- Shadcn Vite install: https://ui.shadcn.com/docs/installation/vite (fetched 2026-04-14)
- Tailwind v4 announcement: https://tailwindcss.com/blog/tailwindcss-v4 (version expected by current shadcn docs)
- Reference implementations: `C:/Users/ariel/repositories/sub-diff/`

---

## Milestone 1: Comparison Page

### Goal

Wire the Comparison page end-to-end: paginated subgraph fetch + batched on-chain reads + diff computation, with progress UI, sortable/filterable results table, localStorage persistence, and cross-page state so navigation never costs a re-fetch.

### What the spec already pins

- Diff invariants — port `compareOperator`, `fetchAllOperators`, `fetchOnChainOperator` from `C:/Users/ariel/repositories/sub-diff/compare-operators.mjs` **verbatim**, typed.
- `BATCH_SIZE = 20` for on-chain reads. Drop to 10 on 429s; add 100–200 ms delay between batches if needed.
- No `Promise.all` across all operators — always batched loop.
- Empty state with explicit "Run comparison" button (no auto-fetch).
- Progress UI: shadcn `Progress` bar + `Checked X/Y operators` text.
- Results table: one row per diff (not per operator). Columns: Operator ID, Field, Subgraph value, On-chain value, Category badge.
- Filters: operator ID text input + multi-select category checkboxes. AND across groups, OR within a group. Default = all categories selected.
- Sortable by operator ID.
- Persist to `localStorage`. Show `lastFetchedAt` in header. Refresh button clears + re-runs.

### Schema confirmation (Hoodi)

The `Operator` entity in `claude-refs/repos/subgraph-hoodi/schema.graphql` has every field the reference implementation uses (`id`, `operatorId`, `owner`, `fee`, `feeSSV`, `feeIndex*`, `validatorCount`, `removed`, `isPrivate`, `whitelistedContract`, `whitelisted`). The query in `compare-operators.mjs:19-36` ports as-is.

### Open decisions

#### 1. Cross-page store: React Context

Spec offers Context, Zustand, or `useRef` cache. For a 2-page app with one large state slab per page and infrequent updates, plain Context is the smallest thing that works — no new dep, no selector complexity. Will reach for Zustand only if Context's "re-render all consumers" behavior actually causes a problem during a long sweep (it shouldn't: only the ComparisonPage subscribes during M1).

Shape:

```ts
type ComparisonState =
  | { status: 'idle' }
  | { status: 'loading'; checked: number; total: number; startedAt: number }
  | { status: 'ready'; diffs: DiffRow[]; totalOperators: number; lastFetchedAt: number }
  | { status: 'error'; message: string; lastFetchedAt?: number }
```

Provider lives in `App.tsx` above `<Routes>` so route changes don't unmount it.

#### 2. localStorage shape + invalidation

Persist only the terminal `ready` state — not in-flight progress. Schema:

```ts
const STORAGE_KEY = 'subgraph-verifier:comparison:v1'
type Persisted = {
  version: 1
  diffs: DiffRow[]
  totalOperators: number
  lastFetchedAt: number  // unix ms
}
```

- Hydrate on store init; if `version` mismatch or JSON parse fails, ignore and fall back to `idle`.
- Save on every transition into `ready`.
- "Refresh" button → clear localStorage + transition store to `loading` + start a new sweep.
- No auto-invalidation by age. The whole point of caching is that the user controls when to spend a few minutes re-fetching.

#### 3. Subgraph + RPC clients

- **Subgraph:** plain `fetch()` POST. No Apollo / urql — overkill for one paginated query.
  - **Fallback to authenticated endpoint** (`tech/subgraph.md:9-35`): out of scope for M1 — public endpoint is the default per the spec, and we have no `THEGRAPH_API_KEY` configured. If 429s become a real problem during testing, add the fallback then. Documented as deferred.
- **RPC:** `ethers.JsonRpcProvider(RPC_URL)` instantiated once at module scope in the service. `Contract` instance also at module scope. Reuse across batches.

#### 4. Diff categorization

`compareOperator` returns objects with a `field` string like `"fee (ETH)"`. The spec calls for badge categories like `fee-eth`, `fee-ssv`, `owner-eth`, `owner-ssv`, `isPrivate-eth`, `isPrivate-ssv`, `active/removed-eth`, `active/removed-ssv`, `validatorCount`, `rpc-error`. Need a small mapper from field-string → category. Mapper lives next to the diff types in `src/types/comparison.ts` so it's colocated with the source of truth.

Color tokens: use Tailwind's named palette (`bg-red-500`, `bg-orange-500`, `bg-blue-500`, `bg-purple-500`, `bg-yellow-500`) wrapped via shadcn `Badge` variants. Avoid invented theme tokens — keep this M1 simple.

#### 5. Filter + sort: plain JS, no TanStack Table

Spec is small enough (one filter group + one sort axis) that array `filter()` + `sort()` inside a `useMemo` is the right call. Skip TanStack Table — it would dwarf the actual code. If filtering grows complex (column-level sorts, virtualization for very large diff sets), revisit.

#### 6. Shadcn components to install

Needed for M1 UI: `table`, `input`, `select`, `progress`, `skeleton`, `badge`. `dialog` is "nice-to-have" per the spec (operator-detail side panel) — defer unless time permits.

#### 7. Progress reporting from a long async function

The sweep service exposes:

```ts
runComparison(opts: {
  signal?: AbortSignal
  onProgress: (checked: number, total: number) => void
}): Promise<{ diffs: DiffRow[]; totalOperators: number }>
```

After each batch, call `onProgress(checked, total)`. React state updates between awaits — natural rendering yields, no need for explicit `setTimeout(0)`. `AbortSignal` lets a future "Cancel" button stop a sweep mid-flight (out of scope for M1; reserved hook).

#### 8. Testing

- **Vitest** is the standard for Vite. Add `vitest` (and `@types/node` is already in). No browser-DOM testing in M1 — only pure-function tests of `compareOperator` against handcrafted fixtures.
- Test file colocation: `src/services/__tests__/compareOperator.test.ts`.
- Add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json`.
- Coverage targets for M1: every `if (...)` branch in `compareOperator` (`compare-operators.mjs:88-155`) — ETH-only mismatch, SSV-only mismatch, both, validator count mismatch, RPC error on each side, no-diff case.

### Dependencies & risks

- **Subgraph operator count on Hoodi**: a few hundred operators expected based on reference implementation usage. At `BATCH_SIZE = 20` and ~200 ms per batch (network-bound), a full sweep is ~10–60 seconds. Will tune if real numbers come in higher.
- **Public RPC rate limit**: `publicnode.com` is the known weak link. If 429s land, drop `BATCH_SIZE` to 10 + add `await sleep(150)` between batches. Both knobs live in one place: `runComparison` in `src/services/comparison.ts`.
- **CORS**: spec confirms both subgraph and `publicnode.com` are CORS-open for browsers. No proxy needed.
- **localStorage size**: each diff row is small (~5 fields × short strings). 1k operators × 3 diffs/op average × ~200 bytes = ~600 KB worst case — well under the 5 MB limit.
- **Browser tab navigation away during sweep**: spec doesn't address. Current plan: sweep continues in the background since the store lives at the App level; if the user navigates back, they see updated progress. If the tab is closed, the sweep dies — that's fine.

### External references

- `C:/Users/ariel/repositories/sub-diff/compare-operators.mjs:88-155` — `compareOperator` (port verbatim)
- `C:/Users/ariel/repositories/sub-diff/compare-operators.mjs:15-53` — `fetchAllOperators`
- `C:/Users/ariel/repositories/sub-diff/compare-operators.mjs:56-85` — `fetchOnChainOperator`
- `C:/Users/ariel/repositories/sub-diff/compare-operators.mjs:166-189` — main batched loop
- `claude-refs/repos/subgraph-hoodi/schema.graphql:51-75` — `Operator` entity definition
- `claude-refs/tech/subgraph.md` — endpoint, pagination, type-handling rules
- `claude-refs/tech/ssv-contracts.md` — Hoodi Views address (already in `src/config.ts`)
