# STORY-011: Move the test-execution group (B) to test-framework-template

## User Story

As a maintainer of the factored qa-workflow,
I want the execution + binding group (bind a test doc to a runner, run it, detect drift) to
live in test-framework-template,
So that the repo which owns the runner also owns running the authored tests — completing the
three-group split.

## The Need

STORY-010 split the qa-workflow into three groups: authoring (A, now in ai-qa-workflow),
**execution + binding (B)**, and step-reuse (C, the step-store). Group B is the part that
takes a readable test doc and actually *runs* it — binding each case to an executable,
running it, and flagging when a test drifts from what it checks. That job belongs with the
**runner**, which lives in test-framework-template. Today B is stranded in ai-qa-step-graph
(the step-store repo): its commands call into the step-store package and its binding/drift
logic sits in `step-store/src/`, even though that logic is file-based and has nothing to do
with the database. Until B moves, test-framework-template can't run the tests that group A
authors, and the three-group split is only two-thirds done.

## Success Looks Like

- The execution/binding commands and the binding/drift logic live in test-framework-template,
  next to the runner it already owns.
- They are self-contained — no dependency on the step-store (the logic is already file-based).
- A project can author test docs (A) and bind + run + drift-check them via
  test-framework-template (B), with the step-store reuse (C) optional.
- ai-qa-step-graph keeps the step-store (C) and consumes B from test-framework-template
  (the canonical source); dropping its own duplicate B is a follow-on, not this story.

## Open Questions

- Whether B needs decoupling-in-place first (the way A did) before it can be extracted.
- Where the shared test-doc format parser lives, since both B and C read the format.
- test-framework-template's current structure/state and how the moved logic + its run
  scripts fit there.

## Status

- Created: 2026-06-10
- Completed: 2026-06-11
- Plan: #121 (realized)
- Issues: test-framework-template#20 ✓, test-framework-template#21 ✓ (the work lives there)
