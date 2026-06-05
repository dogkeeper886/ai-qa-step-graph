# Test Case Review

Review test cases for quality and completeness before TestLink sync.

## Purpose

Analyze test case files to:
1. Verify test case quality (clear steps, measurable results)
2. Check completeness (all scenarios covered, no gaps)
3. Identify issues early before TestLink sync
4. Recommend priorities for TestLink sync
5. Ensure test cases are ready for execution

## Prerequisites

- `test_cases/README.md` exists (created by `/tw-case-*` commands)
- `test_cases/TS-XX_*.md` files exist for each scenario
- `test_plan/README.md` and `test_plan/sections/` exist (for comparison)

**If test cases are missing:**
```
Ask user: "Please run /tw-case-init first to create test cases."
STOP - Cannot proceed without test case files
```

## When to Use

- **After** running `/tw-case-feature`, `/tw-case-bugfix`, or `/tw-case-enhance`
- **Before** running `/tl-sync`
- When updating existing test cases
- Before test execution begins

## Review Profiles

The review depth is **auto-detected** from the test plan type. The user can override by specifying a profile explicitly.

| Check | Feature (Full) | Enhancement (Standard) | Bug Fix (Focused) |
|-------|:-:|:-:|:-:|
| Core Quality (3.1-3.7) | Yes | Yes | Yes |
| Sanitization (3.9) | Yes | Yes | Yes |
| Completeness (Step 4) | Yes | Yes | Yes |
| Consistency (Step 5) | Yes | Yes | Yes |
| Priority Recommendation (Step 7) | Yes | Yes | Yes |
| Requirements Traceability (Step 6) | Yes | Yes | Skip |
| Test Data Adequacy (3.10) | Full | Lite | Skip |
| Cleanup/Postconditions (3.11) | Yes | Skip | Skip |
| Boundary Value Analysis (3.12) | Yes | Skip | Skip |

## Agent Instructions

### Step 1: Read Test Plan and Detect Profile

Read the test plan for comparison baseline and determine review profile:

```
1. Read test_plan/README.md for type and quick reference counts
2. Read scenarios — layout-aware:
   IF test_plan/test_design/scenarios/ exists (NEW LAYOUT):
     - Read each test_plan/test_design/scenarios/TS-XX_*.md file
     - Each file's `**Estimated test cases:** N`, optional `## Scenario Preconditions` block, and `### Case N:` blocks (Objective + Checkpoints + optional Preconditions + optional Notes) are the source of truth
   ELSE (LEGACY LAYOUT):
     - Feature: test_plan/sections/04_Test_Strategy.md § 4.4
     - Bug Fix: test_plan/sections/03_Test_Strategy.md § 3.2
     - Enhancement: test_plan/sections/04_Test_Strategy.md § 4.2
3. Reference coverage matrix from /tw-plan-review (if available)
4. Detect review profile from test plan type:
   - "New Feature Validation" → Full profile (expect 20-40 test cases)
   - "Bug Fix Validation" → Focused profile (expect 8-15 test cases)
   - "Enhancement Validation" → Standard profile (expect 15-25 test cases)
5. Announce detected profile: "Review profile: [Full/Standard/Focused]"
```

> **Fallback:** If `test_plan/sections/` does not exist, read `test_plan/README.md` directly.

### Step 2: Read All Test Case Files

```
1. Read test_cases/README.md
   - Extract scenario index
   - Note total test case count
   - Check default assumptions section

2. Read each `test_cases/TS-XX_*.md` file
   - Count test cases per scenario
   - Extract test case names and objectives
   - Note preconditions, steps, and expected results
