# `docs/tests/` — the test-doc format

Each test in this repo is a **readable markdown document** that lives here, close to
the story it verifies. The markdown is the *canonical* artifact — humans read and
review it, and it is the source of truth for **why** a test exists and **what** it
checks. The executable (`cicd/tests/testcases/**/*.yml`) is the source of truth for
**how it runs**. The two are bound, and a later gate (#25) audits that they agree.

This format realizes [STORY-004](../stories/STORY-004.md); the flow it belongs to
is the [#21 design record](https://github.com/dogkeeper886/ai-qa-step-graph/issues/21).

## Plan docs — the persisted what-to-test (STORY-009)

Before any `TS-*.md` is written, `qw-plan` records the **scenarios that cover a story** as
a persisted plan doc, so the agreed "what to test" survives the session and `qw-review-plan`
reviews a real artifact, not a chat message. One plan per story:

```
docs/tests/
  PLAN-STORY-009.md            # the scenarios (TS-to-be) that cover STORY-009
  TS-01-….md                   # the cases qw-cases writes from it
```

Front-matter:

```yaml
---
story: STORY-009                # the need this plan covers (→ docs/stories/STORY-009.md)
story_hash: 7474d8b6…           # sha256 of the story file at plan time (same drift anchor as a TS)
status: draft                   # draft | reviewed  (qw-review-plan sets `reviewed`)
---
```

Body: one section per scenario (a TS-to-be) — its objective and the cases (TC-to-be) it
will hold, a sentence each. A scenario here is a *plan item*, not yet a file; `qw-cases`
turns each into a `TS-*.md` and sets that doc's `plan:` field back to this plan.

The plan doc reuses `story_hash` as its drift anchor: if the story changes, the plan is
`stale` like any TS. (Plan→TS drift — a TS diverging from a changed plan — is out of scope
for now; a `plan_hash` on the TS is the future hook if we want it.)

## One file = one scenario (TS), many cases (TC)

Mirrors how QA test cases are conventionally authored: a **scenario** groups related
**cases**, each case a sequence of **steps**.

```
docs/tests/
  TS-01-stack-lifecycle.md     # a scenario: TC-01, TC-02, … each with a Steps table
  TS-02-….md
```

- **TS** (scenario) — the file. Holds the front-matter and a `## Why this scenario exists`.
- **TC** (case) — a `### TC-NN:` section. Has an objective, a **`Script:`** binding to
  one executable, and a **Steps** table.
- **Step** — one row of a case's Steps table: an **Action** and its **Expected Result**.
  This is the unit the step-store indexes (see *Feeding the step-store* below).

## Front-matter (scenario level)

```yaml
---
id: TS-01                       # scenario id, unique within the namespace
title: Stack builds and runs its lifecycle
namespace: ai-qa-step-graph     # which repo/tenant this test belongs to (multi-tenant key)
story: STORY-003                # the need this scenario verifies (→ docs/stories/STORY-003.md)
plan: PLAN-STORY-003            # the plan doc this scenario was authored from (qw-cases sets it)
issue: 23                       # the implementing issue (optional)
status: green                   # green | stale | unbound  (maintained by the drift gate, #27)
story_hash: 7474d8b6…           # sha256 of the linked story file at last sync (drift anchor)
---
```

- `namespace` divides tests by repo/user. The step-store scopes search to one namespace
  so a lookup returns only that repo/tenant's steps — a scoping filter, not a hard
  security boundary. This repo's own tests use `ai-qa-step-graph`.
- `story` + `story_hash` are the drift anchor: when the story file changes, its hash no
  longer matches and the scenario is flagged `stale` (#27).
- `plan` traces the scenario back to the `PLAN-STORY-XXX.md` it was authored from
  (`qw-cases` sets it). Optional — absent when a test was written without a plan doc.
- The **`Script:` binding is per-TC, not in front-matter** — a scenario's cases can map
  to different executables.

## Case (TC) structure

```markdown
### TC-01: Project build verification

- **Objective:** the stack builds from a clean checkout.
- **Script:** cicd/tests/testcases/build/TC-BUILD-001.yml
- **Preconditions:** Node and npm available.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Run `node --version` | prints `vNN.NN.NN` |
| 2 | Run `npm install` | completes without error |
```

The Steps table is **machine-extractable** on purpose: the loader (#26) reads each row
as one `Action → Expected Result` step.

## Traceability (both directions)

- **story → tests:** `grep -l 'story: STORY-XXX' docs/tests/`
- **test → story / script:** the front-matter `story:` and each case's `Script:` line.
- **script → test:** the `Script:` path points at the YAML; its `id` reaches back.

No hand-maintained index — the links live in the files and resolve by `grep`/path.

## Drift

`story_hash` pins the scenario to a specific revision of its story. The drift gate (#27)
recomputes the hash; a mismatch sets `status: stale` (the story moved, re-check the test).
A case whose doc and `Script:` disagree is `unbound` (#25's audit). Clean = `green`.

## Feeding the step-store (the vector side)

The step-store is a *derived* semantic index over these canonical files — it does not
replace them. The loader (#26) indexes at two granularities (the parent-document pattern):

- **Step rows** (the searchable unit): each Steps-table row is embedded as
  `Action — Expected Result`, with provenance linking back to its `{namespace, TS, TC,
  story, script}` parent. This is what `search_step` matches, so authoring can ask
  "is there already a vetted step for this?" before writing a new one.
- **The case/scenario** stays the parent you resolve *to* from a step hit — the whole
  readable TC, not just the matched line.

`namespace` is carried into the store so search is scoped per repo/tenant.

## Status values

| `status`  | Meaning |
|-----------|---------|
| `green`   | story_hash matches and the doc↔script binding holds |
| `stale`   | the linked story changed since last sync — re-check this test |
| `unbound` | the doc and its `Script:` have diverged (#25) |
