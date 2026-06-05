# Test Cases: New Feature (Type A)

Create detailed test cases for new feature testing.

```
Use this command to expand new feature test scenarios into detailed test cases.
Creates separate files for each test scenario (TS-XX_*.md).

{{input}}

## PURPOSE

Create comprehensive test cases for new features:
- Step-by-step test execution procedures
- TestLink-ready format
- One file per test scenario
- Expected: 20-40 test cases across 5-8 scenarios

AUDIENCE: QA Engineers, Test Execution Team, TestLink Users

---

## INFORMATION SOURCES

**PRIMARY SOURCE (Required) — detect layout first:**

Check whether the project uses the **new layout** (`test_plan/test_design/scenarios/`) or the **legacy layout** (scenarios inlined in `sections/04_Test_Strategy.md § 4.4`).

```
IF test_plan/test_design/scenarios/ exists (new layout):
  - Scenarios: read each test_plan/test_design/scenarios/TS-XX_*.md directly
  - Each file's `**Estimated test cases:** N`, optional `## Scenario Preconditions`
    block, and `### Case N:` blocks (Objective + Checkpoints mandatory;
    Preconditions + Notes optional) are the source of truth
  - Steps are NOT in the scenario file — derive them in the test case from
    each case's Objective + Checkpoints + Notes (this command's job)
  - Strategy file (sections/04_Test_Strategy.md) is lean — read § 4.3 (Approach)
    and § 4.4 (Test Data) for cross-cutting context, but NOT for scenarios
IF only test_plan/sections/ exists (legacy layout):
  - Scenarios: test_plan/sections/04_Test_Strategy.md § 4.4 (inline table)
  - Approach: test_plan/sections/04_Test_Strategy.md § 4.3
```

Other required sources (independent of layout):
1. **test_plan/sections/03_Scope_Boundaries.md § 3.1** — In-scope testing categories

> **Fallback:** If `test_plan/sections/` does not exist at all, read `test_plan/README.md` directly.

**SECONDARY SOURCES (Reference):**
4. **Confluence HLD** (`confluence/HLD_*.md`) - For detailed acceptance criteria
5. **UX Design Tickets** (`01_*UX*.md`) - For exact UI element names
6. **README.md** - For feature behavior clarification

---

## OUTPUT FILE STRUCTURE

```
test_cases/
├── README.md                        # Index and summary
├── TS-01_[Scenario_Name].md         # First test scenario
├── TS-02_[Scenario_Name].md         # Second test scenario
└── TS-XX_[Scenario_Name].md         # Additional scenarios
```

---

## STEP-BY-STEP WORKFLOW

### Step 1: Parse Test Plan Sections
```
1. Read scenarios — layout-aware:
   IF test_plan/test_design/scenarios/ exists:
     - List all TS-XX_*.md files in that directory (in numeric order)
     - For each file, extract the metadata header (Focus / Estimated test
       cases), the intro paragraph, the optional `## Scenario Preconditions`
       block, and each `### Case N:` block (Objective + Checkpoints + optional
       Preconditions + optional Notes)
   ELSE (legacy):
     - Read test_plan/sections/04_Test_Strategy.md § 4.4 (Test Scenarios table)

2. Count test scenarios (TS-01, TS-02, etc.)

3. For each scenario, extract:
   - Scenario ID (TS-XX)
   - Scenario name
   - Focus
   - Estimated test case count
   - Scenario-level preconditions (if present)
   - Per-case Objective + Checkpoints (+ case-level Preconditions and Notes if present)

4. Note approach context from sections/04_Test_Strategy.md § 4.3 (use as
   cross-cutting context — verification perspective, environment requirement,
   visual baseline references)
```

### Step 2: Create Directory and README.md
```
1. Create test_cases/ directory if it doesn't exist

2. Create test_cases/README.md with:
   # Test Cases: [Feature Name] ([Ticket ID])

   **Version:** 1.0
   **Created:** [Date]
   **QA Engineer:** [Name]

   ## Default Test Assumptions
   [Copy from test_plan/sections/04_Test_Strategy.md § 4.3]

   ## Test Scenarios Index
   | File | Scenario | Test Cases |
   |------|----------|------------|
   | [TS-01_*.md] | [Name] | TC-01 to TC-XX |
