---
paths:
  - ".github/workflows/**/*.yml"
---

# CI workflows

CI in this repo is **assert-first and manual** (STORY-002). There are two workflows,
both `workflow_dispatch` / `workflow_call` only — nothing auto-runs on push/PR:

| Workflow | What it does |
|----------|--------------|
| `tests.yml` | Stands up Postgres+pgvector with `make up` and runs the assert-first suite (`npm --prefix cicd/tests test`). Heavy (builds the stack) — on demand. |
| `qa-drift.yml` | File-only story↔test drift + binding audit (`npm --prefix step-store run drift`). Fast, no stack. |

Local equivalent: **`make ci`** (`up → suite → drift`) is the on-demand merge gate.

## Conventions

- **No auto-triggers.** Keep workflows on `workflow_dispatch` (+ `workflow_call` for
  reuse). The full-stack build is too heavy to run on every push.
- **Local↔CI parity.** CI stands the stack up with the *same* `make up`/`make down` a
  developer runs — no separate setup path.
- **The verdict is deterministic** (exit codes + expect/reject patterns). No LLM in the
  gate; the on-fail log-reviewer (`npm run review`) is advisory and never required.
- **No required status checks.** Since nothing auto-runs, gating is `make ci` + human
  review, not branch protection. (See STORY-002 #42.)
