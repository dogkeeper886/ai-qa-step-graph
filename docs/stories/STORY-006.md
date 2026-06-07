# STORY-006: The .claude tooling reflects what this repo actually is

## User Story

As a developer working in this repo,
I want `.claude/` to hold only the commands, skills, and rules this project's
workflow actually uses,
So that the tooling reads as *this* project — not a generic template — and I'm not
navigating dozens of commands for domains this repo never touches.

## The Need

The repo was scaffolded in one shot (commit `8c61f56`, "template + ai-qa-studio
tooling") with the **entire** ai-qa-studio toolkit: 76 commands across 8 groups and
18 skills. But this project is a pgvector MCP step-store, and its real workflow is a
small slice of that — the `dev-workflow` and `qa-workflow` command chains, a few
skills (`reviewing-artifacts`, `add-tool`, `install`), and the `rules/`.

Everything else is a **different domain** — TestLink / Jira / Confluence QA-test
management, demo generation, web-UI design (`confluence`, `jira`, `testlink`,
`test-workflow`, `project` command groups and their paired skills). None of it is
invoked here. It's noise: it inflates the command/skill list, obscures the tools that
matter, and makes the toolkit lie about what the project does. Trimming it makes
`.claude` honest and navigable.

## Success Looks Like

- The other-domain command groups and their skills are gone from `.claude/`; what
  remains is what this repo's workflow actually uses.
- Nothing in the kept tooling points at something removed — no dangling command or
  skill references (the repo's own anti-dangling-pointer rule holds). In particular
  the two known coupling sites are reconciled, not left broken.
- The `dev-workflow` and `qa-workflow` chains, `reviewing-artifacts`, and the CI/qa
  rules still work end to end after the trim.
- A new reader scanning `.claude/` sees a toolkit that matches a step-store project.

## Open Questions

*(The "how" — worked out on the issue. The scope direction is decided; what's
listed here is the mechanical work and the few edges still to settle.)*

- **The precise file-level keep/remove set** — finalized on the issues. Of the
  skills, only `reviewing-artifacts` is kept outright; the typography/phrasing pair
  is held pending study (below); everything else is removed.
- **Coupling to reconcile before deletion**, so nothing dangles:
  - `commands/dev-workflow/dw-story.md` references `/tw-plan-init` (test-workflow)
    — drop that line.
  - removing `add-tool` + `install` orphans `utility:review-install` (it audits
    them) and any `add-tool` mentions in `install` — resolve as part of the trim.
- **The `utility` members** (`evolve`, `review-install`, `session-summary`,
  `rewrite-text`, `robot-log-analyzer`) — keep or cut, beyond `sync` / `compare`
  (removed).
- **Do `reviewing-typography` / `reviewing-phrasing` earn their place?** They review
  *human-read* deliverables (README and the like). Commands, skills, and CLAUDE.md
  are *agent-read*, so they're out of that scope. Decide whether to repurpose the
  pair to guard this repo's human-facing docs, or remove them. (Separate study.)

## Status

- Created: 2026-06-07
- Issues: #56 (reconcile cross-refs), #57 (remove unused tooling), #58 (typography/phrasing study)
- PR: #59 (open) — all three issues