```

### Step 3: Quality Checks [All Profiles]

For each test case, verify the following quality criteria:

#### 3.1 Clear Objective
- [ ] Objective states WHAT is being validated
- [ ] Objective is specific, not vague
- [ ] Objective matches the test steps

**Good:** "Verify that entering a name shorter than 2 characters displays validation error"
**Bad:** "Test name validation"

#### 3.2 Complete Preconditions
- [ ] All required setup is listed
- [ ] No missing dependencies
- [ ] Preconditions use same terminology as test steps
- [ ] No items referenced in steps that aren't set up

**Good:** "User Group 'Test-Group-A' exists with 2 members assigned"
**Bad:** "User Group configured"

#### 3.3 Specific Actions
- [ ] Actions use exact values, not placeholders
- [ ] Actions specify which element to interact with
- [ ] Actions are atomic (one action per step)

**Good:** "Enter 'test@example.com' in the Email field"
**Bad:** "Enter data in the field"

#### 3.4 Measurable Expected Results
- [ ] Expected results are observable and verifiable
- [ ] Expected results include specific text/values where applicable
- [ ] Expected results describe the outcome, not the action

**Good:** "Error message displays: 'Email format is invalid'"
**Bad:** "Verify error handling works"

#### 3.5 Appropriate Step Count
- [ ] 3-10 steps is typical for most test cases
- [ ] Flag test cases with >15 steps for potential splitting
- [ ] Flag test cases with <3 steps as potentially incomplete

#### 3.6 Test Independence
- [ ] Test can run standalone without prior tests
- [ ] All required data state and capabilities are in preconditions
- [ ] No reliance on state from other test cases

#### 3.7 Preconditions vs. Test Steps — split rule

Preconditions describe **system state**; test steps describe **UI state** and actions. Flag any precondition that asserts UI state.

- [ ] No precondition mentions a specific page, dialog, panel, or wizard step the executor must already be in (e.g., "Admin on X page", "Sub-section panel open")
- [ ] Page navigation appears as Step 1 (or wherever it logically lands in the flow), not in preconditions
- [ ] Combine navigation + the initial action into one step where natural ("Go to X, click Y")
- [ ] No intermediate page verifications (no "Step 2: Verify the portal list loaded" — the expected-result column of the navigation step covers that)
- [ ] Use page names in steps, not URLs or routes
- [ ] When multiple TCs share the same navigation path, the navigation is repeated at the top of each — independence over DRY

Common violations to flag during review:
- ❌ "Admin on Settings → Resources → Profiles page" (precondition)
- ❌ "Admin in the Edit view of the portal with the Sub-section panel open" (precondition)
- ❌ "On the submission form, ready to submit" (precondition)
- ✅ "There is an existing portal `tc-fixture-A` with the X matrix configured" (precondition — system state)
- ✅ "Step 1: Navigate to Settings → Resources → Profiles. Click `tc-fixture-A` and click Configure. Open the Sub-section panel." (step — UI state + action)

#### 3.8 No Internal Labels
- [ ] Phase headers do not contain test plan mapping labels (e.g., `D1`, `D2`, `S2`)
- [ ] Step tables do not embed study/plan reference codes
- [ ] Phase names are self-descriptive (e.g., "Before Start Date", "After Deactivation") without requiring a label key lookup

**Good:** `## Phase: Before Start Date`
**Bad:** `## D1: Before Start Date`

#### 3.9 Sanitization [All Profiles]

Verify test cases are free of environment-specific identifiers:

- [ ] No hardcoded tenant names — use generic placeholders (e.g., "TestTenant-A")
- [ ] No real credentials or passwords — use placeholders like `<password>`
- [ ] No real IP addresses — use example ranges like `10.x.x.x` or `192.168.x.x`
- [ ] No real user email addresses — use generic addresses like `testuser@example.com`
- [ ] No RBAC scope lines unless the scenario specifically tests RBAC

#### 3.10 Test Data Adequacy [Full / Standard-Lite]
- [ ] Test data values are realistic, not arbitrary placeholders
- [ ] Different test cases use distinct data to avoid masking bugs
- [ ] Data covers representative types (strings, numbers, special characters where relevant)
- **Full only:**
  - [ ] Boundary values use actual system limits (not round numbers)
  - [ ] Negative test data is included (empty, null, overflow)

