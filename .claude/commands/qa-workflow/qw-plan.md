# Plan What to Test

```
Derive the scenarios that verify a story (or an on-request target) — the "what
to test", before any test doc is written.

Target: a STORY-XXX, or an ad-hoc request ("write a test for X").

## PURPOSE

The front of the qa-workflow — the test analogue of reading a story before
implementing. It produces a short list of **scenarios** (each a TS-to-be) that together
cover the need, and **persists them as a `[STORY-XXX] Test Plan` GitHub issue** so the plan
survives the session and `qw-review-plan` reviews a real artifact (not a chat message);
`qw-cases` then writes against it. See `.claude/rules/qa-workflow.md`.

Fits in the qa-workflow:

    qw-plan → qw-review-plan → qw-cases → qw-review-cases → qw-bind → qw-run
    (qw-run = `make up` + the cicd runner — a phase, not a slash command)

---

## WORKFLOW

    /qw-plan STORY-003
        │
        ├─► Step 1: Read the need
        │   - If a STORY-XXX: read docs/stories/STORY-XXX.md (the need + "Success Looks Like").
        │   - If an on-request target: restate what behaviour is to be verified.
        │
        ├─► Step 2: Check what already exists (dogfood the store)
        │   - Search the store for test cases already covering this behaviour —
        │     by what a test verifies, not its step text:
        │       make query-cases Q="<the behaviour>"
        │     so the plan reuses vetted coverage instead of duplicating it.
        │   - List the docs/tests/ scenarios already linked to this story:
        │       grep -l 'story: STORY-XXX' docs/tests/
        │   - Check for an existing test-plan issue (extend it, don't duplicate):
        │       gh issue list --search "[STORY-XXX] Test Plan" --label plan --state all
        │     (search the full title — dev and qa both use the `plan` label)
        │
        ├─► Step 3: Propose scenarios
        │   - Break the need into scenarios (TS-to-be), each:
        │     • one coherent slice of behaviour, • independently runnable,
        │     • mappable to one or more cicd executables.
        │   - For each, name the cases (TC-to-be) it will hold, at a sentence each.
        │
        ├─► Step 4: Open the test-plan issue
        │   - Ensure the label (idempotent):
        │       gh label create "plan" --color "5319e7" --description "The approach for a story, before tasks" --force
        │   - Write the scenarios into a GitHub issue so they outlive the session
        │     (the template below). Title: [STORY-XXX] Test Plan
        │     (ad-hoc target → "Test Plan: <subject>", no story prefix). Label: plan.
        │       gh issue create --label "plan" --title "[STORY-XXX] Test Plan" --body "…"
        │
        └─► Step 5: Hand off — stop for review
            - Show the test-plan issue URL for `/qw-review-plan`, then `/qw-cases`.
            - STOP. Do NOT write TS docs — that is `/qw-cases`.

---

## TEST-PLAN ISSUE BODY

    ## Scenarios
    ### TS-01 (to-be): <scenario title>
    - Objective: <the slice of behaviour it verifies>
    - Cases: TC-01 <one line>, TC-02 <one line>

    ### TS-02 (to-be): …

    Part of STORY-XXX

---

## API Notes

- A scenario here is a *plan item*, not yet a file — `qw-cases` writes the doc.
- The scenarios persist as a `[STORY-XXX] Test Plan` issue (label `plan`; ad-hoc →
  `Test Plan: <subject>`) — the same plan-as-issue form `dev-workflow` uses, with a
  distinct title so it never collides with dev's `[STORY-XXX] Plan`.
- The story is the goal; keep the plan to coverage, not step detail.
- Producer paired with `/qw-review-plan`, which reviews the issue.
```
