---
name: new-project
description: >
  Use when starting a brand new project. Takes a rough project spec and
  produces a fully configured CLAUDE.md, wires up relevant claude-refs,
  and sets up the base project structure.
---

# New Project Setup

## Step 1: Read Available References

Before doing anything else:
1. Read `CLAUDE.md` — this is the template, not yet filled in
2. Read `C:\Users\ariel\claude-refs\README.md` — understand what refs and repos are available
3. Read `C:\Users\ariel\claude-refs\patterns\coding-standards.md`
4. If `research.md` exists in the project root, read it now

## Step 2: Understand the Project Spec

Ask the user for the project spec if not already provided. You need:
- What the project does and who it's for
- Which SSV/blockchain components are involved (contracts, subgraph, oracle, etc.)
- Target network (mainnet, Hoodi, or both)

If the tech stack is not specified, ask these questions one at a time:

1. **Backend:** Does this project need a backend, or is frontend-only sufficient?
2. **Data:** Do you need to store or query data persistently?
3. **Realtime:** Do you need realtime updates or WebSockets?
4. **Performance:** Are there any performance-critical requirements?
5. **Process:** Does anything need to run continuously (polling, long-running jobs)?

Then recommend a stack based on the answers:

| Situation | Recommended Stack |
|---|---|
| Frontend only, no data | React + Vite + TypeScript + Tailwind + Shadcn |
| Frontend + auth/database/realtime, no custom logic | React + Vite + TypeScript + Tailwind + Shadcn + Supabase |
| Frontend + complex business logic + database | React + Vite + TypeScript + Tailwind + Shadcn + Python FastAPI + Supabase (as DB) |
| Frontend + simple API proxies only | React + Vite + TypeScript + Tailwind + Shadcn + Vercel serverless |
| Needs persistent process (polling, long jobs, custom WebSockets) | Flag it — Vercel + Supabase cannot solve this. Recommend Railway, Render, or VPS for the backend. |
| Performance critical | Flag it and ask the user what language they prefer |

Present the recommendation and confirm with the user before proceeding.

## Step 3: Fill in CLAUDE.md

Using the template in the current CLAUDE.md, fill in:
- Project name and one-liner
- Tech Stack — based on confirmed stack, remove sections that don't apply
- Project Structure — trim to match the actual stack
- Commands — remove frontend or backend sections if not applicable
- Environment Configuration — list only the env vars this project will need
- Architecture — describe the system based on the spec
- Code Style — keep the global reference, add any project-specific overrides
- Global References — wire up only the refs relevant to this project:
  - Always include `patterns/coding-standards.md`
  - Include `tech/supabase.md` if using Supabase for database, realtime, or storage
  - Include `tech/supabase-auth.md` if using Supabase auth
  - If querying the subgraph, include all of:
    - `tech/subgraph.md` — endpoints, query patterns, packing rules
    - `tech/ssv-protocol.md` — cluster types, formulas, constants
    - `repos/subgraph-mainnet/schema.graphql` for mainnet, or `repos/subgraph-hoodi/schema.graphql` for Hoodi
  - If debugging or editing subgraph handlers/mappings, use the full clone instead:
    - `repos/subgraph-mainnet-full/` for mainnet, or `repos/subgraph-hoodi-full/` for Hoodi
    - Key folder inside: `src/` (event handlers and mappings)
  - Include `tech/ssv-contracts.md` if interacting with SSV contracts (liquidations, balances, operator data)
  - Include `tech/ssv-oracles.md` if working with oracle/EB snapshots
  - Include `tech/mev-builders.md` if submitting transactions on mainnet via MEV builders
  - Include `repos/ssv-network-contracts/` if writing or testing contract source code
  - Include `tech/ssv-liquidation-logic.md` if building an SSV cluster liquidation bot
- Git Workflow — ask the user:
    1. Is this a personal or work project?
       - Personal → use `git@github-personal:arielzzz/REPONAME.git`
       - Work → use `git@github-work:ssvlabs/REPONAME.git` or `git@github-work:arielssv/REPONAME.git`
    2. Has the GitHub repo been created yet?
       - Yes → fill in the full SSH remote URL
       - No → leave as placeholder and remind user to create the repo on GitHub first, then run `git remote add origin <url>`
	1. 3. **As the FIRST step of milestone 0**, run:
         git init -b main
         git config user.name "<from above>"
         git config user.email "<from above>"
         git remote add origin <SSH URL>
         This MUST happen before any other scaffolding tool runs.
- Milestone 0 — reference is already there, no changes needed

Present the filled-in CLAUDE.md to the user for confirmation before writing it.

## Step 4: Write Files

Once the user confirms:
1. Overwrite `CLAUDE.md` with the filled-in version
2. Verify `planning/milestone-0.md` exists — if not, create it from the template
3. Verify `.claude/skills/milestone-workflow/SKILL.md` exists

## Step 5: Confirm

Tell the user:
- What was written
- Which claude-refs were wired up and why
- Any placeholders still needing manual input (repo URL, API keys, etc.)
- That the project is ready to start Milestone 0