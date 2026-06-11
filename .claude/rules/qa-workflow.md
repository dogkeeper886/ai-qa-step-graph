---
paths:
  - "docs/tests/**/*.md"
---

# qa-workflow

A sibling to `dev-workflow`: it turns a story into a **trustworthy test**. STORY-010 factored
it into **three groups**, each with a canonical home repo, **wired only by artifacts** — no
group calls into another's internals.

## The three groups

| Group | Commands / code | Canonical home | Needs |
|-------|-----------------|----------------|-------|
| **A · authoring** | `qw-plan` · `qw-review-plan` · `qw-cases` · `qw-review-cases` + the `docs/tests/` format | **ai-qa-workflow** | markdown + GitHub |
| **B · execution + binding/drift** | `qw-bind` · `qw-review-bind` · `qw-run` · `qw-drift` + `audit-bind`/`drift`/`port-yaml` | **test-framework-template** | a runner (cicd YAML) |
| **C · step reuse** | the `step-store` (pgvector) + `load-tests` / `search_step` | **ai-qa-step-graph** (here) | a database |

This repo is the **C source** and also a **full consumer** — it runs A + B + C against its own tests.

## The flow (here, as a consumer)

```
   docs/stories/STORY-XXX.md   ──or──  "write a test for X"
            │
            ▼  A · AUTHORING  (markdown + GitHub)
   qw-plan ──► qw-review-plan      scenarios → the [STORY-XXX] Test Plan issue
   qw-cases ─► qw-review-cases     write docs/tests/TS-*.md  (optional: reuse from C)
            │
            ▼  hand off the markdown doc  (an artifact, not a command call)
   B · EXECUTION + BINDING  (the runner)
   qw-bind ──► qw-review-bind      bind each case ↔ a cicd YAML (audit, not codegen)
   qw-run                          make up + the cicd assert-first runner
   qw-drift                        story changed → stale; doc↔script diverged → unbound
```

## No cross-references — the wiring is a thin seam

- **A → B** = artifact handoff: A writes/reviews `docs/tests/TS-*.md` and stops; B binds the
  `Script:` and runs. A never names `qw-bind`.
- **A → C** = optional: A may query the reuse index *if one exists*; it authors fine without it.
- **The `docs/tests/` format is the one shared contract** — A owns it; B (`audit-bind`/`drift`)
  and C (`load-tests`) read markdown per the spec, not via a code import.
- **B's binding/drift code is DB-free** — `audit-bind`/`drift`/`port-yaml` import only
  `node:fs`/`path`/`crypto` + `testdoc`, which is why B travels to test-framework-template
  without the store.

## The test-plan issue (A's artifact, STORY-009)

`qw-plan`'s scenarios persist as a **GitHub issue**, titled `[STORY-XXX] Test Plan`, labelled
`test-plan` — its own label so it never collides with dev's `[STORY-XXX] Plan`. `qw-review-plan`
reviews the issue; `qw-cases` reads it and records the issue number in each `TS-*.md` `plan:`
field (see `docs/tests/README.md`).

- **Ad-hoc target** ("write a test for X", no story): the plan issue is `Test Plan: <subject>`
  (no story anchor needed). Trivial one-offs may skip the plan and go straight to `qw-cases`.
- The plan issue is **not drift-watched** — `qw-drift` anchors each `TS-*.md` to its story via
  `story_hash`; a plan diverging from its tests is out of scope.

## Producer → review pairing

| Producer | Review | Group |
|----------|--------|-------|
| `qw-plan`  | `qw-review-plan`  | A |
| `qw-cases` | `qw-review-cases` | A |
| `qw-bind`  | `qw-review-bind`  | B |
| `qw-drift` | *(is itself a review)* | B |
| `qw-run`   | *(exempt — a results log)* | B |

No producer ships without a review covering its output.

The format a test doc must follow is `docs/tests/README.md`.