```

### Step 3: Create Separate File for Each Test Scenario

**FOR EACH test scenario** (source: `test_plan/test_design/scenarios/TS-XX_*.md` on the new layout, or `test_plan/sections/04_Test_Strategy.md § 4.4` on the legacy layout):

1. **Create new file:** `test_cases/TS-XX_[Scenario_Name].md`
   - Replace spaces with underscores in filename
   - Example: `TS-01_Basic_Configuration.md`

2. **Add file header** — `Test Plan Reference` is layout-aware. Each metadata label gets its own paragraph (blank line between) to avoid the A1 "merged metadata block" anti-pattern; the Objective sits below the divider as its own paragraph so it doesn't collide visually with the short metadata labels.
   ```markdown
   # TS-XX: [Scenario Name]

   **Focus:** [From "Focus" column / scenario file]

   **Test Cases:** [Count]

   **Test Plan Reference:** <new layout> test_plan/test_design/scenarios/TS-XX_<Slug>.md
                            <legacy layout> test_plan/sections/04_Test_Strategy.md § 4.4, TS-XX

   ---

   **Objective:** [Copy from test plan — keep as its own paragraph after the divider; maps to TestLink Suite Details on sync]
   ```

3. **FOR EACH test activity, create test case variations:**

   a. Identify the operation being tested
   b. Create variations based on:
      - Volume (small, medium, large)
      - State (enabled, disabled, empty, full)
      - Data type (valid, invalid, boundary)

   c. Write each test case:
   ```markdown
   ## TC-XX: [Descriptive Name]

   **Objective:**
   [Specific behavior validated]

   **Preconditions:**
   - [Only non-default requirements]
   - [Specific test data needed]

   **Test Steps:**

   | Step | Action | Expected Result |
   |------|--------|-----------------|
   | 1 | [Specific action] | [Measurable result] |
   | 2 | [Next action] | [Expected outcome] |

   **Postconditions:** [If test creates data: cleanup steps. Omit if not applicable.]

   **Execution Type:** Manual
   ```

4. **Add Summary table at end of file:**
   ```markdown
   ## Summary

   | TC ID | Name | Priority | Type |
   |-------|------|----------|------|
   | TC-01 | ... | P0 | Functional |
   ```

5. **SAVE file before moving to next scenario**

6. **Update README.md index**

7. **Move to next scenario**

### Step 4: Finalize README.md

After all scenario files are created:
1. Complete Test Scenario Index table (scan all `test_cases/TS-*.md` files to derive TC counts — never hand-edit)
2. Add Test Type Summary section
3. Add Priority Summary section
4. Add Execution Summary with totals
5. **Verify test_plan counts match** — update `test_plan/sections/04_Test_Strategy.md` scenario/TC counts if they changed

---

## QUALITY GUIDELINES

### Be Specific, Not Vague
- **Bad:** "Enter data" → **Good:** "Enter 'test@example.com' in Email field"
- **Bad:** "Verify result" → **Good:** "Message displays: 'Success'"

### Appropriate Test Case Counts
- Simple scenario: 2-4 test cases
- Moderate scenario: 5-8 test cases
- Complex scenario: 8-12 test cases
- If creating 20+: Split into 2 scenarios

### No Internal Labels in Test Cases
Do not embed test plan mapping labels (e.g., `D1`, `D2`, `S2`) in test case phase headers or step tables. These labels belong in the test plan or study documents, not in the test case itself. Phase names should be self-descriptive (e.g., "Before Start Date", "After Deactivation") without requiring the reader to look up a label key.

### Priority Decision Tree

For each test case, assign priority using this decision tree:

```
IF test case is the first/only TC for a scenario's primary flow → P0
ELSE IF test case tests a variation, alternate input, or integration point → P1
ELSE IF test case tests edge case, boundary, or rare configuration → P2
ELSE IF test case tests error handling for uncommon scenarios → P2
```

**Target distribution:** P0: 20-30%, P1: 40-50%, P2: 20-30%
Flag if distribution is skewed (e.g., >50% P0 suggests inflation).

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

**Preconditions describe system state, not UI state.** This is a hard rule.

| Belongs in **Preconditions** | Belongs in **Test Steps** (typically Step 1) |
|---|---|
| Data state (`tc-fixture-A` exists with X matrix) | UI state (open the portal list, click Edit) |
| Permission / role (admin signed in with permission to manage profiles) | Page navigation (Settings → Resources → Profiles) |
| Feature flag state (flag is ON / OFF on the tenant) | Opening dialogs, panels, sub-modals |
| Device / tooling availability (real client device, device-driver MCP available) | Wizard advancement, button clicks, form input |
| External gates (TKT-01 resolved, build deployed, fixture from another TC exists) | Anything the executor does in the UI during this TC |

Never write a precondition like:
- ❌ "Admin on Settings → Resources → Profiles page"
- ❌ "Admin in the Edit view of the portal with the Sub-section panel open"
- ❌ "On the submission form, ready to submit"

Rewrite those as Step 1:
- ✅ Step 1: Navigate to **Settings → Resources → Profiles**. Click **Add Profile**. → Add Profile form opens.
- ✅ Step 1: Navigate to **Settings → Resources → Profiles**. Click the existing fixture `tc-fixture-A` and click **Edit**. Open the **Sub-section** panel. → Edit view shows the Sub-section panel.

**Why this matters:**
- Test independence — each TC runs standalone from a known data state; the executor never has to remember "what page should I already be on?"
- Automation — the script does the navigation itself; it can't assume a page is open
- Reproducibility — navigation IS part of the test; skipping it can mask a real navigation bug

### Navigation Step Rules (within Test Steps)

Once navigation is in the steps (not preconditions), keep the navigation itself tight:

- [ ] Combine navigation + the initial action into one step where natural ("Go to X, click Y")
- [ ] No intermediate page verifications (no "Step 2: Verify the portal list loaded" — the navigation's expected-result column covers that)
- [ ] Use page names, not URLs or routes (e.g., "Users — Guests" not `/admin/users/guests`)
- [ ] When multiple TCs share the same navigation path, repeat the navigation step at the top of each — independence over DRY

### Test Data Adequacy

- Use realistic values, not arbitrary placeholders
- Different test cases should use distinct data to avoid masking bugs
- Cover representative data types (strings, numbers, special characters)
- Include boundary values at actual system limits (not round numbers)
- Include negative test data (empty, null, overflow)

### Boundary Value Analysis

For features with numeric limits or field constraints, include test cases at:
- **min** — the minimum allowed value
- **min+1** — just above minimum
- **max-1** — just below maximum
- **max** — the maximum allowed value
- **Empty/zero** state
- **Overflow** — beyond maximum

### Cleanup/Postconditions

For test cases that create, modify, or delete data:
- Document whether cleanup is needed after execution
- Note postconditions if the test modifies shared state
- Ensure no test leaves the system in a state that blocks other tests

Add a `**Postconditions:**` section to test cases that create data:
```markdown
**Postconditions:**
- Delete created [entity] after test execution
```

### Test Variations
Create variations based on:
- **Volume:** small (2-3), medium (10-20), large (50-100+)
- **State:** enabled, disabled, partial, full
- **Data:** valid, invalid, boundary, special characters

---

## DECISION TREES

### Vague Test Activity
```
IF test activity is vague (e.g., "Test notification grouping"):
  1. Identify the operation
  2. Create volume variations (below, at, above threshold)
  3. Create data variations (single type, multiple types)
  4. Create edge cases (empty, maximum)
  Result: 1 vague activity → 5-6 specific test cases
```

### No Volume Guidance
```
IF test plan doesn't specify volumes:
  1. Check HLD for thresholds
  2. Use defaults: Small=2-3, Medium=10-20, Large=50-100+
  3. Document assumption
```

---

## NEXT STEP

After creating test cases, run `/tw-case-review` to verify quality before TestLink sync.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW CONTINUATION                         │
└─────────────────────────────────────────────────────────────────┘

/tw-case-init
    └── Detected Type A: New Feature
                              ↓
/tw-case-feature  ◄── YOU ARE HERE
    └── Creates test_cases/README.md + TS-XX_*.md files
                              ↓
/tw-case-review
    └── Reviews test case quality
                              ↓
/tl-sync
    └── Syncs to TestLink
```
```
