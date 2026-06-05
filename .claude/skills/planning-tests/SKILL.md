---
name: planning-tests
description: |
  Creates a complete test plan from a project folder by detecting the ticket
  type, writing test plan sections, reviewing coverage, and publishing to
  Confluence. Use when a QA engineer wants to plan tests, create a test plan,
  write a test plan, or start test planning for a project.
tools:
  - mcp-atlassian:confluence_create_page
  - mcp-atlassian:confluence_get_page
---

# planning-tests

Creates a complete test plan from a project folder by detecting the ticket type, writing sections, and publishing to Confluence.

The skill produces an ISO/IEC/IEEE 29119-3-aligned tree: lean strategy file in `sections/`, plus separate `test_design/` artifacts for scenarios, requirements traceability, and risk. Full layout and rationale in `references/file-layout.md`.

## Progress Checklist

Copy and track your progress:

```
- [ ] Step 1: Validate prerequisites
- [ ] Step 1.5: Visual baseline check (wireframes, live UI, or flag as unverified)
- [ ] Step 2: Detect ticket type and route
- [ ] Step 3: Write test plan to test_plan/ + test_design/
- [ ] Step 4: Review coverage (matrix derivation + diagrams + overlap sweep)
- [ ] Validate: Scenario count + coverage assessment
- [ ] Step 5: Create Confluence test plan pages
- [ ] Validate: Confluence URL + page count
- [ ] Step 6: Review Confluence for content-rendering issues (markdown converter gotchas)
- [ ] Step 7: Review typography (run reviewing-typography skill on every published page)
```

## Steps

### Step 1: Validate Prerequisites

Check that `00_Main_Task_*.md` exists in the current project folder.

If missing: "Please run `/receiving-tickets [TICKET]` first to gather all documentation."

### Step 1.5: UI Baseline Trace (strongly recommended)

Before drafting scenarios, capture the **live UI** of the pages the feature touches — not just the wireframes. Wireframes describe the target state; the live UI shows what already exists, what's hidden by feature flag, and where the wireframes diverge from reality. Drafting from wireframes alone systematically over-specifies (cases for pre-existing behaviors) and miss-specifies (cases for UI elements the wireframe drew but the live app doesn't have, or vice versa).

**Run** `/tw-baseline-trace [TICKET]` to drive Playwright through the affected pages, capture screenshots + accessibility snapshots, and emit a per-page `baseline.md` documenting:

- Current page structure (columns, controls, filters, tabs, wizard steps)
- "Tab vs route" semantics (clicking a tab that changes the URL is a route, not a tab — selection / filter state does not survive across routes)
- Wireframe diff (what the spec adds that's not visible today; what's visible today that the spec didn't draw)
- Authoring guidance (pre-existing behaviors NOT to re-test; feature-flag-gated controls that belong in the flag-gating scenario)

Output lands at `active/<TICKET>/ui_baseline/<YYYY-MM-DD>/`.

**Fallbacks** (in order):

1. If `/tw-baseline-trace` isn't usable (no Playwright session, no test environment access, no live precursor page), check `confluence/visual_references.md` (from `/jr-trace-docs`) for wireframe summaries
2. If neither: review embedded wireframe images in `confluence/HLD_*.md` — and note in the scenario file's intro that no baseline was captured, so reviewers can ask

This step is the single biggest defense against over-specified test plans. A recent project's self-review found roughly half the originally drafted cases were either pre-existing-behavior regression or based on UI misreadings — both visible at trace time, neither caught at draft time. Industry best practice (ISTQB, ISO/IEC 29119) likewise requires examining the actual implementation, not just the spec, during test analysis.

**Environment specifics**: do not record specific tenant names, credentials, or URLs in any test plan file. They belong in `config/`. The baseline.md itself does record tenant + flag state as metadata — that's the artifact's purpose. See `references/environment-rules.md`.

### Step 2: Detect Ticket Type and Route

Run `/tw-plan-init` to detect the ticket type and route to the appropriate planning command:
- **Type A (Feature):** → `/tw-plan-feature`
- **Type B (Bug Fix):** → `/tw-plan-bugfix`
- **Type C (Enhancement):** → `/tw-plan-enhance`

### Step 3: Write Test Plan

Execute the routed planning command from Step 2. It writes:

- `test_plan/README.md` — entry point
- `test_plan/sections/0X_*.md` — strategy file (lean) + supporting numbered sections
- `test_design/scenarios/README.md` — scenario index with Mermaid flow diagrams
- `test_design/scenarios/TS-XX_*.md` — one file per scenario
- `test_design/traceability_matrix.md` — requirement → scenario mapping
- `test_design/risk_register.md` — per-scenario risk

Scenario counts by type:
- Feature: 5-8 scenarios, comprehensive coverage
- Bug Fix: 2-4 scenarios, focused on defect verification + regression
- Enhancement: 4-6 scenarios, hybrid new + regression

Each scenario file follows the uniform metadata header, an optional Scenario Preconditions block, and a `### Case N:` block per case (Objective + Checkpoints mandatory; Preconditions + Notes optional). Click-by-click steps belong in the test cases, not the scenarios — see `references/scenario-conventions.md`.

The strategy file holds only stable content (levels, types, approach, test data, hybrid depth, entry/exit). The legacy "coverage matrix" subsection is no longer authored — derive it from the traceability matrix on demand. See `references/file-layout.md`.

**Migration policy**: new projects use this layout from the start. Already-completed projects keep their original layout — do not migrate retroactively. In-flight projects: opt-in per project, in a single commit.

### Step 4: Review Plan

Run `/tw-plan-review` to analyze coverage and generate gap analysis.

Run `/tw-diagrams` to generate Mermaid flow diagrams for scenarios with 5+ entries (admin flow, end-user flow, etc.). Place under `test_design/scenarios/README.md`.

**Overlap sweep (mandatory before sign-off):**

For each scenario, prompt:

> *List any case in this scenario whose object-under-test or assertion overlaps another scenario's case. Note as: layered (justified) or duplicate (fix).*

Resolutions either get applied immediately or batched for a final sweep before merge. See `references/overlap-review.md` for examples and the layered-vs-duplicate decision rule.

### Validate

Report:
- Total scenario count
- Estimated test case count (sum of per-scenario `**Estimated test cases:** N` headers)
- Overlap sweep result (count of layered + duplicate findings; resolutions taken)
- Coverage assessment: **READY FOR TEST CASES** or **NEEDS REVISION**

### Step 5: Create Confluence Pages

Run `/cf-create-page` to create the test plan hierarchy in Confluence. The Confluence layout mirrors the local file layout as a **3-level tree** under the user-provided parent:

```
[User-provided parent]                                       ← level 0 (already exists)
└── [PROJECT_ID]: Test Plan - <Feature Name>                 ← level 1 (README, the entry point)
    ├── [PROJECT_ID]: 1. Project & Business Context          ← level 2
    ├── [PROJECT_ID]: 2. Feature Definition
    ├── [PROJECT_ID]: 3. Scope & Boundaries
    ├── [PROJECT_ID]: 4. Test Strategy
    ├── [PROJECT_ID]: 5. References & Resources
    ├── [PROJECT_ID]: 6. Document Revision History
    ├── [PROJECT_ID]: Test Scenarios                         ← level 2 (index + Mermaid diagrams)
    │   ├── [PROJECT_ID]: TS-01 - <Scenario Name>            ← level 3
    │   ├── [PROJECT_ID]: TS-02 - <Scenario Name>
    │   └── ...
    ├── [PROJECT_ID]: Requirements Traceability Matrix       ← level 2
    └── [PROJECT_ID]: Risk Register                          ← level 2
```

**Why 3 levels and not flat:** the Test Scenarios index already lists every TS-XX with Mermaid flow diagrams that link to the per-scenario pages. Nesting the TS-XX pages under it (rather than as siblings of sections) keeps level 2 navigable (~9 pages) and makes the diagrams a true table-of-contents instead of decoration. With 5-8 scenarios per Feature project, a flat layout puts 13-16 pages at the same level under the user-provided parent — too noisy for review.

#### Parent-ID assignment (load-bearing)

When calling `mcp-atlassian:confluence_create_page` for each page, pass the correct `parent_id`. The chaining is what produces the 3-level tree:

| Page | `parent_id` to pass |
|------|---------------------|
| README (level 1) | **user-provided parent** |
| All 6 sections (level 2) | **README's just-created page ID** |
| Test Scenarios index (level 2) | README's ID |
| TS-01..TS-NN (level 3) | **Test Scenarios index's just-created page ID** (NOT README, NOT user-provided parent) |
| Traceability Matrix (level 2) | README's ID |
| Risk Register (level 2) | README's ID |

Capture the page ID returned by each `confluence_create_page` call — the next page's `parent_id` depends on the previous response. If a level-2 or level-3 creation lands as a sibling of the user-provided parent, the wrong `parent_id` was passed: stop, delete the misplaced page via `confluence_get_page` + manual delete, and re-create with the correct parent.

#### Page Naming Convention

##### Feature (Type A)

| Source File | Page Title Format |
|-------------|-------------------|
| `README.md` | `[PROJECT_ID]: Test Plan - [Feature Name]` |
| `sections/01_Project_Business_Context.md` | `[PROJECT_ID]: 1. Project & Business Context` |
| `sections/02_Feature_Definition.md` | `[PROJECT_ID]: 2. Feature Definition` |
| `sections/03_Scope_Boundaries.md` | `[PROJECT_ID]: 3. Scope & Boundaries` |
| `sections/04_Test_Strategy.md` | `[PROJECT_ID]: 4. Test Strategy` |
| `sections/05_References_Resources.md` | `[PROJECT_ID]: 5. References & Resources` |
| `sections/06_Revision_History.md` | `[PROJECT_ID]: 6. Document Revision History` |
| `test_design/scenarios/README.md` | `[PROJECT_ID]: Test Scenarios` |
| `test_design/scenarios/TS-XX_*.md` | `[PROJECT_ID]: TS-XX - <Scenario Name>` |
| `test_design/traceability_matrix.md` | `[PROJECT_ID]: Requirements Traceability Matrix` |
| `test_design/risk_register.md` | `[PROJECT_ID]: Risk Register` |

##### Bug Fix (Type B)

| Source File | Page Title Format |
|-------------|-------------------|
| `README.md` | `[PROJECT_ID]: Test Plan - [Bug Description]` |
| `sections/01_Problem_Context.md` | `[PROJECT_ID]: 1. Problem Context` |
| `sections/02_Test_Scope.md` | `[PROJECT_ID]: 2. Test Scope` |
| `sections/03_Test_Strategy.md` | `[PROJECT_ID]: 3. Test Strategy` |
| `sections/04_References_Resources.md` | `[PROJECT_ID]: 4. References & Resources` |
| `sections/05_Revision_History.md` | `[PROJECT_ID]: 5. Document Revision History` |
| `test_design/scenarios/README.md` | `[PROJECT_ID]: Test Scenarios` |
| `test_design/scenarios/TS-XX_*.md` | `[PROJECT_ID]: TS-XX - <Scenario Name>` |
| `test_design/traceability_matrix.md` | `[PROJECT_ID]: Requirements Traceability Matrix` |
| `test_design/risk_register.md` | `[PROJECT_ID]: Risk Register` |

##### Enhancement (Type C)

| Source File | Page Title Format |
|-------------|-------------------|
| `README.md` | `[PROJECT_ID]: Test Plan - [Enhancement Name]` |
| `sections/01_Enhancement_Context.md` | `[PROJECT_ID]: 1. Enhancement Context` |
| `sections/02_Enhancement_Definition.md` | `[PROJECT_ID]: 2. Enhancement Definition` |
| `sections/03_Test_Scope.md` | `[PROJECT_ID]: 3. Test Scope` |
| `sections/04_Test_Strategy.md` | `[PROJECT_ID]: 4. Test Strategy` |
| `sections/05_References_Resources.md` | `[PROJECT_ID]: 5. References & Resources` |
| `sections/06_Revision_History.md` | `[PROJECT_ID]: 6. Document Revision History` |
| `test_design/scenarios/README.md` | `[PROJECT_ID]: Test Scenarios` |
| `test_design/scenarios/TS-XX_*.md` | `[PROJECT_ID]: TS-XX - <Scenario Name>` |
| `test_design/traceability_matrix.md` | `[PROJECT_ID]: Requirements Traceability Matrix` |
| `test_design/risk_register.md` | `[PROJECT_ID]: Risk Register` |

**Creation order** (each step depends on the previous returning a page ID):

1. **README** — `parent_id` = user-provided parent. Capture returned ID as `README_ID`.
2. **Sections in numeric order** (1, 2, 3, ...) — `parent_id` = `README_ID` for each.
3. **Test Scenarios index** (`test_design/scenarios/README.md`) — `parent_id` = `README_ID`. Capture returned ID as `SCENARIOS_ID`.
4. **TS-XX pages in scenario-number order** — `parent_id` = **`SCENARIOS_ID`** for each (this is the level-2 → level-3 nesting; do not use `README_ID` here).
5. **Traceability Matrix** — `parent_id` = `README_ID`.
6. **Risk Register** — `parent_id` = `README_ID`.

Parent page ID for step 1 is provided by the user.

**MCP tool:** `mcp-atlassian:confluence_create_page` with `content_format: "markdown"` for flat content, `"storage"` for pages with nested lists or task lists. The MCP converter handles tables, top-level lists, code blocks, hyperlinks, and Mermaid fences cleanly — but **silently mangles four common patterns**:

1. Bold paragraph + immediately-following list with no blank line → list collapses into the paragraph.
2. 2-space-indented nested lists → flattened to the parent's level (so TS-XX `Checkpoints:` sub-items end up beside `Objective:` instead of below it).
3. Metadata header block (multiple `**Label:**` lines on consecutive newlines) → merged into one paragraph.
4. Task list `- [ ]` → bullet with literal `[ ]` text, not native checkboxes.

**Per-page format decision (apply at create time):**

| Page in this publish | Recommended `content_format` |
|---|---|
| README, Traceability Matrix, Risk Register, Scenarios index | `markdown` |
| Numbered section pages (01..06) — usually flat | `markdown` (but ensure blank line before every list — see gotcha #1) |
| TS-XX scenarios (have nested `Checkpoints:` lists) | `storage` — write `<ul><li><p>Checkpoints:</p><ul>…</ul></li></ul>` directly |
| Test Strategy page if it has Entry/Exit task lists | `storage` — use `<ac:task-list>` macros for native checkboxes |

Full gotcha table, storage-format templates, and the mixed-strategy decision rule live in `commands/confluence/cf-format-guide.md` (Path A gotchas + Path C). The schema enum allows `markdown`, `wiki`, `storage`; despite documentation claims, `html` and `adf` are rejected by the validator.

**Mandatory pre-flight check after publish:** re-fetch every created page with `convert_to_markdown: false` and grep the storage HTML for these patterns before declaring the publish complete. Run `/cf-review-page` against each page. A typical first publish has multiple pages broken in some way; catching it requires re-fetching every page.

#### After creation: record page IDs

Write `test_plan/confluence_pages.md` capturing every page's ID, source-file path, level (0–3), and Confluence URL. Bold the load-bearing handles (`README_ID` and `SCENARIOS_ID`). This file is the contract for future updates: when a source `.md` changes, update the matching Confluence page via `mcp-atlassian:updateConfluencePage` against the recorded ID — never delete-and-recreate, because that breaks inbound links from Jira tickets, Slack messages, etc., and resets page version history.

### Validate

Report:
- Confluence parent page URL (level 1 — the README)
- Number of pages created (should be `1 + N_sections + 1 + N_scenarios + 2`, e.g. `1 + 6 + 1 + 7 + 2 = 17` for a Type A feature with 7 scenarios)
- Path to the `confluence_pages.md` record file

### Step 6: Review Confluence (MANDATORY — gates publish completion)

This step is not optional. Run `/cf-review-page` against every page ID recorded in `confluence_pages.md` and check for the four markdown-converter failure modes documented in Step 5. The four red-flag patterns to search for in each page's raw storage HTML:

| Red flag in storage HTML | Indicates |
|---|---|
| `<p>…<strong>…:</strong>\s*-\s` | Bold-paragraph + immediately-following list collapsed (gotcha #1) |
| `<li><p>\[ \]` or `<li>\[ \]` | Task-list markers un-converted (gotcha #4) |
| `<p>…<strong>Focus:</strong>…<strong>Estimated test cases:</strong>` (or similar bold-label sequence) | Metadata block merged (gotcha #3) |
| `Checkpoints:` `</li>` followed immediately by `<li>(End-user)` or `<li>(Admin)` at the same depth | Nested checkpoints flattened (gotcha #2) |

For each page that fails: call `mcp-atlassian:confluence_update_page` with the same page ID (NEVER delete-and-recreate) using `content_format: "storage"` and explicit HTML for the affected sections. A typical first publish exposes broken pages with all four failure modes. Trust nothing until you've re-fetched.

**MCP tool:** `mcp-atlassian:confluence_get_page` with `convert_to_markdown: false`

**Scope of Step 6 vs Step 7:** Step 6 catches *content-rendering failures* — the markdown converter broke the page; lists collapsed, task lists never converted, metadata fused. Once Step 6 is clean, the content is on the page but it may still read badly. **Step 7 is where the design judgment lives.**

### Step 7: Review Typography (MANDATORY — gates publish completion)

Run the `reviewing-typography` skill against every page ID in `confluence_pages.md`. The skill applies two principles — Gestalt proximity (spacing groups or separates) and visual hierarchy (weight signals importance) — to flag and fix typography problems that templates cannot predict because they depend on the actual content's length and shape.

Typical findings the skill catches that Step 6 cannot:

- Metadata block visually fused with the intro paragraph (proximity collision across zones)
- A 6-sentence paragraph that crosses 3 ideas with no resting point
- 10 different bold inline labels on one page, all competing, none anchoring
- A nested `<li>` block of 8+ items where the parent label is silently doing heading work
- A page with 800 words of body content and no `<h3>` break anywhere

These are **content-shape problems**, not converter problems. They surface only after real prose lands in the templates. See `skills/reviewing-typography/SKILL.md` for the full walk-and-fix procedure and `skills/reviewing-typography/references/typography-principles.md` for the anti-pattern catalog (A1–A6) with storage-format before/after.

## Expected Input

Path to project folder containing `00_Main_Task_*.md` and optional Confluence docs.

## Next Step

After planning tests, run `/designing-cases` to create detailed test cases.

## References

- `references/file-layout.md` — `test_plan/` + `test_design/` + `ui_baseline/` tree, what each artifact holds, dropped sections, migration policy
- `references/scenario-conventions.md` — uniform metadata header, optional Scenario Preconditions block, per-case format (Objective + Checkpoints mandatory; Preconditions + Notes optional), `### Case N:` headings for anchor links, graph-node mapping, cross-link conventions, scenarios index README requirements, **the "don't author regression of pre-existing behavior" rule that uses the UI baseline**. Steps belong in test cases, not scenarios
- `references/api-vs-journey.md` — when to split a journey-shaped TS from an API-contract TS; the longest-path rule; diagram + Scenario Index conventions that follow from the split
- `references/environment-rules.md` — environment specifics out of the plan (tenant names, credentials, URLs go in `config/`, not in `04_Test_Strategy.md`)
- `references/overlap-review.md` — the overlap-review prompt, layered vs duplicate decision rule, graph-staleness check, examples from past reviews
- `references/test-sequencing.md` — state-preserving step order; when sequence is load-bearing at planning time, record the constraint in the case's `**Notes:**` field so the test-case author preserves it
