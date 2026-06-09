---
paths:
  - "docs/tests/**/*.md"
---

# qa-workflow

A sibling to `dev-workflow`. Where dev-workflow turns a need into shipped code,
qa-workflow turns a story (or an on-request target) into a **trustworthy test** —
written as readable markdown in `docs/tests/`, bound to the `cicd/` runner, and watched
for drift. Each producer is paired with a review, the same discipline `dev-workflow`
and `reviewing-artifacts` enforce.

> **Persisted test plan (STORY-009), landing incrementally.** `qw-plan` opens a
> `[STORY-XXX] Test Plan` GitHub issue (label `plan`) instead of leaving scenarios in chat;
> `qw-review-plan` reviews that issue; `qw-cases` reads it and the `TS-*.md` trace back via a
> `plan:` field (the issue number). The command edits are #104 (`qw-plan`) / #105
> (`qw-review-plan`) / #106 (`qw-cases`) — until they land, the plan lives only in the
> conversation as before.

## The flow

```
   docs/stories/STORY-XXX.md   ──or──  "write a test for X"   (on request)
            │
            ▼
   qw-plan ───────► qw-review-plan      what to test — scenarios persisted as the
            │                            [STORY-XXX] Test Plan issue (cover the story)
            ▼
   qw-cases ──────► qw-review-cases     write docs/tests/TS-*.md (the #23 format) from the
            │                            plan; dogfood search_step first — reuse a vetted step
            ▼
   qw-bind ───────► qw-review-bind      bind each case ↔ a cicd YAML (audit, not codegen)
            │
            ▼
   qw-run            make up + the cicd assert-first runner (not a new executor)
            │
            ▼
   [human reviews results] ──► dw-merge   green CI → CD (publish the MCP image)
            │
            ▼
   qw-drift          freshness gate (CI + on demand): story changed → stale;
                     doc↔script diverged → unbound. Loops back to qw-cases.
```

## The test-plan issue (STORY-009)

`qw-plan`'s scenarios persist as a **GitHub issue**, titled `[STORY-XXX] Test Plan`,
labelled `plan` — the same plan-as-issue form `dev-workflow` uses, with a distinct title so
it never collides with dev's `[STORY-XXX] Plan`. Its body holds the scenarios (each a
TS-to-be, with the cases it will hold). `qw-review-plan` reviews the issue; `qw-cases` reads
it and records the issue number in each `TS-*.md` `plan:` field (see `docs/tests/README.md`).

- **Ad-hoc target** ("write a test for X", no story): the plan issue is titled `Test Plan:
  <subject>` (no `[STORY-XXX]` prefix) — an issue needs no story anchor, so the no-story
  path just works. Trivial one-off tests may skip the plan and go straight to `qw-cases`.
- The plan issue is **not drift-watched** — `qw-drift` still anchors each `TS-*.md` to its
  story via `story_hash`; a plan diverging from its tests is out of scope (a future hook).

## Producer → review pairing

| Producer | Review | Covers |
|----------|--------|--------|
| `qw-plan`  | `qw-review-plan`  | does the plan cover the story? |
| `qw-cases` | `qw-review-cases` | each doc: one job, observable, traces back |
| `qw-bind`  | `qw-review-bind`  | doc↔script agree (audit, `audit-bind`) |
| `qw-drift` | *(is itself a review)* | the freshness gate |
| `qw-run`   | *(exempt)* | yields a results log, no outward deliverable |

No producer ships without a review covering its output.

## What is reused, not rebuilt

- **The story + issues** come from `dev-workflow` — a story gets both `dw-*` (code)
  and `qw-*` (tests), referencing the same `STORY-XXX`.
- **The runner** is `cicd/tests/` (the assert-first YAML runner) + `make up`.
- **The store** is the STORY-001 step-store: `qw-cases` calls `search_step` to find a
  vetted step before authoring one; the loader (`load-tests`) indexes test docs back in.
- **CI** composes with STORY-002 (`qw-drift` + `audit-bind` run as checks), not a new pipeline.

The format a test doc must follow is `docs/tests/README.md`.
