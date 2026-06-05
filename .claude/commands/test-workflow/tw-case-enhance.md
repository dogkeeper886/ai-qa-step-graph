# Test Cases: Enhancement (Type C)

Create test cases for enhancement/improvement testing.

```
Use this command to create test cases for enhancements.
Creates separate files for each test scenario (TS-XX_*.md).

{{input}}

## PURPOSE

Create hybrid test cases for enhancements:
- New functionality test cases
- Changed behavior validation
- Integration impact tests
- Backward compatibility tests
- Expected: 15-25 test cases across 4-6 scenarios

AUDIENCE: QA Engineers, Test Execution Team, TestLink Users

---

## INFORMATION SOURCES

**PRIMARY SOURCE (Required) — detect layout first:**

Check whether the project uses the **new layout** (`test_plan/test_design/scenarios/`) or the **legacy layout** (scenarios inlined in `sections/04_Test_Strategy.md § 4.2`).

```
IF test_plan/test_design/scenarios/ exists (new layout):
  - Scenarios: read each test_plan/test_design/scenarios/TS-XX_*.md directly
  - Each file's metadata header (Focus / Estimated test cases), optional
    `## Scenario Preconditions` block, and `### Case N:` blocks (Objective +
    Checkpoints + optional Preconditions + optional Notes) are the source of truth
  - Steps are NOT in the scenario file — derive them in the test case from
    each case's Objective + Checkpoints + Notes (this command's job)
IF only test_plan/sections/ exists (legacy layout):
  - Scenarios: test_plan/sections/04_Test_Strategy.md § 4.2 (inline table)
```

Other required sources (independent of layout):
1. **test_plan/sections/02_Enhancement_Definition.md § 2.1** — New/changed functionality
2. **test_plan/sections/03_Test_Scope.md § 3.1-3.3** — Test scope

> **Fallback:** If `test_plan/sections/` does not exist at all, read `test_plan/README.md` directly.

**SECONDARY SOURCES (Reference):**
4. **Enhancement Ticket** (`00_Main_Task_*.md`)
5. **Original Feature Documentation**
6. **README.md** - Enhancement summary

---

## OUTPUT FILE STRUCTURE

```
test_cases/
├── README.md                           # Index and summary
├── TS-01_Enhancement_Verification.md   # New/changed behavior
├── TS-02_Configuration_Changes.md      # Settings changes
├── TS-03_Integration_Impact.md         # Component interactions
└── TS-04_Backward_Compatibility.md     # Existing behavior
```

---

## HYBRID APPROACH

Enhancements require BOTH:
1. **New functionality test cases** (Type A approach)
2. **Regression test cases** (Type B approach)

**Typical split:**
- TS-01 to TS-02: Enhancement verification (use Type A workflow)
- TS-03: Integration impact (combination approach)
- TS-04: Backward compatibility (use Type B workflow)

---

## STEP-BY-STEP WORKFLOW

### Step 1: Parse Enhancement Test Plan Sections
```
1. Read test_plan/sections/02_Enhancement_Definition.md § 2.1 - New/Changed functionality
   - List what's new
   - List what's changed

2. Read scenarios — layout-aware:
   IF test_plan/test_design/scenarios/ exists:
     - List all TS-XX_*.md files; read each file's header + body
   ELSE (legacy):
     - Read test_plan/sections/04_Test_Strategy.md § 4.2 inline table

   Usually 4-6 scenarios.

3. Split scenarios into groups:
   - Enhancement scenarios → Type A approach
   - Regression scenarios → Type B approach
```

### Step 2: Create Enhancement Verification Tests (TS-01)

```markdown
# TS-01: Enhancement Verification

**Focus:** Enhancement

**Test Cases:** 4-6

**Test Plan Reference:** test_plan/sections/02_Enhancement_Definition.md § 2.1

---

**Objective:** Verify new/changed functionality works as specified

## TC-01: New Behavior - Basic

**Objective:** Verify [new behavior] works in basic scenario

**Preconditions:**
- [Enhancement enabled/configured]

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | [Trigger new behavior] | [New expected result] |

---

## TC-02: New Behavior - Variations

[Volume, data, context variations]

---

## TC-03: Changed Behavior - Verification

**Objective:** Verify [changed behavior] works correctly

---

## Summary

| TC ID | Name | Priority | Type |
|-------|------|----------|------|
| TC-01 | New Behavior - Basic | P0 | Enhancement |
| TC-02 | New Behavior - Variations | P1 | Enhancement |
| TC-03 | Changed Behavior | P0 | Enhancement |
```

### Step 3: Create Configuration Tests (TS-02)

```markdown
# TS-02: Configuration Changes

**Focus:** Configuration

**Test Cases:** 2-4

**Test Plan Reference:** test_plan/sections/02_Enhancement_Definition.md § 2.2

---

**Objective:** Verify new/changed configuration options work correctly

## TC-01: New Configuration Option

**Objective:** Verify new configuration option works

