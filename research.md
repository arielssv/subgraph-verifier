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
