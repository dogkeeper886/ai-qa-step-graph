# Create Confluence Page

Create Confluence pages from a test plan folder under parent page {{parent_page_id}}.

Source folder: $ARGUMENTS

This command creates the **3-level tree** that mirrors the local `test_plan/` + `test_design/` layout. See `skills/planning-tests/SKILL.md` § Step 5 for the tree shape and parent-id chaining (load-bearing — getting the chain wrong puts level-3 pages flat under the user-provided parent).

## Instructions

1. **Get parent page info** to find the space ID from page ID {{parent_page_id}} (use `mcp-atlassian:confluence_get_page`).

2. **Read the source folder structure**
   - `test_plan/README.md` → entry-point page
   - `test_plan/sections/` → numbered section files (01_*, 02_*, …)
   - `test_design/scenarios/README.md` → scenarios index (with Mermaid flow diagrams)
   - `test_design/scenarios/TS-XX_*.md` → one file per scenario
   - `test_design/traceability_matrix.md` → RTM
   - `test_design/risk_register.md` → risk register

3. **Extract project ID** from the folder path (e.g., `PROJ-12345` from `PROJ-12345_Feature_Description/`). Use as prefix for every page title.

4. **Create pages in this order** — the order matters; each step depends on the previous returning a page ID. Pick `content_format: "markdown"` or `"storage"` per page based on the patterns it contains (see "Format Notes" below):

   1. **README** (level 1) — `parentId` = {{parent_page_id}}. Capture returned ID as `README_ID`.
   2. **Sections in numeric order** (level 2) — `parentId` = `README_ID`.
   3. **Test Scenarios index** `test_design/scenarios/README.md` (level 2) — `parentId` = `README_ID`. Capture returned ID as `SCENARIOS_ID`.
   4. **TS-XX pages** in scenario-number order (level 3) — `parentId` = **`SCENARIOS_ID`** (NOT `README_ID`).
   5. **Traceability Matrix** (level 2) — `parentId` = `README_ID`.
   6. **Risk Register** (level 2) — `parentId` = `README_ID`.

5. **Record page IDs** to `test_plan/confluence_pages.md` so future updates target the right page rather than re-creating (which would break inbound links from Jira tickets, Slack, etc.). Capture: every page's ID, source-file path, level, and Confluence URL. Bold the load-bearing handles (`README_ID` and `SCENARIOS_ID`).

6. **Report** the parent page URL and the count of pages created (should be `1 + N_sections + 1 + N_scenarios + 2`, e.g. `1 + 6 + 1 + 7 + 2 = 17` for a Type A feature with 7 scenarios).

## Page Naming Convention

### Feature (Type A)

| Source File | Page Title | Level |
|---|---|:-:|
| `test_plan/README.md` | `[PROJECT_ID]: Test Plan - [Feature Name]` | 1 |
| `sections/01_Project_Business_Context.md` | `[PROJECT_ID]: 1. Project & Business Context` | 2 |
| `sections/02_Feature_Definition.md` | `[PROJECT_ID]: 2. Feature Definition` | 2 |
| `sections/03_Scope_Boundaries.md` | `[PROJECT_ID]: 3. Scope & Boundaries` | 2 |
| `sections/04_Test_Strategy.md` | `[PROJECT_ID]: 4. Test Strategy` | 2 |
| `sections/05_References_Resources.md` | `[PROJECT_ID]: 5. References & Resources` | 2 |
| `sections/06_Revision_History.md` | `[PROJECT_ID]: 6. Document Revision History` | 2 |
| `test_design/scenarios/README.md` | `[PROJECT_ID]: Test Scenarios` | 2 |
| `test_design/scenarios/TS-XX_*.md` | `[PROJECT_ID]: TS-XX - <Scenario Name>` | 3 |
| `test_design/traceability_matrix.md` | `[PROJECT_ID]: Requirements Traceability Matrix` | 2 |
| `test_design/risk_register.md` | `[PROJECT_ID]: Risk Register` | 2 |

### Bug Fix (Type B)

