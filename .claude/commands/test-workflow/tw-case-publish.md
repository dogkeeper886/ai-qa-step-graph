# Publish Test Cases

Publish test case changes to all destinations: verify references, review quality, sync to TestLink, and update Confluence.

**Usage:** `/tw-case-publish {{input}}`

**Arguments:**
- `{{input}}` - Path to project folder

## PURPOSE

After rewriting or adding test cases, multiple sync steps are needed. This command orchestrates them in the correct order with fail-fast behavior: fix references → review quality → sync outward.

---

## WORKFLOW

```
/tw-case-publish [project-path]
    │
    ├─► Step 1: Detect Project
    │   - Use provided path or auto-detect active project
    │   - Confirm project has test_cases/ folder
    │   - Locate confluence/confluence_links.md (if exists)
    │   - Locate test_cases/testlink_mapping.md (if exists)
    │
    ├─► Step 2: Verify References (/tw-case-verify-refs)
    │   - Run reference verification against ground truth
    │   - If mismatches found: fix them automatically
    │   - If fix fails: STOP and report — do not proceed
    │
    ├─► Step 3: Review Quality (/tw-case-review)
    │   - Run quality review (profile auto-detected from test plan type)
    │   - If status is READY FOR TESTLINK: proceed
    │   - If status is NEEDS REVISION with "Must Fix" items:
    │     - Show findings and ASK user: "Continue publishing or fix first?"
    │     - If user says fix: STOP — let user address issues
    │     - If user says continue: proceed with warning
    │
    ├─► Step 4: Sync to TestLink (/tl-sync)
    │   - Read testlink_mapping.md to find suite/case mappings
    │   - If no mapping file: SKIP this step (report as skipped)
    │   - For each scenario with a TestLink mapping:
    │     - Sync local test cases to TestLink
    │     - Follow version backup rules from /tl-sync
    │   - Collect sync results (matched, updated, created)
    │
    ├─► Step 5: Update Confluence (if confluence_links.md exists)
    │   - Read confluence_links.md for page ID mappings
    │   - Identify which Confluence pages correspond to test cases
    │   - For each mapped page: update with current content
    │   - If no confluence_links.md: SKIP this step
    │
    └─► Step 6: Summary Report
        - Show unified results across all destinations
```

---

## INPUT

The `{{input}}` should be the project path (e.g., `active/PROJ-12345_User_Session_Management`).

If no argument is provided, auto-detect the active project:
1. Check if CWD is inside an `active/` project directory
2. If not, list `active/*/test_cases/` directories and ask the user to pick one
3. STOP if no project found

---

## STEP DETAILS

### Step 1: Detect Project

1. Resolve the project path
2. Verify `test_cases/` folder exists — STOP if missing
3. Check for `confluence/confluence_links.md` — note if present
4. Check for `test_cases/testlink_mapping.md` — note if present
5. Report what will be published:
   - References: always
   - Review: always
   - TestLink: only if mapping file exists
   - Confluence: only if confluence_links.md exists

### Step 2: Verify References

Run `/tw-case-verify-refs` for the project path.

- If status is PASS: proceed to Step 3
- If mismatches found: auto-fix them (do not ask), then re-verify
- If re-verify still fails: STOP and show the report

### Step 3: Review Quality

Run `/tw-case-review` for the project.

This step acts as a quality gate before publishing to external systems. The review profile is auto-detected from the test plan type (Full / Standard / Focused).

**Gate logic:**

| Review Status | "Must Fix" Items | Action |
|---------------|------------------|--------|
| READY FOR TESTLINK | None | Proceed to Step 4 |
| NEEDS REVISION | Has items | Ask user — continue or fix first? |

- If user chooses to fix: STOP and show the review report
- If user chooses to continue: proceed with a warning banner in the final report
- Priority recommendations from the review are carried forward to Step 4 for TestLink sync

**Note:** The review runs the full `/tw-case-review` workflow. If a recent review was already done in the same session and no test case files changed since then, ask the user: "A review was already done. Skip review step?" to avoid redundant work.

