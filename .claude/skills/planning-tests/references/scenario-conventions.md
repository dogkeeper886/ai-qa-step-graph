# Scenario File Conventions

Every `test_design/scenarios/TS-XX_*.md` file follows the same metadata header, an optional scenario-level Preconditions block, and a uniform per-case format.

Scenarios are **planning artifacts**, not execution artifacts. They state *what* each case proves and *what* should be observable — not *how* to perform it. Click-by-click steps belong in the test cases (`test_cases/TS-XX/TC-NN_*.md`), authored later via the `designing-cases` skill.

## Uniform metadata header

Mandatory at the top of every scenario file:

```markdown
# TS-XX: <name>

**Focus:** <GUI / API / E2E / Config / hybrid>
**Estimated test cases:** N
**Test plan reference:** [`test_plan/sections/04_Test_Strategy.md`](../../sections/04_Test_Strategy.md)

<intro paragraph — what this scenario owns, what it does not, key cross-references>

## Scenario Preconditions   ← optional, see below

- <setup that applies to every case>

## Test Cases

### Case 1: <Short imperative title>

- **Objective:** ...
- **Checkpoints:**
  - ...

### Case 2: ...
```

### Header fields

- **Focus** — one of `GUI`, `API`, `E2E`, `Config`, or a hybrid (`Admin GUI + End-user E2E`). Pick the dominant verification surface; this drives reviewer expectations.
- **Estimated test cases** — integer. The number that ends up in TestLink. Update on every revision.
- **Test plan reference** — link to the strategy file. Numeric prefix may be `04` (Types A and C) or `03` (Type B). The link uses the cross-link convention below.

### Intro paragraph

A paragraph directly under the header describing what the scenario owns, what it explicitly does not, and the key cross-references to other scenarios. This is where scope is pinned. Keep it tight — most intros run 2–5 sentences.

## Scenario Preconditions (optional)

Setup that applies to **every case** in the scenario. Use this block when scenarios share non-trivial preconditions (feature flag state, device availability, pre-configured fixtures, test-data fixtures). Cases may add **case-specific** preconditions on top via their own `**Preconditions:**` field.

```markdown
## Scenario Preconditions

- Feature flag `<name>` is ON
- Parent fixture already configured per TS-01
- A real client device available to exercise the end-user flow
```

Skip the block entirely when the scenario has no shared precondition worth stating up-front. Don't pad with obvious things ("user logged in to admin UI").

## Per-case format

Every case is its own `### Case N: <Title>` block. Title is a short imperative phrase that summarizes the case; detail lives in the body.

Mandatory fields:

- **`**Objective:**`** — one sentence describing what the case proves. Forces clarity. If you can't write it in one sentence, the case is doing too much — split it.
- **`**Checkpoints:**`** — unordered list (`-`) of the observable assertions. Each checkpoint is something a reviewer or test-case author can verify by reading the UI / response / artifact.

Optional fields (omit when not needed):

- **`**Preconditions:**`** — case-specific setup that differs from scenario-level preconditions. Do not repeat scenario-wide preconditions here.
- **`**Notes:**`** — design-spec-silent flags, ticket cross-references, observability hints, edge-case caveats, sequencing hints. Anything that helps the test-case author or reviewer but isn't an assertion.

### Example

```markdown
### Case 6: Disable optional sub-section while content is present

- **Objective:** capture how the UI handles `optionalSection.enabled=false`
  when rich-text content has already been saved (defensive contract).
- **Preconditions:** profile has the optional section's rich-text body + at
  least one child entry, saved.
- **Checkpoints:**
  - Hidden rich-text body either persists or is cleared — capture which
  - End user on next page load does not see the optional checkbox
- **Notes:** Design spec silent on persistence behavior — flag observation
  for follow-up ticket.
```

### What does NOT go in a scenario case

- **Click-by-click steps** — author these later in the test case file via `designing-cases`. The scenario's Objective + Checkpoints give the test-case author enough to derive the steps.
- **Specific selectors, button IDs, API request bodies** — these are execution detail.
- **Test data values** — except where the value is part of the assertion (e.g., a priority-resolution rule uses specific input combinations to prove the rule).
- **Pass/fail wording** — checkpoints describe the observable; whether it's a pass or fail is the test-case author's call.

### Title style

- Short imperative phrase ("Disable optional section while content is present", not "When the user disables the optional section and there is content saved on it").
- One title per case — don't bundle two objectives behind a slash.
- Avoid generic titles ("Happy path", "Validation"). Be specific about which path or which validation.

### Heading level

Use `### Case N:` (H3) — not bold bullets. H3 gives every case a stable anchor for cross-linking from the traceability matrix and from other scenarios (e.g., `[TS-04 case 2](TS-04_Identity_Mapping.md#case-2-no-identity-assigned)`).

## Don't author regression of pre-existing behavior

Before authoring a case, cross-check it against the UI baseline at `<project_root>/ui_baseline/<YYYY-MM-DD>/baseline.md` (captured via `/tw-baseline-trace`).

Three buckets for each candidate case:

| Bucket | What it means | What to do |
|---|---|---|
| **Pre-existing behavior in the baseline** | A control / column / interaction visible today that this feature does not modify (typical examples: column sorting on list pages, free-text search in toolbars, navigation between unrelated routes presented as "tabs", wizard back-button, list-page filter widgets, etc.) | **Do not author the case.** The existing regression suite owns this. |
| **Feature-flag-gated control in the baseline** | A control the design spec adds but the live UI hides under flag OFF (typical: new field on an existing page, new section in the side panel) | Author it in the flag-gating scenario, not in a per-feature scenario. |
| **New behavior, not in the baseline** | A genuinely new column / field / page / interaction the feature introduces | Author the case — this is real coverage. |

