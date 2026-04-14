# Project Progress

## Status
Pre-Milestone-0. Project initialized with CLAUDE.md and planning structure; no code scaffolded yet.

## What's Been Built
- Nothing yet — scaffold in progress.

## Current File Structure
```
├── CLAUDE.md
├── how-to-start-a-project.md
├── kickstart-prompt.txt
├── planning/
│   └── milestone-0.md
└── research/
```

## Key Decisions Made
- Static frontend-only (Vite + React + TS + Tailwind + Shadcn + react-router + ethers v6) — no backend, no serverless.
- `src/` lives at repo root (no `frontend/` subfolder) because there's no backend to separate from.
- Diff logic to be ported verbatim from `C:/Users/ariel/repositories/sub-diff/compare-operators.mjs`.
- Hoodi testnet only; public endpoints in `src/config.ts`, not secrets.

## Known Issues / Deferred Work
- Vercel deploy config deferred until local works end-to-end.
- GitHub remote (`git@github-work:arielssv/subgraph-verifier.git`) still needs to be wired during Milestone 0.

## Environment & Config Notes
- Dev server port: 5173.
- Public Hoodi RPC (`ethereum-hoodi-rpc.publicnode.com`) may rate-limit; batch loop (`BATCH_SIZE = 20`) lives in services, not components.