#### 3.11 Cleanup/Postconditions [Full only]
- [ ] Tests that create data document whether cleanup is needed
- [ ] Tests that modify shared state note postconditions
- [ ] No test leaves the system in a state that blocks other tests

#### 3.12 Boundary Value Analysis [Full only]
- [ ] Boundary conditions tested at exact limits (min, min+1, max-1, max)
- [ ] Off-by-one scenarios are covered
- [ ] Empty and maximum states are tested where applicable

### Step 4: Completeness Check [All Profiles]

Compare test cases against test plan:

```
1. Count test cases per scenario
2. Compare against test plan estimates
3. Flag scenarios with significantly fewer test cases than expected
4. Check for missing:
   - Error handling tests
   - Edge case tests
   - Boundary condition tests
```

### Step 5: Consistency Check [All Profiles]

Verify consistency across test cases:

```
1. Terminology consistency
   - Same names used throughout (not "Group A" vs "Original-Group")
   - Same navigation paths described consistently

2. Format consistency
   - All files use same structure
   - All test cases have required sections
   - Summary tables are complete

3. Cross-reference accuracy
   - TC counts in README.md match actual files
   - Scenario references are correct
```

### Step 6: Requirements Traceability [Full / Standard]

Verify test case to requirement mapping:

```
1. List all requirements/acceptance criteria from:
   - test_plan/sections/ (scope and strategy sections)
   - confluence/HLD_*.md files in the project folder (if they exist)
   - If no HLD files exist, skip HLD and use test plan sections only

2. For each requirement, verify at least one test case covers it

3. Flag requirements with no test case coverage

4. Flag test cases that don't trace to any requirement
   (orphaned tests may indicate scope creep or missing requirements)
```

> **Skip for Focused (Bug Fix):** Bug fix test cases trace to the defect, not to requirements.

### Step 7: Priority Recommendation [All Profiles]

Analyze each test case and recommend a priority for TestLink sync. Priority and execution type are **not stored in markdown files** — they are managed in TestLink. This step produces recommendations to guide `/tl-sync`.

**Priority criteria:**

| Priority | Criteria |
|----------|----------|
| **P0 (Critical)** | Core happy path, primary defect verification (bug fix), feature must-work scenarios |
| **P1 (High)** | Important variations, common user paths, integration points, regression of related features |
| **P2 (Medium)** | Edge cases, boundary conditions, uncommon configurations, nice-to-have coverage |

**Decision tree:**

```
For each test case:
1. Read the objective and steps
2. Apply priority decision tree:

   IF test case is the first/only TC for a scenario's primary flow
     → P0 (Critical)
   ELSE IF test case verifies the primary defect (bug fix projects)
     → P0 (Critical)
   ELSE IF test case tests a variation, alternate input, or integration point
     → P1 (High)
   ELSE IF test case tests regression of a related feature
     → P1 (High)
   ELSE IF test case tests edge case, boundary, or rare configuration
     → P2 (Medium)
   ELSE IF test case tests error handling for uncommon scenarios
     → P2 (Medium)

3. Check distribution — a healthy project has roughly:
   - P0: 20-30% (must-pass for release)
   - P1: 40-50% (should-pass)
   - P2: 20-30% (nice-to-pass)
4. Flag if distribution is skewed (e.g., >50% P0 suggests inflation)
```

### Step 8: Generate Review Report

Create the review report with findings.

---

## Output Format

