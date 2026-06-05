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

## The flow

```
   docs/stories/STORY-XXX.md   ──or──  "write a test for X"   (on request)
            │
            ▼
   qw-plan ───────► qw-review-plan      what to test — scenarios that cover the story
            │
            ▼
   qw-cases ──────► qw-review-cases     write docs/tests/TS-*.md (the #23 format);
            │                            dogfood search_step first — reuse a vetted step
            ▼
   qw-bind ───────► qw-review-bind      bind each case ↔ a cicd YAML (audit, not codegen)
            │
            ▼
   qw-run            make up + the cicd dual-judge runner (not a new executor)
            │
            ▼
   [human reviews results] ──► dw-merge   green CI → CD (publish the MCP image)
            │
            ▼
   qw-drift          freshness gate (CI + on demand): story changed → stale;
                     doc↔script diverged → unbound. Loops back to qw-cases.
```

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
- **The runner** is `cicd/tests/` (the dual-judge YAML executor) + `make up`.
- **The store** is the STORY-001 step-store: `qw-cases` calls `search_step` to find a
  vetted step before authoring one; the loader (`load-tests`) indexes test docs back in.
- **CI** composes with STORY-002 (`qw-drift` + `audit-bind` run as checks), not a new pipeline.

The format a test doc must follow is `docs/tests/README.md`.
