# Milestone 0: Project Setup

## Goal

Scaffold a frontend-only Vite + React + TS + Tailwind v4 + Shadcn + react-router + ethers v6 project at repo root, verify it runs locally (`npm run dev`) and builds cleanly (`npm run build`), with two placeholder routes wired up.

## Deliverables

1. Working Vite + React + TS app at repo root
2. Tailwind v4 applied (visible style on test element)
3. Shadcn initialized, `Button` + `Card` components installed and rendering
4. `react-router` wired with two routes: `/` (ComparisonPage) and `/timeline` (TimelinePage)
5. `src/config.ts` populated with all constants from the spec
6. Full folder structure per CLAUDE.md created (`pages`, `features`, `components/ui`, `hooks`, `services`, `store`, `utils`, `types`)
7. `.gitignore` covering `node_modules/`, `dist/`, `.env*` (except `.env.example` if we add one)
8. Git initialized, remote `git@github-work:arielssv/subgraph-verifier.git` configured
9. Initial commit + `v0.0.0` tag (not pushed)
10. `progress.md` updated to reflect milestone completion

## Implementation steps

Order matters. Complexity: S = trivial, M = one thing can go wrong, L = multiple things.

1. **[S]** Scaffold Vite. `npm create vite@latest . -- --template react-ts` in the project root. Vite will ask about ignoring existing files (`CLAUDE.md`, `planning/`, `research/`, `progress.md`, `research.md`, the `how-to-start-a-project.md` + `kickstart-prompt.txt`) — accept and let it write `package.json`, `src/`, etc. alongside them.
2. **[S]** `npm install`.
3. **[S]** Decide what to do with the two stray files at root (`how-to-start-a-project.md`, `kickstart-prompt.txt`). Proposal: leave them — they're project-setup scaffolding notes, not code, and they don't conflict with anything. Flag to user in summary.
4. **[M]** Install Tailwind v4: `npm install tailwindcss @tailwindcss/vite`. Replace `src/index.css` with single line `@import "tailwindcss";`. Delete `src/App.css` (Vite ships one, Tailwind replaces the role).
5. **[S]** `npm install -D @types/node`.
6. **[M]** Edit `vite.config.ts`:
   - Import `path` and `tailwindcss` from `@tailwindcss/vite`
   - Add `tailwindcss()` to `plugins`
   - Add `resolve.alias = { "@": path.resolve(__dirname, "./src") }`