```markdown
# Test Case Review: [Feature Name]

## Summary

| Metric | Value |
|--------|-------|
| Review Profile | Full / Standard / Focused |
| Test Scenarios | X (Expected: Y) |
| Test Cases | Z |
| Quality Score | Good / Fair / Needs Work |
| TestLink Readiness | Ready / Needs Revision |

## Quality Issues

### Vague Actions

| File | TC | Step | Issue | Suggested Fix |
|------|-----|------|-------|---------------|
| TS-01 | TC-02 | 3 | "Enter data" | Specify exact value to enter |
| TS-02 | TC-01 | 5 | "Configure settings" | List specific settings to configure |

### Vague Expected Results

| File | TC | Step | Issue | Suggested Fix |
|------|-----|------|-------|---------------|
| TS-01 | TC-03 | 4 | "Verify success" | Specify expected message or state |
| TS-03 | TC-02 | 7 | "Page updates" | Describe what should appear/change |

### Missing Preconditions

| File | TC | Issue |
|------|-----|-------|
| TS-01 | TC-03 | Step 2 uses "Group-A" but not defined in preconditions |
| TS-02 | TC-04 | References "admin user" but preconditions say "test user" |

### Long Test Cases (>10 steps)

| File | TC | Steps | Recommendation |
|------|-----|-------|----------------|
| TS-03 | TC-02 | 18 | Split into "Setup" and "Validation" test cases |
| TS-04 | TC-05 | 15 | Consider breaking at step 8 (natural division point) |

### Terminology Inconsistencies

| Issue | Locations | Recommendation |
|-------|-----------|----------------|
| "Group A" vs "Original-Group" | TS-01 TC-02, TS-03 TC-01 | Standardize to "Original-Group" |
| "Save button" vs "Save Changes" | TS-02 TC-03, TS-02 TC-04 | Use exact UI label |

### Sanitization Issues

| File | TC | Issue | Fix |
|------|-----|-------|-----|
| TS-01 | TC-01 | Hardcoded tenant "Acme Corp" | Replace with "TestTenant-A" |
| TS-03 | TC-02 | Real IP 172.16.0.1 | Replace with 10.x.x.x range |

## Completeness Check

| Scenario | Expected TCs | Actual TCs | Status | Notes |
|----------|--------------|------------|--------|-------|
| TS-01 | 5-6 | 5 | OK | |
| TS-02 | 4-5 | 2 | **Missing** | Need error handling tests |
| TS-03 | 3-4 | 4 | OK | |
| TS-04 | 4-5 | 3 | **Missing** | Missing edge cases |

### Missing Test Coverage

| Scenario | Missing Coverage | Recommendation |
|----------|------------------|----------------|
| TS-02 | Error handling for invalid input | Add TC for invalid email format |
| TS-04 | Boundary: maximum name length | Add TC for 64-character name |

## Requirements Traceability [Full / Standard only]

| Requirement | Source | Covered By | Status |
|-------------|--------|------------|--------|
| Users can create networks | confluence/HLD_*.md § 3.1 | TS-01 TC-01, TC-02 | Covered |
| Invalid input shows error | confluence/HLD_*.md § 3.4 | — | **Not covered** |
| Backward compat with v2 API | test_plan/sections/03_Scope_Boundaries.md § 3.1 | TS-04 TC-01 | Covered |

## Priority Recommendation

Recommended priorities for `/tl-sync` (these values are managed in TestLink, not in markdown files):

| File | TC | Name | Recommended Priority | Reason |
|------|-----|------|---------------------|--------|
| TS-01 | TC-01 | Basic network creation | P0 | Core happy path |
| TS-01 | TC-02 | Create with all options | P1 | Important variation |
| TS-02 | TC-01 | Invalid name validation | P1 | Common error path |
| TS-03 | TC-03 | Max length boundary | P2 | Edge case |

### Priority Distribution

| Priority | Count | Percentage | Healthy Range |
|----------|-------|------------|---------------|
| P0 | X | XX% | 20-30% |
| P1 | Y | YY% | 40-50% |
| P2 | Z | ZZ% | 20-30% |

[Flag if distribution is skewed]

## Recommendations

### Must Fix Before TestLink Sync
1. [Critical issue with specific file/TC reference]
2. [Critical issue with specific file/TC reference]

### Should Fix
1. [Important improvement with file/TC reference]
2. [Important improvement with file/TC reference]

### Nice to Have
1. [Optional enhancement]
2. [Optional enhancement]

## Overall Assessment

**Status:** READY FOR TESTLINK / NEEDS REVISION

[Summary of test case quality and specific next steps]

---

## Next Steps

If READY FOR TESTLINK:
1. Run `/tw-case-publish` to sync to all destinations (TestLink + Confluence) in one step
2. Or run `/tl-sync` directly to sync to TestLink only
3. Verify synced test cases in TestLink UI

If NEEDS REVISION:
1. Address "Must Fix" items
2. Re-run `/tw-case-review` to verify fixes
3. Then proceed to `/tw-case-publish` or `/tl-sync`
```

