# How to Start a New Project

## Before You Start

Make sure you have:
- `project-starter/` folder ready on your machine
- The GitHub repo created on github.com (log in as the correct account, click New Repository — ideally do not initialize with README to avoid a push conflict, but if you do, just run `git pull origin main --rebase` before pushing)

---

## Step 1 — Copy the project starter

Copy the entire `project-starter/` folder to your new project location and rename it to your project name.

Your project folder should contain:
```
your-project/
├── CLAUDE.md
├── planning/
│   └── milestone-0.md
└── .claude/
    └── skills/
        ├── new-project/
        │   └── SKILL.md
        └── milestone-workflow/
            └── SKILL.md
```

---

## Step 2 — Add prior research (optional)

If you did research in the browser beforehand, create `research.md` in the project root and paste your notes there before opening Claude Code.

---

## Step 3 — Open Claude Code

Open your terminal, navigate to the project folder, and start Claude Code.

For normal use:
```bash
cd your-project
claude
```

To skip permission prompts (Claude won't ask before running commands or editing files):
```bash
cd your-project
claude --dangerously-skip-permissions
```

Use `--dangerously-skip-permissions` when you want Claude to work autonomously without interruption. Avoid it if you are working in a sensitive codebase or want to review each action.

---

## Step 4 — Run the kickstart prompt

Paste this prompt, filling in your spec:

```
Read .claude/skills/new-project/SKILL.md and follow it. My project spec is:

[describe what you're building in a few sentences]
```

If you have prior research in research.md, use this version instead:

```
Read .claude/skills/new-project/SKILL.md and follow it. 
I've done prior research in research.md — read that first. 
My project spec is:

[describe what you're building in a few sentences]
```

---

## Step 5 — Answer Claude's questions

Claude will ask you:
1. Tech stack questions (if not clear from spec)
2. Which GitHub account — personal or work
3. The GitHub repo name/URL

Confirm the generated CLAUDE.md before Claude writes it.

---

## Step 6 — Start Milestone 0

Once CLAUDE.md is confirmed, tell Claude:

```
Start milestone 0.
```

Claude will read the milestone workflow skill and begin setting up the project.

---

## Step 7 — Verify

When Milestone 0 is done, Claude will tell you the dev server is running. Open your browser and confirm the hello world is visible before moving on.

---

## Ongoing Workflow

For each subsequent milestone:
```
Start milestone N.
```

Claude will follow the milestone workflow skill automatically — research, planning, development, testing, commit.

To deploy to Vercel, confirm to Claude after a milestone is complete:
```
Ready to deploy.
```

Claude will merge to main and push, triggering Vercel auto-deploy.
