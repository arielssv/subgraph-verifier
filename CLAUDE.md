# Subgraph Verifier

Browser-only diagnostic webapp for SSV operators on Hoodi testnet — diffs subgraph data against on-chain contract reads, and renders historical event timelines per operator. For SSV engineers debugging subgraph drift.

## Tech Stack

- **Frontend:** React + Vite, TypeScript, Tailwind CSS, Shadcn UI
- **Routing:** react-router
- **Blockchain:** ethers v6 (npm, not CDN)
- **State:** React Context (or Zustand if it grows) — cross-page cache so navigation doesn't re-fetch
- **Persistence:** `localStorage` for last comparison result
- **Package manager:** npm
- **Deploy target:** Vercel (static output) — wire-up deferred

No backend, no API routes, no serverless functions. All queries (subgraph + RPC) run in the browser.

## Project Structure

```
├── src/
│   ├── pages/              # ComparisonPage, TimelinePage
│   ├── features/           # Feature modules (comparison/, timeline/)
│   ├── components/
│   │   └── ui/             # Shadcn generated components (do not edit manually)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Subgraph + RPC clients, diff logic, pagination helper
│   ├── store/              # Cross-page cache (Context/Zustand)
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types (operator, events, diff rows)
│   └── config.ts           # RPC_URL, SUBGRAPH_URL, VIEWS_ADDRESS, VIEWS_ABI, block markers
├── public/
├── planning/               # Per-milestone planning docs
├── research/               # Living project research
├── CLAUDE.md
└── progress.md             # Auto-maintained
```

No `frontend/` subfolder — the project is frontend-only, so `src/` lives at the root.

## Commands

```bash
npm install                 # Install deps
npm run dev                 # Dev server (port 5173)
npm run build               # Production static build → dist/
npm run preview             # Preview built bundle locally
npm run lint                # Lint check

# Add Shadcn components via CLI (never copy-paste manually)
npx shadcn@latest add [component]
```

## Environment Configuration

- All env vars go in `.env` files (NEVER commit these)
- Frontend env vars must be prefixed with `VITE_`
- The reference values (RPC URL, subgraph URL, Views address, ABI, block markers) live in `src/config.ts` as constants — these are public Hoodi endpoints and not secrets
- If a private RPC is later added, move only the URL to `.env` as `VITE_RPC_URL`

## Architecture

- **Data flow:** User clicks "Run" → page calls service → service runs batched RPC reads + paginated subgraph queries → results stored in cross-page cache → page renders. Navigation reads from cache; only "Refresh" clears the cache and re-runs.
- **Cross-page state:** Top-level store holds `{status, data, progress, lastFetchedAt}` per page. Comparison result is also persisted to `localStorage` so a hard refresh doesn't trigger a multi-minute sweep.
- **Browser/RPC constraints:**
  - `BATCH_SIZE = 20` (drop to 10 on 429s); 100–200 ms delay between batches if needed
  - Never `Promise.all` across all operators — always batched loop
  - Both subgraph and `publicnode.com` RPC are CORS-open
- **Diff invariants (do not change):** port `compareOperator`, `fetchAllOperators`, `fetchOnChainOperator` from `C:/Users/ariel/repositories/sub-diff/compare-operators.mjs` verbatim, typed. Lowercase addresses before compare. `removed` (subgraph) is opposite of `isActive` (chain).
- **Key constraint:** No business logic in components — all fetching, batching, and diffing lives in `services/`.

## Code Style

See global standard: `C:\Users\ariel\claude-refs\patterns\coding-standards.md`

Project-specific overrides:
- `console.log` is acceptable inside `services/` for progress reporting during long batched runs (the spec calls for visible progress in the UI; CLI-style logs help during dev). Strip them before commits if they're noisy.

## Global References

- **Path:** `C:\Users\ariel\claude-refs\`
- **Read-only** — never modify, commit to, or push anything inside this folder
- **Relevant files for this project:**
  - `patterns/coding-standards.md` — universal coding standards
  - `tech/subgraph.md` — endpoints, query patterns, pagination, packing rules
  - `tech/ssv-protocol.md` — cluster types, formulas, constants
  - `repos/subgraph-hoodi/schema.graphql` — Hoodi schema (run `git pull origin ssv-staking` in that repo before reading)
  - `tech/ssv-contracts.md` — Views contract address, ABI, RPC endpoints (the project uses the SSVViews contract for `getOperatorById`, `getOperatorByIdSSV`, `getOperatorFee`, `getOperatorFeeSSV`)

## Reference Implementations (port verbatim)

These live outside this repo but are required reading before writing any new code:

- `C:/Users/ariel/repositories/sub-diff/compare-operators.mjs` — canonical diff logic
- `C:/Users/ariel/repositories/sub-diff/operator-timeline.html` — working timeline (queries, colors, layout, `fetchAllPaginated`)
- `C:/Users/ariel/repositories/sub-diff/package.json` — only runtime dep is `ethers ^6.16.0`

## Git Workflow

- **Commit messages:** `type(scope): description` (e.g. `feat(comparison): add diff table`)
  - Types: feat, fix, refactor, test, docs, chore
- **Commits:** One commit per logical change — don't bundle unrelated changes
- **Tags:** Create a git tag after completing each milestone: `v0.N.0`
- **Branch naming:** `feature/description`, `fix/description` (prefix `milestone-N/` for milestone-based work)
- **Repo:** `git@github-work:arielssv/subgraph-verifier.git` (https://github.com/arielssv/subgraph-verifier)
- Do NOT push until user explicitly confirms

## Skills

- New project setup: `.claude/skills/new-project/SKILL.md`
- Milestone workflow: `.claude/skills/milestone-workflow/SKILL.md`

## Milestone 0

Pre-defined at `planning/milestone-0.md` — adjusted for frontend-only structure at repo root.

## Common Mistakes — Never Do This

- Don't install new packages without checking if an existing dep already covers it
- Don't introduce any server-side code (API routes, serverless functions, Node-only APIs) — this project is static-only
- Don't `Promise.all` across all operators — use the batched loop with `BATCH_SIZE`
- Don't change the diff semantics in `compareOperator` — port verbatim
- Don't make subgraph or RPC calls directly from components — all fetching goes through `services/`
- Don't edit Shadcn components in `components/ui/` directly — add variants or wrap them
- Don't modify `.env` files or commit secrets
- Don't make changes outside the current milestone's scope
- Don't start coding before research + planning are confirmed
- Don't leave debug `console.log` in committed component/UI code (services exception noted above)
- Don't re-fetch on route change — only the explicit "Refresh" button triggers a re-fetch