When no baseline exists (e.g., bug fix on a page where the trace was skipped), the rule degrades to: do not draft cases for behaviors a reviewer would recognize as standard list-page or wizard behavior (sort, search, pagination, filter widgets, route navigation). Note the missing baseline in the scenario's intro so reviewers can ask.

### "Tab vs route" trap

The baseline's tab-vs-route check is load-bearing. Many web apps present two related routes as a tablist (e.g., a "Users" tab next to a "Roles" tab, where clicking switches `/admin/users` ↔ `/admin/roles`). These look like tabs but share no state — clicking switches the URL, the filters / selection / scroll position do not survive the switch and were never designed to.

If a candidate case asserts "switching between these tabs preserves filter / selection / state" → **drop the case.** The behavior the case is claiming doesn't exist and isn't a bug. The baseline catches this at draft time; otherwise it surfaces only in execution as a confused failure.

### Why this rule exists

A recent project's self-review (after the live UI trace landed mid-planning) found that roughly half of the originally drafted cases fell into the "pre-existing behavior" bucket or the "tab vs route" trap. Both were invisible at draft time when working from spec + wireframes alone. Both were obvious at trace time. Capturing the baseline first prevents the wasted work of authoring those cases and then trimming them during review.

## Graph-node mapping

Every case in a scenario file must be traceable to one or more nodes in the Mermaid flow diagrams under `test_design/scenarios/README.md`. Reason about graph nodes *before* writing prose; the prose follows from the node mapping, not the other way around.

When you write or revise a scenario, ask:

- Which graph node(s) does each case touch?
- Is any case touching multiple distinct nodes? → likely needs a split.
- Are multiple cases in this scenario touching the same node from the same angle? → likely needs a merge.
- Is any case's primary observation about a node *owned by another scenario*? → misplacement; move the assertion to the owning scenario.

### Smells the graph-node check catches

These were actual mistakes from past plan reviews. Each was invisible at the prose level, obvious at the graph level:

- **Phantom case** — a one-line observation set as its own case but actually a side-observation made while another case is running. Example: "warning copy is displayed inline inside sub-dialog" listed as case 4 of TS-01, when it's observed *while* case 2 has the sub-dialog open. Fold into case 2.
- **Misplaced assertion** — a case mentioning an observation outside its primary graph node. Example: "switching from Mode A → Mode B ... warning copy displayed in Mode A" — the warning is observable while you're IN Mode A, not while switching away. Move to the Mode-A setup case.
- **Stale node ownership** — a graph node still labeled with its old TS-XX after scope ownership moved between scenarios. Example: "Inline error / no state change / TS-03" after gating ownership moved to TS-04. The diagram must be updated as part of the scope change.

When merging or splitting cases, write down the graph-node coverage for each candidate shape *first*. If two candidate cases map to the same node from the same angle, merge. If one candidate case maps to two unrelated nodes, split.

## Cross-link conventions

`test_design/` is nested **inside** `test_plan/` (sibling of `sections/`). Cross-links assume that layout:

| From | To | Path |
|---|---|---|
| `test_plan/sections/04_*.md` | `test_design/scenarios/` etc. | `../test_design/...` |
| `test_design/scenarios/TS-*.md` | strategy file | `../../sections/04_*.md` |
| Within `test_design/` (e.g., `traceability_matrix.md` ↔ a scenario) | sibling | `scenarios/TS-XX_*.md` |
| Scenario case → another scenario's case | sibling + anchor | `TS-XX_*.md#case-N-title-slug` |
| Scenario file → live baseline screenshot | repo top-level | `../../../ui_baseline/<date>/screenshots/<file>.png` |

When a scenario references a design-spec page or wireframe image, prefer linking to the local `confluence/hld_images/<file>.png` capture (or equivalent) over a remote URL — local references survive remote reorganization.

## Scenarios index README

`test_design/scenarios/README.md` is the directory's table of contents. It must:

- List every TS-XX with `[name]` link, focus, and estimated case count
- Total estimated case count (sum of all rows)
- Mermaid flow diagrams for at least the admin flow and the end-user flow (or whichever flow groupings make sense for the feature)
- Each Mermaid node labeled with the TS-XX it belongs to

The Mermaid diagrams document the implicit graph that the scenarios traverse. Reviewers use them to spot uncovered nodes (gaps) and shared edges (overlaps).

## Why no Steps

Scenarios and test cases are the two halves of a deliberate two-phase split:

| | Scenario (planning) | Test case (design) |
|---|---|---|
| Owns | Objective + observable assertions | Click-by-click execution |
| Abstraction | What proves the behavior | How to drive the UI / API |
| Authored by | `planning-tests` skill | `designing-cases` skill |
| Lives in | `test_plan/test_design/scenarios/TS-XX_*.md` | `test_cases/TS-XX/TC-NN_*.md` |

Putting steps in the scenario duplicates the test case and makes the scenario stale the first time a UI selector changes. Keep the scenario abstract; let the test case bind to the UI.

If execution **sequence** matters at planning time (e.g., "destructive operation must run last to preserve test-data state across earlier observations"), record that constraint in the case's `**Notes:**` field so the test-case author preserves the order. The full sequence still lives in the test case, not here. See `test-sequencing.md` for the canonical examples.