| Source File | Page Title | Level |
|---|---|:-:|
| `test_plan/README.md` | `[PROJECT_ID]: Test Plan - [Bug Description]` | 1 |
| `sections/01_Problem_Context.md` | `[PROJECT_ID]: 1. Problem Context` | 2 |
| `sections/02_Test_Scope.md` | `[PROJECT_ID]: 2. Test Scope` | 2 |
| `sections/03_Test_Strategy.md` | `[PROJECT_ID]: 3. Test Strategy` | 2 |
| `sections/04_References_Resources.md` | `[PROJECT_ID]: 4. References & Resources` | 2 |
| `sections/05_Revision_History.md` | `[PROJECT_ID]: 5. Document Revision History` | 2 |
| `test_design/scenarios/README.md` | `[PROJECT_ID]: Test Scenarios` | 2 |
| `test_design/scenarios/TS-XX_*.md` | `[PROJECT_ID]: TS-XX - <Scenario Name>` | 3 |
| `test_design/traceability_matrix.md` | `[PROJECT_ID]: Requirements Traceability Matrix` | 2 |
| `test_design/risk_register.md` | `[PROJECT_ID]: Risk Register` | 2 |

### Enhancement (Type C)

| Source File | Page Title | Level |
|---|---|:-:|
| `test_plan/README.md` | `[PROJECT_ID]: Test Plan - [Enhancement Name]` | 1 |
| `sections/01_Enhancement_Context.md` | `[PROJECT_ID]: 1. Enhancement Context` | 2 |
| `sections/02_Enhancement_Definition.md` | `[PROJECT_ID]: 2. Enhancement Definition` | 2 |
| `sections/03_Test_Scope.md` | `[PROJECT_ID]: 3. Test Scope` | 2 |
| `sections/04_Test_Strategy.md` | `[PROJECT_ID]: 4. Test Strategy` | 2 |
| `sections/05_References_Resources.md` | `[PROJECT_ID]: 5. References & Resources` | 2 |
| `sections/06_Revision_History.md` | `[PROJECT_ID]: 6. Document Revision History` | 2 |
| `test_design/scenarios/README.md` | `[PROJECT_ID]: Test Scenarios` | 2 |
| `test_design/scenarios/TS-XX_*.md` | `[PROJECT_ID]: TS-XX - <Scenario Name>` | 3 |
| `test_design/traceability_matrix.md` | `[PROJECT_ID]: Requirements Traceability Matrix` | 2 |
| `test_design/risk_register.md` | `[PROJECT_ID]: Risk Register` | 2 |

### Legacy projects without `test_design/`

If the project pre-dates the ISO 29119 layout migration, only the `sections/` rows apply. Skip the level-2 scenarios index and level-3 TS-XX rows. The README + section pages still form a valid 2-level tree.

## Format Notes (verified 2026-05-15)

- `content_format: "markdown"` produces clean Confluence storage HTML for **flat, blank-line-separated** content. Tables, top-level lists, code blocks (including ` ```mermaid `), hyperlinks, bold/italic, em-dashes, and arrows all round-trip cleanly. The older `cf-format-guide.md` warning that markdown breaks tables applies to the legacy direct-REST path, NOT the MCP tool.
- **Four markdown patterns DO NOT round-trip cleanly** (failures are silent, the API returns 200 OK):
  1. Bold paragraph + immediately-following list with no blank line → list collapses into the paragraph with hyphens as text.
  2. 2-space-indented nested lists → flattened to the same level as parent.
  3. Metadata block (multiple `**Label:**` lines separated by single newlines) → all merge into one paragraph.
  4. Task list `- [ ]` syntax → bullet items with literal `[ ]` text, NOT native `<ac:task-list>` checkboxes.
- For these patterns, use `content_format: "storage"` for the affected page. Mixing markdown and storage pages within one publish is fine; both formats are accepted on `confluence_create_page` and `confluence_update_page`. See `cf-format-guide.md` § "Path A gotchas" + § 1.3 (nested) + § 1.4 (task lists) + Path C (mixed strategy) for the full decision rule and storage-format templates.
- The schema enum lists only `markdown`, `wiki`, and `storage`; the description claims `html` is supported but the validator rejects it.

## Pre-flight check (mandatory)

After creating any batch of pages, immediately re-fetch each page with `convert_to_markdown: false` and inspect the storage HTML for the four red-flag patterns above before declaring the publish complete. The most efficient pattern is to run `/cf-review-page` against each created page ID, then update any page that failed to render correctly via `confluence_update_page` (re-using the same page ID — never delete-and-recreate). A typical first publish has multiple pages with at least one of the four issues; only catching this by re-fetching prevents shipping a broken page.

## Example Usage

```
/cf-create-page /path/to/active/PROJ-12345_Feature_Description/test_plan
```

Creates a 3-level tree: README → 6 sections + Test Scenarios index + RTM + Risk Register; Test Scenarios index → N TS-XX scenario pages.
