# STORY-005: Adding a step that already exists reinforces it instead of duplicating it

## User Story

As an agent (or developer) writing confirmed steps into the store,
I want `add_step` to recognise when a step **already exists by meaning** and reinforce
that one node,
So that the store stays a clean set of distinct meanings — the way it was always
supposed to — instead of accumulating near-identical duplicates.

## The Need

The whole reason this store exists is that **a step's identity is its meaning** — the
fix for the failed exact-string cache, where "click the login button" and "press the
sign-in button" were treated as different things. Search already honours that at read
time (nearest-by-meaning under a threshold). But the **write** path doesn't: `add_step`
inserts a new row every time, with no entity resolution. So the same step, phrased a
little differently by different agents over time, becomes three, five, ten rows that
all mean the same thing.

Today that doesn't give wrong answers — search still returns the right nearest hit —
so it has been fine to defer. But it quietly undoes the premise: the store bloats with
duplicates, a single search returns several copies of one step, confidence can't build
up on a node because each add is a fresh row, and the provenance of "where this step
came from" scatters across the copies instead of collecting on one. As the store grows
and more agents write to it, "node identity by embedding" has to hold on the way *in*,
not just on the way *out*.

## Success Looks Like

- Adding a step whose meaning **already exists** reinforces the existing node rather
  than creating a duplicate — repeated/paraphrased adds converge on one node.
- Adding a step whose meaning is **genuinely new** still creates a new node.
- After many adds of the same step in different words, a search returns **one** node for
  that meaning, not a pile of near-identical hits.
- The caller can tell what happened — whether its step created a new node or resolved
  to an existing one.
- A node carries the accumulated signal of having been confirmed more than once
  (confidence and provenance build up on it, rather than fragmenting across copies).

## Open Questions

*(The "how" — worked out on the issue.)*

- **What counts as "the same node":** the resolution distance is tighter than the
  search threshold (0.35) — how tight, and how is it calibrated (paraphrases vs merely
  related steps)?
- **Merge policy:** when a step resolves to an existing node, which text is kept, how
  does confidence combine, and how is the new provenance folded in?
- **Idempotency:** adding the exact same step twice should be a no-op / reinforcement,
  never a duplicate.
- **Concurrency:** two agents adding the same meaning at once both miss the
  search-before-insert and both write — pgvector has no "unique-if-near" index, so what
  prevents the race?
- **Tool contract:** how does the `add_step` MCP tool surface the outcome (created vs
  resolved) to the caller?
- **Existing duplicates:** is there a one-time pass to collapse duplicates already in a
  store, or does resolution only apply going forward?
- **Relationship to the canonical files:** `regen` rebuilds from `steps/*.jsonl` — does
  resolution change what "canonical" means, or stay purely a write-time behaviour?

## Status

- Created: 2026-06-06
- Issues: #8 (core resolution, re-homed from STORY-001), #48 (concurrency-safe), #49 (collapse existing duplicates)