---

## TC-02: Configuration Migration

**Objective:** Verify existing configurations work with enhancement

---

## Summary

| TC ID | Name | Priority | Type |
|-------|------|----------|------|
| TC-01 | New Configuration Option | P1 | Configuration |
| TC-02 | Configuration Migration | P0 | Configuration |
```

### Step 4: Create Integration Impact Tests (TS-03)

```markdown
# TS-03: Integration Impact

**Focus:** Integration

**Test Cases:** 2-4

**Test Plan Reference:** test_plan/sections/03_Test_Scope.md § 3.2

---

**Objective:** Verify enhancement doesn't break component interactions

## TC-01: Component A Integration

**Objective:** Verify interaction with [Component A] still works

---

## TC-02: API Compatibility

**Objective:** Verify API changes are backward compatible

---

## Summary

| TC ID | Name | Priority | Type |
|-------|------|----------|------|
| TC-01 | Component A Integration | P1 | Integration |
| TC-02 | API Compatibility | P1 | Integration |
```

### Step 5: Create Backward Compatibility Tests (TS-04)

```markdown
# TS-04: Backward Compatibility

**Focus:** Backward Compatibility

**Test Cases:** 2-3

**Test Plan Reference:** test_plan/sections/03_Test_Scope.md § 3.3

---

**Objective:** Verify existing functionality still works unchanged

## TC-01: Existing Workflow - Unchanged

**Objective:** Verify [existing workflow] works as before

---

## TC-02: Legacy Data - Support

**Objective:** Verify legacy data is still supported

---

## Summary

| TC ID | Name | Priority | Type |
|-------|------|----------|------|
| TC-01 | Existing Workflow | P1 | Backward Compatibility |
| TC-02 | Legacy Data Support | P1 | Backward Compatibility |
```

---

## QUALITY GUIDELINES

### Priority Decision Tree

For each test case, assign priority using this decision tree:

```
IF test case is the first/only TC for a scenario's primary flow → P0
ELSE IF test case verifies critical changed behavior → P0
ELSE IF test case tests a variation, integration, or backward compatibility → P1
ELSE IF test case tests edge case or rare configuration → P2
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
| Data state (existing entities, configured matrix, populated records) | UI state (open a page, click Edit, open a panel) |
| Permission / role (admin with permission to manage X) | Page navigation (menu paths) |
| Feature flag state | Opening dialogs, panels, sub-modals |
| Device / tooling availability | Wizard advancement, button clicks, form input |
| External gates (tickets resolved, build deployed) | Anything the executor does in the UI during this TC |

Step pattern: combine the navigation and the initial action — "Go to **X → Y**, click **Z**" → expected: "form opens" or equivalent.

### Navigation Step Rules (within Test Steps)

- [ ] Combine navigation + the initial action into one step where natural ("Go to X, click Y")
- [ ] No intermediate page verifications (no "Step 2: Verify the portal list loaded" — the expected-result column of the navigation step covers that)
- [ ] Use page names, not URLs or routes
- [ ] When multiple TCs share the same navigation path, repeat the navigation step at the top of each — independence over DRY

### Test Data Adequacy (Lite)

- Use realistic values, not arbitrary placeholders
- Different test cases should use distinct data to avoid masking bugs
- Cover representative data types (strings, numbers, special characters)

> **Note:** Full boundary value analysis and cleanup/postconditions are
> not required for Enhancement (Standard profile) — these are checked
> only at the Full profile level (new features).

### Test Counts
- Enhancement verification: 4-6 test cases
- Configuration changes: 2-4 test cases
- Integration impact: 2-4 test cases
- Backward compatibility: 2-3 test cases
- **Total:** 15-25 test cases

### No Internal Labels in Test Cases
Do not embed test plan mapping labels (e.g., `D1`, `D2`, `S2`) in test case phase headers or step tables. These labels belong in the test plan or study documents, not in the test case itself. Phase names should be self-descriptive (e.g., "Before Start Date", "After Deactivation") without requiring the reader to look up a label key.

### Balance
- Don't over-test new functionality at expense of regression
- Don't over-test regression at expense of new functionality
- Both are important for enhancements

---

## NEXT STEP

After creating test cases:
1. **Regenerate `test_cases/README.md`** — scan all `test_cases/TS-*.md` files for TC counts (never hand-edit counts)
2. **Verify test_plan counts match** — update `test_plan/sections/04_Test_Strategy.md` scenario/TC counts if they changed
3. Run `/tw-case-review` to verify quality.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW CONTINUATION                         │
└─────────────────────────────────────────────────────────────────┘

/tw-case-init
    └── Detected Type C: Enhancement
                              ↓
/tw-case-enhance  ◄── YOU ARE HERE
    └── Creates test_cases/README.md + TS-XX_*.md files
                              ↓
/tw-case-review
    └── Reviews test case quality
                              ↓
/tl-sync
    └── Syncs to TestLink
```
```