7. **[M]** Edit `tsconfig.json` AND `tsconfig.app.json` — both need `baseUrl: "."` and `paths: { "@/*": ["./src/*"] }`.
8. **[M]** `npx shadcn@latest init` — interactive. Accept defaults: style=new-york, base color=neutral. This creates `components.json` and writes CSS variables to `src/index.css`.
9. **[S]** `npx shadcn@latest add button card` — sanity check.
10. **[S]** `npm install react-router ethers@^6.16.0`.
11. **[S]** Create folder structure: `mkdir -p src/{pages,features,hooks,services,store,utils,types}` (note: `components/ui` is created by shadcn already).
12. **[S]** Write `src/config.ts` — copy the constants block from spec (`RPC_URL`, `SUBGRAPH_URL`, `VIEWS_ADDRESS`, `VIEWS_ABI`, four block-marker constants). Keep empty-export-only `.gitkeep` files in the other empty folders? No — leave empty folders empty; git ignores them naturally, we'll get actual files in later milestones.
13. **[M]** Write `src/pages/ComparisonPage.tsx` — placeholder using a Shadcn `Card` + disabled `Button` labeled "Run comparison".
14. **[M]** Write `src/pages/TimelinePage.tsx` — placeholder with a `Card` + an `Input` (use native `<input>` for now to avoid adding another shadcn component; switch to shadcn `Input` in milestone 2).
15. **[M]** Rewrite `src/App.tsx` — `BrowserRouter`, two `<Route>`s, top nav with `<Link>`s to `/` and `/timeline`.
16. **[S]** Delete Vite's boilerplate `src/assets/react.svg` and any default content no longer referenced. Keep `public/vite.svg` for now (harmless).
17. **[M]** `npm run dev` — open http://localhost:5173, click both nav links, verify both placeholder pages render with Tailwind-styled content and the Shadcn button has proper shadcn styling.
18. **[S]** `npm run build` — verify `dist/` is produced and contains `index.html` + assets.
19. **[S]** Write `.gitignore`: `node_modules/`, `dist/`, `.env`, `.env.local`, `.env.*.local`, `.DS_Store`. (Vite's template usually supplies a .gitignore — verify and extend if needed.)
20. **[S]** `git init && git remote add origin git@github-work:arielssv/subgraph-verifier.git`.
21. **[S]** `git add -A && git commit -m "feat(milestone-0): scaffold project"`.
22. **[S]** `git tag -a v0.0.0 -m "Milestone 0: Project Setup"`.
23. **[S]** Update `progress.md`.

## Files created or modified

**New files:**
- `package.json`, `package-lock.json`, `index.html` (Vite)
- `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` (Vite + edits)
- `src/main.tsx`, `src/App.tsx`, `src/index.css` (Vite + Tailwind edits)
- `src/config.ts`
- `src/pages/ComparisonPage.tsx`, `src/pages/TimelinePage.tsx`
- `src/components/ui/button.tsx`, `src/components/ui/card.tsx` (shadcn)
- `src/lib/utils.ts` (shadcn-generated for `cn()`)
- `components.json` (shadcn)
- `.gitignore`

**Modified files:**
- `progress.md`

**Deleted files:**
- `src/App.css` (replaced by Tailwind)
- `src/assets/react.svg` (boilerplate)

**Untouched (flagged in summary):**
- `how-to-start-a-project.md`, `kickstart-prompt.txt` at repo root

## Testing criteria

Milestone passes when ALL of these are true:

- [ ] `npm run dev` starts without errors or warnings
- [ ] Visiting `http://localhost:5173/` renders ComparisonPage with a visible Shadcn Card and disabled Button
- [ ] Clicking the "Timeline" nav link navigates to `/timeline` and renders TimelinePage
- [ ] Browser back button returns to `/` with no re-render flicker
- [ ] A Tailwind utility class applied to any element visibly changes its styling (e.g. `bg-blue-500`)
- [ ] `npm run build` completes with no errors, produces `dist/index.html`
- [ ] `npm run preview` serves the built bundle and both routes work
- [ ] `src/config.ts` exports all 4 constants (`RPC_URL`, `SUBGRAPH_URL`, `VIEWS_ADDRESS`, `VIEWS_ABI`) and 4 block markers
- [ ] TypeScript compiles with no errors (`tsc --noEmit`, usually run as part of build)
- [ ] `git status` is clean after commit; `git tag --list` shows `v0.0.0`
- [ ] `git remote -v` shows the work SSH remote

## Out of scope (do NOT do in this milestone)

- Fetching anything from the subgraph or RPC — all pages are static placeholders
- The cross-page store, `localStorage` persistence, progress UI
- Porting `compareOperator` or `fetchAllPaginated` from sub-diff
- Shadcn components beyond `Button` + `Card`
- Vercel config (`vercel.json`, SPA rewrites) — deferred until local is green
- Pushing to GitHub — user must explicitly confirm before push
- Tests — nothing testable yet; unit tests start in milestone 1 with `compareOperator`

## Risks / gotchas

- **Vite into non-empty dir** may prompt destructively — confirm it doesn't overwrite `CLAUDE.md`, `planning/`, `research.md`, `progress.md`. If it does, restore from memory (all have been written to in this session).
- **Shadcn init can fail** if `@/*` alias isn't wired in both tsconfigs — verify before step 8.
- **react-router v7** — import from `react-router`, not `react-router-dom`. The old package name is a common stale-tutorial trap.
- **Tailwind v4 + shadcn init** — shadcn's init writes CSS variables into `src/index.css`. Don't re-add `@tailwind base/components/utilities` lines; v4 replaces all three with `@import "tailwindcss"`.
