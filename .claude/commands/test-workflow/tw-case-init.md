# Test Case Initialization

Initialize test case creation by reading the test plan type and routing to the appropriate workflow.

```
Use this command to start test case creation. It will read the test plan and recommend the appropriate workflow.

{{input}}

## PURPOSE

Analyze the test plan to:
1. Read the test plan type from header
2. Verify prerequisites are in place
3. Route to the appropriate test case workflow

---

## AGENT WORKFLOW

### Pre-Check: Verify Prerequisites

Before starting, verify these files exist:
- [ ] `test_plan/README.md` must exist (index file created by /tw-plan-* commands)
- [ ] `test_plan/sections/` should contain section files
- [ ] Test scenarios — layout-aware:
  - **New layout** (`test_plan/test_design/scenarios/` exists): list all `TS-XX_*.md` files in that directory
  - **Legacy layout**: scenario table inline in `sections/04_Test_Strategy.md § 4.4 / § 4.2` (Feature/Enhancement) or `sections/03_Test_Strategy.md § 3.2` (Bug Fix)
- [ ] Optional: `/tw-plan-review` output with coverage matrix

> **Fallback:** If `test_plan/sections/` does not exist, read `test_plan/README.md` directly.

**If test plan is missing:**
```
Ask user: "Please run /tw-plan-init first to create the test plan."
STOP - Cannot proceed without test plan
```

---

### Step 1: Read Test Plan Type

Read the test plan header and identify the type:

```
READ test_plan/README.md header
FIND "Test Plan Type:" field

IF "New Feature Validation":
  → Type A detected
  → Recommend: "/tw-case-feature"
  → Expect: 20-40 test cases across 5-8 scenarios

IF "Bug Fix Validation":
  → Type B detected
  → Recommend: "/tw-case-bugfix"
  → Expect: 8-15 test cases across 2-4 scenarios

IF "Enhancement Validation":
  → Type C detected
  → Recommend: "/tw-case-enhance"
  → Expect: 15-25 test cases across 4-6 scenarios
```

---

### Step 2: Extract Test Scenarios

Count and list all test scenarios from the test plan, layout-aware:

```
IF test_plan/test_design/scenarios/ exists (NEW LAYOUT):
  LIST every TS-XX_*.md file under that directory (numeric order)
  FOR EACH scenario file, READ:
    - Scenario ID (from filename / H1)
    - Scenario name (from H1)
    - Focus (from **Focus:** field)
    - Estimated test case count (from **Estimated test cases:** field)
    - Scenario preconditions (from optional ## Scenario Preconditions block)
    - Per-case Objective + Checkpoints (+ case-level Preconditions / Notes if present),
      one ### Case N: block per case. Steps are NOT in the scenario — derive
      them later in the test case body from Objective + Checkpoints + Notes

ELSE (LEGACY LAYOUT):
  READ test_plan/sections/04_Test_Strategy.md § 4.4 (features)
    or test_plan/sections/04_Test_Strategy.md § 4.2 (enhancements)
    or test_plan/sections/03_Test_Strategy.md § 3.2 (bug fixes)
  EXTRACT test scenario table (one row per TS-XX)
```

---

### Step 3: Check for Review Output

If `/tw-plan-review` was run, reference its output:
- Coverage matrix
- Identified gaps
- Recommendations
- Hybrid depth strategy suggestions

---

### Step 4: Provide Summary

Output a summary with:
1. Test plan type detected
2. Test scenarios found
3. Recommended next command
4. Expected output

---

## OUTPUT FORMAT

```markdown
# Test Case Initialization: [Project Name]

## Test Plan Analysis

**Test Plan Type:** [Type A/B/C]: [Description]
**Test Plan Version:** [Version from header]
**Test Scenarios:** [Count]
**Estimated Test Cases:** [Total from test plan]

## Test Scenarios Found

| ID | Scenario Name | Focus | Est. Cases |
|----|---------------|-------|------------|
| TS-01 | [Name] | [Focus] | [N] |
| TS-02 | [Name] | [Focus] | [N] |

## Coverage Matrix Reference

[If /tw-plan-review was run, reference its coverage matrix]

## Recommended Next Step

Run `/tw-case-[feature/bugfix/enhance]` to create detailed test cases.

**Expected Output:**
- `test_cases/README.md` - Index file
- `test_cases/TS-01_[Name].md` - Scenario 1 test cases
- `test_cases/TS-02_[Name].md` - Scenario 2 test cases
- [etc.]

## Quick Reference

| Test Plan Type | Command | Expected TCs |
|----------------|---------|--------------|
| New Feature | `/tw-case-feature` | 20-40 |
| Bug Fix | `/tw-case-bugfix` | 8-15 |
| Enhancement | `/tw-case-enhance` | 15-25 |
```

---

## WORKFLOW POSITION

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST CASE WORKFLOW                            │
└─────────────────────────────────────────────────────────────────┘

/tw-plan-*
    └── Creates test_plan/README.md + test_plan/sections/*.md
                              ↓
/tw-plan-review
    └── Reviews test plan, generates coverage matrix
                              ↓
              ┌───────────────────────────────┐
              │  /tw-case-init  ◄── YOU ARE   │
              │  Detect type, verify prereqs  │
              └───────────────────────────────┘
                              ↓
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
  /tw-case-feature     /tw-case-bugfix     /tw-case-enhance
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ↓
                     /tw-case-review
                              ↓
                        /tl-sync
```
```
