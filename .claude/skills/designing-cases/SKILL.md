---
name: designing-cases
description: |
  Writes detailed test cases from a test plan, reviews quality, and publishes
  a test case page to Confluence. Use when a QA engineer wants to design cases,
  create test cases, write test cases, or expand test scenarios into detailed
  steps.
tools:
  - mcp-atlassian:confluence_create_page
  - mcp-atlassian:confluence_get_page
---

# designing-cases

Writes detailed test cases from a test plan, reviews quality, and publishes to Confluence.

## Progress Checklist

Copy and track your progress:

```
- [ ] Step 1: Validate prerequisites
- [ ] Step 1.5: Verify visual baseline (screenshots, live UI, or flag as unverified)
- [ ] Step 2: Detect plan type and route
- [ ] Step 3: Write test cases per type
- [ ] Step 4: Review quality
- [ ] Validate: Scenario count + case count + quality assessment
- [ ] Step 5: Create Confluence test case pages
- [ ] Validate: Confluence URL + page count
- [ ] Step 6: Review typography (run reviewing-typography skill on every published page)
```

## Steps

### Step 1: Validate Prerequisites

Check that `test_plan/README.md` exists and `test_plan/sections/` contains section files.

If missing: "Please run `/planning-tests` first to create the test plan."

### Step 1.5: Verify Visual Baseline

Before writing test cases, confirm the UI has been visually verified:

1. Check if `test_plan/visual_baseline/` exists with screenshots from planning phase
   - If yes: use these as reference for field labels, element names, and UI states
2. If no visual baseline exists, ask the user: "Can I open the browser to verify the UI before writing test cases?"
   - If yes: open browser, navigate to the feature, capture key states
   - Compare against HLD wireframes — note any discrepancies
3. If neither available: flag in test case output: "Field labels not verified against live UI"

**Why:** Test cases with wrong field labels or UI element names cause execution failures and rework. Verifying once before writing prevents errors across all test cases.

### Step 2: Detect Plan Type and Route

Run `/tw-case-init` to read the test plan, detect the type, and route to the appropriate command:
- **Type A (Feature):** → `/tw-case-feature` — expect 20-40 cases
- **Type B (Bug Fix):** → `/tw-case-bugfix` — expect 8-15 cases
- **Type C (Enhancement):** → `/tw-case-enhance` — expect 15-25 cases

### Step 3: Write Test Cases

Execute the routed case command from Step 2. It creates `test_cases/README.md` and one `TS-XX_[Name].md` file per scenario.

Each test case needs: Objective, Preconditions, Test Steps table, Execution Type.

### Step 4: Review Quality

Run `/tw-case-review` to check all test cases for:
- Specific (not vague) actions and expected results
- Complete preconditions
- 3-10 steps per test case
- Test independence (can run standalone)
- Navigation step strategy — setup navigation in preconditions, not repeated steps

### Validate

Report:
- Total scenario count
- Total test case count
- Quality assessment: **READY FOR TESTLINK** or **NEEDS REVISION**

### Step 5: Create Confluence Pages

Run `/cf-create-page` to create test case pages in Confluence.

#### Page Naming Convention

| Source File | Page Title Format |
|-------------|-------------------|
| `README.md` | `[PROJECT_ID]: Test Cases - [Feature Name]` |
| `TS-01_*.md` | `[PROJECT_ID]: TS-01 - [Scenario Name]` |
| `TS-02_*.md` | `[PROJECT_ID]: TS-02 - [Scenario Name]` |

Create parent page first, then child pages for each TS-XX scenario.

Run `/cf-review-page` to verify formatting. Use `/cf-format-guide` for Confluence storage format reference.

**MCP tool:** `mcp-atlassian:confluence_create_page`

### Validate

Report:
- Confluence parent page URL
- Number of pages created

### Step 6: Review Typography (MANDATORY — gates publish completion)

After Step 5 content-rendering is clean, run the `reviewing-typography` skill against every page just published. The skill applies Gestalt proximity and visual hierarchy principles to the **actual rendered content** — catching wall-of-text test cases, bold-label inflation across many cases on one page, and proximity collisions between case sections that no template could predict because they depend on the test cases' length and density.

See `skills/reviewing-typography/SKILL.md` for the walk-and-fix procedure. Pass it the list of page IDs created in Step 5.

### Validate

Report:
- Typography review verdict: N pages CLEAN, N pages had findings + fixes applied

## Expected Input

Path to project folder containing `test_plan/README.md` and `test_plan/sections/`.

## Next Step

After designing cases:
- Run `/tw-case-publish` to verify, review, and sync to all destinations (TestLink + Confluence) in one step
- Or run `/syncing-testlink` directly to import test cases to TestLink only
