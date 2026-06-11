# STORY-010: Split qa-workflow into a portable core and a project-only execution layer

## User Story

As a maintainer of the qa-workflow across several repos,
I want it split into a general-purpose authoring half and a project-only execution half,
So that the authoring half travels to any repo the way dev-workflow does, while the
runner-specific bits stay per-project.

## The Need

The qa-workflow today mixes two things that don't have to live together: portable
**authoring** (decide what to test, write readable markdown test docs) and **execution**
that's hardwired to this repo's infrastructure (the step-store, the `cicd` YAML runner,
`make ci`). That coupling means the whole workflow can't be reused in sibling repos that
don't share that infrastructure — only a project with the exact runner can use any of it.
The valuable, general part — the gated "what to test" plus reviewable test docs — is
trapped behind the project-specific execution. dev-workflow ported everywhere because it
assumes only GitHub + git; qa-workflow should be able to do the same for its authoring half.

## Success Looks Like

- The authoring commands (plan + cases + their reviews) run in any repo with only markdown
  + GitHub — they name no project-specific runner or store.
- The execution commands (bind, run, drift, and the reuse index) are clearly a separate,
  project-owned layer that this repo fills with its `cicd` runner + step-store.
- The qa-workflow still works end-to-end in this repo — no regression.
- The general half is ready to port to the sibling repos the way dev-workflow was.

## Open Questions

- Where the project-only commands live — a separate command group vs. labelled in place.
- Which command owns story-hash drift (general) vs. binding drift (project).
- How a consumer repo plugs in its own executor (reuse `dw-test-design`'s detection?).

## Status

- Created: 2026-06-09
- Completed: 2026-06-11
- Plan: #117 (realized)
- Issues: #118 ✓ (decouple authoring), #119 ✓ (document the A/B/C boundary)
