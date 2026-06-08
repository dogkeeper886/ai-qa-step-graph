# STORY-007: An AI agent can maintain a whole test suite through the step-store, at scale

## User Story

As an AI agent maintaining a project's test suite,
I want to find tests by **what they verify**, see the suite's **shape**, and read a
**whole case** on demand — not just match isolated step text,
So that I can keep coverage converging across **thousands** of cases without ever loading
them all into my context.

## The Need

STORY-004 made each test step findable in the store so authoring could ask "is there
already a vetted *step* for this?" before writing one. That closed the reuse loop at the
level of a single step's mechanics — its action and its expected result.

But the user of this store is an **AI agent**, and it doesn't think at the level of
mechanics. When it maintains a suite it asks "is there already a test for **this
behaviour**?" — the level of a test's **objective** (what it verifies). That is the one
thing the store never indexes. So the coverage check the qa-workflow tells the agent to run
(`qw-plan`: *"check what already exists"*) searches step text, misses, and the suite
fragments into near-duplicate tests instead of converging.

The deeper problem is **scale under a context window**. Maintaining thousands of cases is
like maintaining a large codebase: the agent can only ever hold a few in context, so it
must work a slice at a time — orient from a map, find the one that matters, open it, change
it, move on. Today it can do none of that against the store: there's no way to see a
project's suite folded to its cases, and no way to pull one whole case — it gets orphan
step hits and must grep files to recover the rest. Fine for a handful of tests; unworkable
for a real suite.

This is general, not one tenant's problem: **any** project's tests have an objective,
steps, and expected results. The need is for the store to serve an agent maintaining *any*
suite at scale.

## Success Looks Like

- The agent can ask **"what already verifies X?"** and get back the relevant **test
  cases** (matched on their objective), so it reuses or updates existing coverage instead
  of duplicating it — coverage converges as the suite grows.
- The agent can see a project's suite **folded to its cases and objectives** — the shape —
  without pulling every step into context.
- The agent can pull **one whole case** (objective + ordered steps + expected results) on
  demand, to read it in context or use it as a template.
- With those, the full **create / read / update / delete** loop on test cases runs **end to
  end at scale** — find existing → read → author or edit the canonical doc → re-index —
  every step a small slice, through the existing qa-workflow.
- It works across **projects / namespaces** generically, and the existing step-level reuse
  and drift gates still hold.

## Open Questions

*(The "how" — worked out on the issue. The design was explored in a plan; these are the
edges to settle.)*

- **Indexing the objective:** the Objective line already exists in the test-doc format but
  is not parsed by the shared `testdoc` parser, nor embedded by `load-tests`. What's the
  indexed unit — a case-level row (the reserved `kind='case'`) embedding title + objective,
  or another shape — and does it sit alongside or replace step rows?
- **The retrieval surface:** which tools the agent gets (e.g. search-by-objective, an
  outline/map, read-one-case), how they're exposed over MCP (and CLI), and how they relate
  to the existing `search_step`.
- **Wiring the flow:** how `qw-plan`'s and `qw-cases`'s "what already exists?" steps point
  at case-level search instead of step-only search.
- **CRUD mechanics:** whether create/update/delete needs any new primitive, or stays
  entirely canonical-file authoring + idempotent re-index (including the known `load-tests`
  limit: rows under a namespace no longer present in `docs/tests/` aren't swept).
- **Fold / dedup:** surfacing overlapping coverage (near-duplicate objectives or steps) so
  the review gates can collapse it — the "convergence" made actionable.

## Status

- Created: 2026-06-08
- Issues: #76 (index objective), #77 (search_cases), #78 (outline + get_case), #79 (wire qa-workflow + CRUD test)
- PRs (merged): #80 (#76 — objective indexed as a case-level row)
- PRs (open): #81 (#77 search_cases, #78 outline + get_case, #79 wiring + CRUD test)