### Step 4: Sync to TestLink

Read `test_cases/testlink_mapping.md` to find TestLink case IDs mapped to local files.

For each mapped scenario:
1. Identify the TestLink test case ID and local file
2. Run the `/tl-sync` workflow (compare → update/create)
3. Follow the version backup rule: prompt user before updating existing cases
4. Apply priority recommendations from Step 3 review (if available)
5. Collect results per scenario

If no mapping file exists, report:
```
⏭️ TestLink sync skipped — no testlink_mapping.md found
```

### Step 5: Update Confluence

Read `confluence/confluence_links.md` to find page IDs.

For test case related pages:
1. Identify which pages map to test case content
2. Read the current local content that should be published
3. Update each Confluence page via `mcp__mcp-atlassian__confluence_update_page`
4. Use version_comment: "Published via /tw-case-publish"

If no confluence_links.md exists, report:
```
⏭️ Confluence update skipped — no confluence_links.md found
```

### Step 6: Summary Report

```
## /tw-case-publish Report

**Project:** {project_path}
**Published:** {date}

### Step Results

| Step | Status | Details |
|------|--------|---------|
| Verify References | ✅ PASS | {N} files checked, all match |
| Quality Review | ✅ READY | {quality_score}, {N} issues |
| TestLink Sync | ✅ DONE | {matched} matched, {updated} updated, {created} created |
| Confluence Update | ✅ DONE | {N} pages updated |

### Review Findings (if any)
- **Quality Score:** {Good / Fair / Needs Work}
- **"Must Fix" items:** {count} (0 = clean publish)
- **"Should Fix" items:** {count}
- **Priority recommendations applied:** {yes/no}

### TestLink Details
- **Matched (no change):** {list}
- **Updated:** {list with what changed}
- **Created:** {list with new IDs}

### Confluence Details
- **Pages updated:** {list with page titles}

### Summary
✅ All destinations synchronized successfully
```

If the review had "Must Fix" items and the user chose to continue anyway:
```
⚠️ Published with review warnings — {N} "Must Fix" items were not addressed
```

---

## EXAMPLE

```bash
/tw-case-publish active/PROJ-12345_User_Session_Management
```

**Typical output:**
```
Step 1: Project detected — PROJ-12345_User_Session_Management
        TestLink mapping: found (9 suites, 32 TCs)
        Confluence links: found (1 page)

Step 2: References verified — ✅ PASS (5 files checked)

Step 3: Quality review — ✅ READY FOR TESTLINK
        Quality Score: Good
        1 "Should Fix" item (vague expected result in TS-03 TC-02)
        Priority recommendations: 8 P0, 15 P1, 9 P2

Step 4: TestLink sync...
        Please create a new version for PROJ-54321 before I update it.
        [user confirms]
        TS-01: 4 matched, 0 updated, 0 created
        TS-02: 3 matched, 1 updated, 0 created
        ...

Step 5: Confluence updated — 1 page (HLD - User Session Management)

Step 6: ✅ All destinations synchronized
```

---

## WORKFLOW POSITION

```
/tw-case-init → /tw-case-[feature|bugfix|enhance]
    └── Creates test_cases/README.md + TS-XX_*.md files
                              ↓
              ┌───────────────────────────────────┐
              │  /tw-case-publish  ◄── YOU        │
              │                                   │
              │  1. /tw-case-verify-refs (auto)   │
              │  2. /tw-case-review (quality gate) │
              │  3. /tl-sync (TestLink)           │
              │  4. /cf-update-page (Confluence)  │
              └───────────────────────────────────┘
                              ↓
              Published to TestLink + Confluence
```

---

## NOTES

- Steps 4 and 5 are conditional — they only run if mapping files exist
- The command never modifies test case source files — it only verifies, reviews, and publishes outward
- Version backup prompts from `/tl-sync` are preserved — user confirmation required
- If any step fails, subsequent steps are skipped and the failure is reported
- This command can be re-run safely — matched cases are skipped automatically
- To skip the review step (e.g., already reviewed), user can say "skip review" when prompted
