# STORY-004: A documented test flow that closes story → implement → test → CI/CD, so tests don't drift

## User Story

As a developer evolving this repo,
I want each test **documented in markdown in the repo** and **linked along the whole chain** — story → implement → test → test script / CI → CD,
So that when a story changes, the tests that verify it are **surfaced as stale instead of silently drifting**, and green CI still means "this matches the current story."

## The Need

Drift is the enemy this whole repo was born to fight. The same way step-meaning drifted in the failed cache, **tests drift from the stories they were meant to verify**: a story evolves, the test script keeps passing, and nobody notices it's now checking the *old* behaviour. An opaque test script is the worst case — there's no human-readable link back to *why* the test exists or *which* story it serves.

The user wants the test captured as **readable markdown in the repo**, sitting close to the story and traceable both ways, so the loop is **closed**: a story leads to its implementation, to its test doc, to the script/CI that runs it, to the CD that ships it — and back. When the story moves, you can **see** which test docs and scripts now need re-syncing. The point is not more tests; it's tests you can **trust to still match the story**, because drift is visible, not silent. (This extends the repo's existing `story → implement` model to close the testing half of the loop.)

## Success Looks Like

- Each test exists as a **markdown document in the repo** — readable, reviewable, version-controlled — not only as opaque script.
- The chain is **traceable both directions**: from a story you can reach its implementation, its test doc, the running script/CI, and the CD step; from a test you can reach the story it serves.
- When a **story evolves**, the test docs / scripts that depend on it are **flagged as needing review** — drift is surfaced, not silent.
- A test script that has **diverged from its markdown** is caught (the doc and the executable agree).
- The full loop runs end to end: **story → implement → test → CI → CD**, with each link checkable.

## Open Questions

*(The "how" — worked out on the issue.)*

- **The markdown test format:** reuse the template's YAML / dual-judge structure, a per-test markdown doc, or both — and how that maps to an executable script.
- **How linkage is recorded:** front-matter ids, a story ↔ test ↔ script index, a naming convention — what makes traceability reliable, not manual.
- **Drift detection:** how "story changed → test stale" is actually detected (a review gate, a CI check, content hashes/timestamps) and surfaced.
- **Markdown ↔ script binding:** does the markdown *generate* the script, or is the script *reviewed against* it? (transclusion vs audit)
- **What CD means here:** publishing the MCP server / container image — the tail of the loop.
- **Relationship to existing flow:** how this composes with `story → implement` and STORY-002's CI rather than duplicating them.

## Status

- Created: 2026-06-05
- Issues: #21 (flow-design gate)
- Design record: see [#21](https://github.com/dogkeeper886/ai-qa-step-graph/issues/21) — the qa-workflow flow (kept on the issue, not as a drift-prone doc)

### Planned tail (broken out after #21 is reviewed/approved)

The endgame is a **qa-workflow** — a sibling to `dev-workflow` — that writes tests
for this repo from its story or on request, as markdown in the repo, wired to the
existing test-framework-template (`cicd/` dual-judge runner + `.github/workflows`).
Flow first (#21); the rest follow once the design lands:

- Test file + folder structure (realize the format from #21).
- `qw-*` commands + skills (the qa-workflow itself, producer→review paired).
- Binding: port runner test ↔ markdown test file — audit (not codegen), per #21.
- Read `tests/**/*.md` into the pgvector step-store (search + drift).
- Drift detection: story changed → linked test docs surfaced as stale.
- **Eventual outcome (not yet planned):** retire/delete the TestLink/Jira/Confluence
  skills + commands once the in-repo flow replaces what they did.