---

## Example Usage

```
User: /tw-case-review
(project: active/PROJ-12345_User_Session_Management/)

Agent:
1. Reads test_plan/README.md → "New Feature Validation"
2. Announces: "Review profile: Full"
3. Reads test_cases/README.md → 8 scenarios, 32 test cases
4. Reads TS-01 through TS-08
5. Runs all quality checks (Full profile)
6. Produces report:

   ## Summary
   | Metric | Value |
   |--------|-------|
   | Review Profile | Full |
   | Test Scenarios | 8 (Expected: 5-8) |
   | Test Cases | 32 |
   | Quality Score | Good |
   | TestLink Readiness | Ready |

   ## Quality Issues
   ### Vague Expected Results
   | File | TC | Step | Issue | Suggested Fix |
   |------|-----|------|-------|---------------|
   | TS-03 | TC-02 | 5 | "Resource activates correctly" | "Resource 'Test-Resource-A' visible in the listing API response within 60 seconds" |

   ## Priority Recommendation
   | File | TC | Name | Recommended Priority | Reason |
   |------|-----|------|---------------------|--------|
   | TS-01 | TC-01 | Basic scheduled activation | P0 | Core happy path |
   | TS-01 | TC-02 | Immediate activation | P1 | Important variation |
   | TS-05 | TC-03 | Overlapping schedules | P2 | Edge case |

   ### Priority Distribution
   | Priority | Count | Percentage | Healthy Range |
   |----------|-------|------------|---------------|
   | P0 | 8 | 25% | 20-30% |
   | P1 | 15 | 47% | 40-50% |
   | P2 | 9 | 28% | 20-30% |

   **Status:** READY FOR TESTLINK
```

---

## Workflow Position

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST DOCUMENTATION WORKFLOW                   │
└─────────────────────────────────────────────────────────────────┘

/jr-trace [TICKET]
    └── Creates project structure and gathers documentation

/tw-plan-init → /tw-plan-[feature|bugfix|enhance]
    └── Creates test_plan/README.md + test_plan/sections/*.md

/tw-plan-review
    └── Reviews test plan for gaps and overlaps

/tw-case-init → /tw-case-[feature|bugfix|enhance]
    └── Creates test_cases/README.md + TS-XX_*.md files
                              ↓
              ┌───────────────────────────────┐
              │  /tw-case-review  ◄── YOU     │
              │  Reviews test case quality    │
              │  Recommends priorities        │
              └───────────────────────────────┘
                              ↓
/tw-case-publish (verify refs → review → sync → Confluence)
    └── Or /tl-sync directly (TestLink only)
```

---

## Quality Criteria Reference

### Action Verbs (Good)
- Navigate, Click, Select, Enter, Type
- Verify, Observe, Confirm, Check
- Wait, Scroll, Hover, Drag
- Upload, Download, Submit, Save

### Vague Terms to Flag
- "data" → Specify the actual data
- "some" → Specify the quantity
- "appropriate" → Define what is appropriate
- "correct" → Describe the correct state
- "works" → Describe the expected behavior
- "properly" → Define what properly means

### Expected Result Patterns (Good)
- "Message displays: '[exact text]'"
- "Page redirects to [specific page]"
- "Field shows value: [specific value]"
- "Button becomes [enabled/disabled]"
- "List contains [N] items"
- "Error icon appears next to [field name]"

### Expected Result Patterns (Bad)
- "Verify it works"
- "Check the result"
- "Should be correct"
- "Page updates properly"
- "Success"
