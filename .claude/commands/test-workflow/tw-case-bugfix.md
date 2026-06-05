# Test Cases: Bug Fix (Type B)

Create focused test cases for bug fix validation.

```
Use this command to create test cases from bug fix test plans.
Creates separate files for each test scenario (TS-XX_*.md).

{{input}}

## PURPOSE

Create focused test cases for bug fixes:
- Defect verification test cases
- Regression test cases
- Edge case prevention
- Expected: 8-15 test cases across 2-4 scenarios

AUDIENCE: QA Engineers, Test Execution Team, TestLink Users

---

## INFORMATION SOURCES

**PRIMARY SOURCE (Required) — detect layout first:**

Check whether the project uses the **new layout** (`test_plan/test_design/scenarios/`) or the **legacy layout** (scenarios inlined in `sections/03_Test_Strategy.md § 3.2`).

```
IF test_plan/test_design/scenarios/ exists (new layout):
  - Scenarios: read each test_plan/test_design/scenarios/TS-XX_*.md directly
  - Each file's `**Estimated test cases:** N` header gives the case count
  - Body is the source of truth for activities (no § 3.2 table to consult)
IF only test_plan/sections/ exists (legacy layout):
  - Scenarios: test_plan/sections/03_Test_Strategy.md § 3.2 (inline table)
```

Other required sources (independent of layout):
1. **test_plan/sections/01_Problem_Context.md § 1.2** — Reproduction steps (critical for defect verification)
2. **test_plan/sections/02_Test_Scope.md § 2.1-2.3** — Test scope

> **Fallback:** If `test_plan/sections/` does not exist at all, read `test_plan/README.md` directly.

**SECONDARY SOURCES (Reference):**
4. **Bug Ticket** (`00_Main_Task_*.md`) - Original reproduction steps
5. **README.md** - Problem summary

---

## OUTPUT FILE STRUCTURE

```
test_cases/
├── README.md                        # Index and summary
├── TS-01_Defect_Verification.md     # Defect verification tests
├── TS-02_Regression_Testing.md      # Regression tests
└── TS-03_Edge_Cases.md              # Edge case prevention
```

---

## STEP-BY-STEP WORKFLOW

### Step 1: Parse Bug Fix Test Plan Sections
```
1. Read test_plan/sections/01_Problem_Context.md § 1.2 - Extract reproduction steps
   - These become the basis for TS-01 (Defect Verification)

2. Read scenarios — layout-aware:
   IF test_plan/test_design/scenarios/ exists:
     - Read each TS-XX_*.md file under that directory
     - Use the metadata header (Focus / Est. test cases), the optional
       `## Scenario Preconditions` block, and each `### Case N:` block
       (Objective + Checkpoints + optional Preconditions + optional Notes)
       verbatim
     - Steps are NOT in the scenario file — derive them in the test case
       from each case's Objective + Checkpoints + Notes
   ELSE (legacy layout):
     - Read test_plan/sections/03_Test_Strategy.md § 3.2 inline table

   Typical bug-fix scenarios:
     • TS-01: Defect Verification
     • TS-02: Regression Testing
     • TS-03: Edge Cases

3. Read test_plan/sections/01_Problem_Context.md § 1.3 - Fix summary
   - Identify component/area affected
   - Use to determine regression scope
```

### Step 2: Create Defect Verification Test Cases (TS-01)

**FROM test_plan/sections/01_Problem_Context.md § 1.2 reproduction steps:**

```markdown
# TS-01: Defect Verification

**Focus:** Defect verification

**Test Cases:** 2-3

**Test Plan Reference:** test_plan/sections/01_Problem_Context.md § 1.2

---

**Objective:** Verify the original bug no longer occurs

## TC-01: Reproduce Original Bug

**Objective:** Verify original bug no longer occurs using exact reproduction steps

**Preconditions:**
- [Copy from test_plan/sections/01_Problem_Context.md § 1.2]

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| [Copy exact steps from § 1.2] | [Expected behavior - NOT the bug] |

**Execution Type:** Manual

---

## TC-02: Defect Variation 1

**Objective:** Verify fix works with slightly different data

**Preconditions:**
- [Similar to TC-01 with variation]

**Test Steps:**
[Variation of reproduction with different data]

---

## TC-03: Defect Variation 2

**Objective:** Verify fix works in different user context

[etc.]

---

## Summary

| TC ID | Name | Priority | Type |
|-------|------|----------|------|
| TC-01 | Reproduce Original Bug | P0 | Defect Verification |
| TC-02 | Defect Variation 1 | P0 | Defect Verification |
| TC-03 | Defect Variation 2 | P1 | Defect Verification |
```

### Step 3: Create Regression Test Cases (TS-02)

**BASED ON component from test_plan/sections/01_Problem_Context.md § 1.3:**

```markdown
# TS-02: Regression Testing

**Focus:** Regression

**Test Cases:** 2-3

**Test Plan Reference:** test_plan/sections/02_Test_Scope.md § 2.2

---

**Objective:** Verify fix didn't break related functionality

## TC-01: Related Operation 1

**Objective:** Verify [related operation] still works correctly

**Preconditions:**
- [Setup for related operation]

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | [Test related operation] | [Expected behavior] |

---

## TC-02: Related Operation 2

[etc.]

---

## Summary

