---
name: milestone-workflow
description: >
  Use when starting a new milestone, doing research/planning for a milestone,
  or when the user mentions milestones, phases, or project progression.
  Enforces the research → planning → development → testing → commit cycle.
---

# Milestone Workflow

Every milestone follows this exact cycle. Never skip steps.

---

## Startup: Orient Before Anything Else

Before touching any milestone, always read these files in order:
1. `CLAUDE.md` — project rules, stack, conventions
2. `progress.md` — current state of the project, what's been built, key decisions
3. `research.md` — project-level research and architecture decisions
4. `planning/` folder — prior milestone planning docs

If `progress.md` doesn't exist yet, create it as an empty file at the project root.

---

## Phase 1: Research

**First, check what already exists before doing any new research:**
- Read `research.md` to see if this milestone's domain is already covered
- Check any global reference docs at the path defined under "Global References" in CLAUDE.md
- Identify only the *gaps* — what is not yet covered

**Then, based on what you found:**
- If `research.md` already covers this milestone fully → summarize what applies and ask the user to confirm before proceeding. Skip new research.
- If there are gaps → research only those gaps, then append findings to `research.md`

When appending to `research.md`, add a section with:
- Goal and context for this milestone
- Technical options explored (with pros/cons)
- Chosen approach and rationale
- Dependencies and risks
- External references / data sources

Present findings to user for confirmation before proceeding.

---

## Phase 2: Planning

1. Based on confirmed research, write `planning/milestone-N.md` with:
   - Goal statement (1-2 sentences)
   - Deliverables (specific, measurable)
   - Implementation steps (ordered, each with estimated complexity)
   - Data schemas or flows (if applicable)
   - Testing criteria (what passes, what fails)
   - Files that will be created or modified
2. Present planning to user for confirmation before proceeding

---

## Phase 3: Development

1. Implement according to the confirmed plan
2. Follow all code style rules from CLAUDE.md
3. Write tests alongside implementation
4. Stay within milestone scope — flag anything out of scope to user

---

## Phase 4: Testing & Verification

1. Run all tests per commands in CLAUDE.md
2. Verify data against external sources if applicable
3. Manual verification of key user flows
4. Fix any issues found

### Phase 4b: Iteration

It's normal to go through several rounds of adjustment after initial testing.
For each iteration:
- Fix the issue
- Re-run the relevant tests
- Log what broke and what was changed in `progress.md` under "Known Issues / Deferred Work"

Only move to Phase 5 once the milestone's testing criteria (defined in planning) are met.

---

## Phase 5: Commit & Tag

1. Verify identity is locally set:
     git config --local user.email
     - If empty or matches global, STOP and ask the user before committing.
2. Stage changes: `git add -A`
3. Commit: `feat(milestone-N): [description of deliverables]`
4. Tag: `git tag -a vX.N.0 -m "Milestone N: [title]"`
5. Do NOT push — inform the user the milestone is committed locally and ready to deploy
6. When user explicitly confirms, merge to main and push:
   ```
   git checkout main
   git merge [current-branch]
   git push origin main
   git push --tags
   ```

---

## Phase 6: Update progress.md

After every completed milestone, update `progress.md` to reflect current state.
Keep it short — this is a catch-up doc for new sessions, not a full log.

`progress.md` structure:

```
# Project Progress

## Status
Milestone N complete. Next up: Milestone N+1.

## What's Been Built
- [Feature or module]: [1-line description of what it does and how]
- ...

## Current File Structure
[Trimmed directory tree — only meaningful files, not node_modules etc.]

## Key Decisions Made
- [Decision]: [Why — so future sessions don't re-litigate it]
- ...

## Known Issues / Deferred Work
- [Anything punted, partially implemented, or needs revisiting]
- [Iteration notes from Phase 4b]

## Environment & Config Notes
- [Anything non-obvious about running the project locally]
```

---

## Checklists

### Before Starting a Milestone
- [ ] Read CLAUDE.md
- [ ] Read progress.md
- [ ] Read research.md and any global reference docs at the path defined in CLAUDE.md
- [ ] Read all prior planning docs
- [ ] Identify research gaps (if any) before doing any new research
- [ ] Know success criteria for this milestone

### After Completing a Milestone
- [ ] All tests pass and testing criteria from planning are met
- [ ] No debug statements left in code
- [ ] Data verified against external sources (if applicable)
- [ ] Iteration notes logged in progress.md
- [ ] Code committed with proper conventional commit message
- [ ] Git tag created for milestone
- [ ] progress.md updated to reflect current project state
- [ ] research.md updated if new findings were made