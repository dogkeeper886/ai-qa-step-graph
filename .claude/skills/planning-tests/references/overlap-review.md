# Overlap Review

After every scenario revision, run an overlap review against every other scenario in the plan. This catches duplicate coverage that prose-only review misses.

## The prompt

For each scenario being revised, ask:

> *List any case in this scenario whose object-under-test or assertion overlaps another scenario's case. Note as: **layered** (justified) or **duplicate** (fix).*

Apply to every case in the revised scenario. Compare against every case in every other scenario.

## Layered vs duplicate

**Layered** = the same predicate is verified at multiple abstractions or surfaces, by design. Justify the split in writing within the scenario file (one-line preamble or per-case note).

Examples of legitimately layered:

- DTO bean-validation + custom domain validator both fire on the same bad input — both reported, both caught
- UI-driven mode switch enforces mutual exclusion + API directly tests rejection — UI test + API test cover different client paths
- A configuration JSON round-trips through admin UI write + API direct write — both ensure schema is honored

**Duplicate** = the same case appears twice with no different lens. Fix by deleting from one scenario or moving to where it belongs.

Examples of duplicates surfaced during a past plan review:

- TS-06 case 2 and TS-07 case 1 both asserted "API rejects new fields with flag OFF" — same assertion, two homes. Resolved by giving TS-07 sole ownership of flag-OFF behavior across both surfaces.
- TS-04 case 4 and TS-06 case 1 both targeted the same flow with an existing fixture — split by structural vs content claims, but the test object and access path were identical. Merged.
- TS-05 case 1 (`POST` with legacy field only) became a subset of TS-06 case 1 step 1 once TS-06 grew into a lifecycle. Removed from TS-05.

## When to run the review

- After collapsing or expanding any case set
- After splitting a scenario into multiple smaller ones
- After moving a case between scenarios
- Before declaring a scenario "done" in a TS review pass
- During `tw-plan-review` when preparing the plan for sign-off

## Output

The reviewer maintains a list of overlaps in a working buffer (the issue or PR description, the planning notes, etc.). Each entry:

```
TS-X case N ⟷ TS-Y case M
  - object: <thing being tested>
  - layered? yes / no
  - reason: <one line>
  - resolution: keep both | merge | move to TS-X | delete from TS-Y
```

Resolutions either get applied immediately or batched for a final overlap sweep before merge.

## Anti-pattern: "wide" scenarios re-executing "deep" cases

A common cause of overlap is a "wide variant" scenario re-executing the full case-set of the "deep representative" scenario. When the depth strategy says *"do not re-execute the full case-set per variant — only confirm placement, gating, and accept-and-connect"*, enforce that in the wide-variant scenario's wording too. If the wide-variant cases read like full deep-representative runs, they're duplicates pretending to be variants.

## Coverage-gap symmetry

The flip-side of overlap is coverage gap. While reviewing for overlaps, also note any node or edge in the implicit flow graph (visible in `scenarios/README.md` Mermaid diagrams) that no case touches. A scenario revision is a good time to discover both kinds of issues — they tend to surface together.

## Graph-staleness check

When you revise a scenario, also verify that the Mermaid diagrams in `scenarios/README.md` still reflect current scope ownership:

- Each node's TS-XX label points at the scenario that *currently* owns that node
- New nodes for added scope are present
- Removed nodes for descoped behavior are gone

Stale diagrams cause prose-level review to mislead — reviewers think a node is covered by TS-X when it's actually been moved to TS-Y. Update the diagram in the same commit as the scenario revision.

The graph-staleness check is mandatory before declaring a scenario revision done. See `scenario-conventions.md` § "Graph-node mapping" for the related smell list (phantom case, misplaced assertion, stale node ownership).
