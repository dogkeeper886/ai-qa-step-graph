# Test Case Verify References

Scan test case files and cross-reference documents for TC count mismatches.

**Usage:** `/tw-case-verify-refs {{input}}`

**Arguments:**
- `{{input}}` - Path to project folder

## Purpose

Detect TC count drift across all documents that reference test case counts. This prevents stale references (e.g., "5 TCs" surviving after a rewrite reduced it to 1 TC) from reaching PRs or Confluence.

## Prerequisites

- Active project directory with `test_cases/` folder
- At least one `TS-XX_*.md` file in `test_cases/` or `test_cases/sections/`

## When to Use

- **After** adding, removing, or rewriting test cases
- **Before** committing test case changes
- **Before** running `/tl-sync` or `/cf-update-page`
- During `/tw-case-review` as an automated sub-check

## Input

The `{{input}}` should be the project path (e.g., `active/PROJ-12345_User_Session_Management`).

If no argument is provided, auto-detect the active project:
1. Check if CWD is inside an `active/` project directory
2. If not, list `active/*/test_cases/` directories and ask the user to pick one
3. STOP if no project found

## Step-by-Step Workflow

### Step 1: Scan Test Case Source Files (Ground Truth)

Find all test case section files. These are the **source of truth** for TC counts.

**File locations (check both patterns):**
- `test_cases/sections/03_TS-XX_*.md` (sections subfolder with `03_` prefix)
- `test_cases/TS-XX_*.md` (flat in test_cases folder)

**For each TS file, count test cases by scanning for TC headers:**
- Pattern: `## TC-XX` (e.g., `## TC-01-CREATE-PRIMARY:`, `## TC-02:`, `## TC-01`)
- Count unique TC numbers per file
- Record: `{scenario_id, scenario_name, file_path, tc_count, tc_range}`
  - `tc_range` = "TC-01 to TC-{N}" format

**Build the ground truth table:**

| Scenario | File | TC Count | TC Range |
|----------|------|----------|----------|
| TS-01 | sections/03_TS-01_FQDN_Input_Validation.md | 8 | TC-01 to TC-08 |
| TS-02 | sections/03_TS-02_Feature_Flag_Behavior.md | 8 | TC-01 to TC-08 |
| ... | ... | ... | ... |
| **Total** | | **49** | |

### Step 2: Scan Reference Documents

Check each of the following documents for TC count references. Not all projects have all files — skip missing ones silently.

#### 2a. `test_cases/README.md`

Look for:
- **Index table rows** like `(8 test cases)` or `TC-01 to TC-08` — extract per-scenario counts
- **Total line** like `**Total Test Cases:** 49` or `| **Total** | **32** |`
- **Summary table** rows with per-scenario case counts

#### 2b. `test_plan/README.md`

Look for:
- **Total coverage line** like `**Total Test Coverage:** 7 Test Suites, 49 Test Cases`
- Any per-scenario counts

#### 2c. Test plan scenario counts — layout-aware

**New layout** (`test_plan/test_design/scenarios/` exists):
- Per-scenario count: read each `TS-XX_*.md` file's `**Estimated test cases:** N` header
- Total: `test_plan/test_design/scenarios/README.md` `**Total:** N estimated test cases.`
- Cross-check: `test_plan/sections/04_Test_Strategy.md` § 4.7 Companion Artifacts trailer line `**Total Test Coverage:** ... N estimated test cases ...`

**Legacy layout** (only `sections/` exists):
- **§ 4.4 Test Scenarios table** — has `Test Cases` column with per-scenario counts
- **Total summary** like `**49 Test Cases**`

#### 2d. `test_cases/testlink_mapping.md`

Look for:
- Per-scenario TC counts in mapping table
- Total count references

#### 2e. `README.md` (project root)

Look for:
- Any TC count or test suite count references

### Step 3: Compare and Report

For each reference document, compare extracted counts against ground truth.

**Output format:**

```
## /tw-case-verify-refs Report

**Project:** {project_path}
**Scan Date:** {date}

### Ground Truth (from test case files)

| Scenario | TC Count | File |
|----------|----------|------|
| TS-01 | 8 | sections/03_TS-01_FQDN_Input_Validation.md |
| ... | ... | ... |
| **Total** | **49** | **7 scenarios** |

### Reference Check Results

| Document | Status | Details |
|----------|--------|---------|
| test_cases/README.md | ✅ MATCH | Total: 49, all scenarios match |
| test_plan/README.md | ❌ MISMATCH | Says 45, should be 49 |
| test_plan/sections/04_Test_Strategy.md | ❌ MISMATCH | TS-05 says 8, should be 11 |
| test_cases/testlink_mapping.md | ⚠️ SKIPPED | File not found |
| README.md | ✅ MATCH | No TC counts referenced |

### Mismatches Found: {count}

{For each mismatch, show:}
#### ❌ {document_path}
- **Line {N}:** Found "{old_text}" — expected "{correct_text}"
- **Suggested fix:** Update to match ground truth

### Summary
- **Status:** {PASS | FAIL}
- **Files checked:** {N}
- **Mismatches:** {N}
```

### Step 4: Offer to Fix

If mismatches are found:

1. Ask user: "Found {N} mismatches. Would you like me to fix them?"
2. If yes, update each reference document to match ground truth
3. After fixing, re-run the scan to confirm all counts match
4. Show a summary of changes made

## Important Notes

- **Never modify test case source files** — only update reference documents
- **Preserve document structure** — only change the count values, not surrounding text
- **Handle missing scenarios gracefully** — some projects skip scenario numbers (e.g., TS-04 and TS-05 may not exist)
- **Count TC headers, not step tables** — a TC may have many steps but counts as 1 test case
- The TC header pattern `## TC-XX` is the canonical marker. Do not count sub-headers like `### Validation` or `### Notes`

## Next Step

After verification passes:
- If publishing to all destinations: run `/tw-case-publish` (includes review + sync + Confluence)
- If preparing to sync only: run `/tl-sync`
- If preparing to update Confluence only: run `/cf-update-page`
- If reviewing quality: run `/tw-case-review`