| TC ID | Name | Priority | Type |
|-------|------|----------|------|
| TC-01 | Related Operation 1 | P1 | Regression |
| TC-02 | Related Operation 2 | P1 | Regression |
```

### Step 4: Create Edge Case Test Cases (TS-03)

**THINK about what could cause similar bugs:**

```markdown
# TS-03: Edge Cases & Prevention

**Focus:** Edge Cases

**Test Cases:** 2-4

**Test Plan Reference:** test_plan/sections/02_Test_Scope.md § 2.3

---

**Objective:** Prevent similar bugs through edge case coverage

## TC-01: Boundary Condition

**Objective:** Verify behavior at boundary limits

---

## TC-02: Empty/Zero State

**Objective:** Verify behavior with empty data

---

## TC-03: Large Volume

**Objective:** Verify behavior under stress

---

## Summary

| TC ID | Name | Priority | Type |
|-------|------|----------|------|
| TC-01 | Boundary Condition | P1 | Edge Case |
| TC-02 | Empty/Zero State | P2 | Edge Case |
| TC-03 | Large Volume | P2 | Edge Case |
```

### Step 5: Keep It Focused

Bug fix test cases should be FOCUSED:
- **Total:** 8-15 test cases (not 40+)
- **Priority:** Most should be P0 or P1
- **Depth over breadth:** Thorough testing of affected area

---

## DECISION TREES

### No Reproduction Steps
```
IF test_plan/sections/01_Problem_Context.md § 1.2 has no clear reproduction steps:
  1. Check original bug ticket comments
  2. Check README.md problem description
  3. If still unclear:
     - Create general verification tests
     - Note: "Original reproduction steps not available"
  4. Continue with broader coverage
```

### Unclear Component
```
IF component not clearly identified:
  1. Check ticket title for component hints
  2. Check fix description for affected areas
  3. Create broader regression scope
```

---

## QUALITY GUIDELINES

### Priority Decision Tree

For each test case, assign priority using this decision tree:

```
IF test case verifies the primary defect (exact reproduction steps) → P0
ELSE IF test case is a critical regression test → P0
ELSE IF test case tests a defect variation or standard regression → P1
ELSE IF test case tests edge case or boundary condition → P1
ELSE IF test case tests nice-to-have edge case → P2
```

**Target distribution:** P0: 20-30%, P1: 40-50%, P2: 20-30%

### Sanitization Checklist

Before completing each test case, verify:
- [ ] No hardcoded tenant names — use `TestTenant-A`, `TestTenant-B`
- [ ] No real credentials — use `<password>` placeholder
- [ ] No real IP addresses — use `10.x.x.x` or `192.168.x.x`
- [ ] No real email addresses — use `testuser@example.com`
- [ ] No RBAC scope lines unless the scenario specifically tests RBAC

### Test Independence

Each test case MUST run standalone:
- All required data state and capabilities are in preconditions (not "state from previous test")
- No reliance on execution order
- No shared mutable state between test cases
- Preconditions are system state, not UI state — see the split rule below

### Preconditions vs. Test Steps — the split rule

**Preconditions describe system state, not UI state.** Never write a precondition like "Admin on X page" or "X panel open" — navigation belongs in the first test step.

| Belongs in **Preconditions** | Belongs in **Test Steps** (typically Step 1) |
|---|---|
| Data state (existing entities, defect-reproducing config) | UI state (open a page, click Edit, open a panel) |
| Permission / role | Page navigation (menu paths) |
| Build / version that has the fix applied | Opening dialogs, panels, sub-modals |
| Device / tooling availability | Anything the executor does in the UI during this TC |

Step pattern: combine the navigation and the initial action — "Go to **X → Y**, click **Z**" → expected: "form opens" or equivalent.

### Navigation Step Rules (within Test Steps)

- [ ] Combine navigation + the initial action into one step where natural
- [ ] No intermediate page verifications
- [ ] Use page names, not URLs or routes
- [ ] Repeat the navigation step at the top of each TC when paths overlap — independence over DRY

> **Note:** Test data adequacy, boundary value analysis, and
> cleanup/postconditions are **skipped** for Bug Fix (Focused profile).
> These are checked at Standard and Full profile levels.

### No Internal Labels in Test Cases
Do not embed test plan mapping labels (e.g., `D1`, `D2`, `S2`) in test case phase headers or step tables. These labels belong in the test plan or study documents, not in the test case itself. Phase names should be self-descriptive (e.g., "Before Start Date", "After Deactivation") without requiring the reader to look up a label key.

---

## NEXT STEP

After creating test cases:
1. **Regenerate `test_cases/README.md`** — scan all `test_cases/TS-*.md` or `test_cases/sections/*.md` files for TC counts (never hand-edit counts)
2. **Verify test_plan counts match** — update `test_plan/sections/03_Test_Strategy.md` scenario/TC counts if they changed
3. Run `/tw-case-review` to verify quality.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW CONTINUATION                         │
└─────────────────────────────────────────────────────────────────┘

/tw-case-init
    └── Detected Type B: Bug Fix
                              ↓
/tw-case-bugfix  ◄── YOU ARE HERE
    └── Creates test_cases/README.md + TS-XX_*.md files
                              ↓
/tw-case-review
    └── Reviews test case quality
                              ↓
/tl-sync
    └── Syncs to TestLink
```
```
