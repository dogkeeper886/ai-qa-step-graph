# Test Plan: Bug Fix (Type B)

Create a focused test plan for bug fix validation.

```
Use this command for bug fixes, customer issues, and defects.
This creates test_plan/README.md + test_plan/sections/*.md with 2-4 test scenarios.

{{input}}

## PURPOSE

Create a focused test plan for bug fixes:
- Problem context and reproduction steps
- Fix verification scope
- Edge case prevention
- Focused test scenarios (2-4 typical)

AUDIENCE: QA Engineers, Developers, Product Team

---

## INFORMATION GATHERING PRIORITY

**PRIMARY SOURCES (Required):**
1. **Bug Ticket Comments** (`00_Main_Task_*.md` comments section) - Reproduction steps, customer reports
2. **Main Ticket Description** - Problem statement, expected vs actual behavior
3. **README.md** - Problem summary synthesized by /jr-trace

**SECONDARY SOURCES (If Available):**
4. **Related Bug Tickets** - Similar issues, patterns, linked defects
5. **Developer Comments** - Fix approach, root cause analysis
6. **Confluence Docs** - If problem relates to documented feature

**NOTE:** Bug fixes typically do NOT have HLD, UX designs, or full stakeholder info. This is normal!

---

## STEP-BY-STEP WORKFLOW

### Step 1: Understand the Problem

**Questions to ask:**
- What is the customer-reported problem?
- What is expected behavior vs. actual behavior?
- What are the reproduction steps?
- What is the customer impact (severity, frequency)?
- What is the affected component/feature?

**Sources to check:**
- Main ticket description
- All comments (especially customer/reporter comments)
- README.md problem summary
- Related bug tickets

**Extract into template:**
```markdown
### 1.1 Problem Overview
**Customer Issue:** [Brief description]
**Reported By:** [Customer name/ID or Internal reporter]
**Ticket Type:** Bug / Defect / Customer Issue
**Impact:** [Severity: Critical/High/Medium/Low]
**Frequency:** [Always/Intermittent/Edge case]
**Affected Users:** [All users/Specific role/Specific scenario]

**Problem Behavior:**
- **Expected:** [What should happen]
- **Actual:** [What currently happens]
- **Root Cause:** [If known from dev investigation - check comments]
```

### Step 2: Extract Reproduction Steps

**Questions to ask:**
- What exact steps reproduce the problem?
- What environment/conditions are needed?
- What test data is required?
- Are there workarounds?

**Sources to check:**
- Comments section (look for "Steps to reproduce", "Repro steps")
- Developer investigation notes
- Customer reports

**Extract into template:**
```markdown
### 1.2 Reproduction Context

**Environment:** [Where problem occurs - production, staging, specific version]
**Preconditions:** [State/data/configuration needed to reproduce]

**Steps to Reproduce:**
1. [Step 1 - extracted from comments]
2. [Step 2]
3. [Step 3]
**Result:** [What happens - the bug]

**Expected Result:** [What should happen instead]
**Current Workaround:** [If any - check comments]
```

### Step 2.5: Reproduce Visually (if UI bug)

If the bug has UI symptoms, verify the current state before and after the fix.

**Ask the user:** "Is this a UI-visible bug? Can I open the browser to see the current behavior?"

```
IF UI bug AND live environment available:
  → Open browser and reproduce the bug (or verify it's fixed)
  → Capture screenshot of the buggy state (if still reproducible) or fixed state
  → This grounds test cases in reality, not just ticket descriptions

IF not a UI bug:
  → Skip this step — proceed to Step 3
```

### Step 3: Understand the Fix

**Questions to ask:**
- What code/component was changed?
- What is the fix approach?
- Are there related areas that might be affected?
- When is/was the fix deployed?

**Sources to check:**
- Developer comments
- Linked code commits (if mentioned)
- Related tickets
- Status/resolution comments

### Step 4: Define Test Scope (Bug Fix Focus)

For bug fixes, focus on THREE areas:

**4.1 Defect Verification**
- Verify original problem is fixed
- Test exact reproduction steps
- Confirm expected behavior now occurs
- Validate in same environment/conditions as bug report

**4.2 Regression Testing**
- Test related functionality
- Verify fix didn't break other features
- Test adjacent code paths

**4.3 Edge Case Prevention**
- Test boundary conditions
- Test with different data volumes
- Test in different user contexts
- Prevent similar issues in related areas

### Step 5: Create Test Scenarios (Bug Fix)

For bug fixes, typically create 2-4 focused scenarios. Each scenario gets its own file under `test_design/scenarios/`.

**Output location:**
- One file per scenario: `test_design/scenarios/TS-XX_<Slug>.md`
- Index file: `test_design/scenarios/README.md`

Typical scenario shape for a bug fix:

```
| ID | Scenario | Focus | Est. Cases |
|---|---|---|---|
| TS-01 | Defect Verification | Verify fix | 2-3 |
| TS-02 | Regression Testing | Prevent breaks | 2-3 |
| TS-03 | Edge Cases & Prevention | Prevent recurrence | 2-4 |
```

Every TS-XX file follows the uniform metadata header, an optional Scenario Preconditions block, and a `### Case N:` block per case (Objective + Checkpoints mandatory; Preconditions + Notes optional). Click-by-click steps belong in test cases, not scenarios. See `skills/planning-tests/references/scenario-conventions.md`.

**Note:** Bug fix test plans are typically SHORTER than feature test plans. Focus on quality over quantity.

---

## DECISION TREES: HANDLING MISSING INFORMATION

### No Clear Reproduction Steps
```
IF no reproduction steps in bug ticket:
  1. Check all comments thoroughly for "repro", "steps", "reproduce"
  2. Check README.md problem summary
  3. Check related bug tickets for similar patterns
  4. Ask user: "I don't see reproduction steps. Can you provide:
     - Steps to reproduce this issue, OR
     - Description of when/how the problem occurs?"
  5. If user doesn't know:
     - Note: "Reproduction steps not documented"
     - Create general test approach:
       • TS-01: Basic functionality test (ensure component works)
       • TS-02: Edge case coverage (prevent related issues)
  6. Continue with broader test coverage
```

### No Fix Details
```
IF no fix approach documented:
  1. Check for linked code commits in ticket
  2. Check developer comments for technical details
  3. Check ticket status changes for clues
  4. Make reasonable assumption based on component:
     "Fix applied to [component mentioned in ticket title/description]"
  5. Create broad test coverage:
     - Test the reported problem (defect verification)
     - Test related areas (regression)
  6. Note in test plan: "Fix details not documented - created comprehensive test coverage"
  7. Continue without blocking
```

---

## BEST PRACTICE SECTIONS (Focused Profile)

Bug fix test plans use the Focused review profile, which requires fewer best-practice sections. The legacy "Coverage Matrix" subsection is **dropped** — derive on-demand from the traceability matrix only if a reviewer asks. See `skills/planning-tests/references/file-layout.md`.

After finalizing test scenarios (Step 5), produce:

### Step 6: Requirements Traceability (lite)

Even for bug fixes, write a minimal `test_design/traceability_matrix.md` mapping the bug's reproduction steps and any AC items to the scenarios that cover them. Keep it short — a few rows is fine.

```markdown
# Requirements Traceability — [PROJECT_ID]

| Requirement | Source | Covered By |
|-------------|--------|------------|
| Reproduction step 1 (defect repro) | Bug ticket § Steps to Reproduce | [TS-01](scenarios/TS-01_<Slug>.md) |
| Adjacent area X (regression) | Bug ticket § Comments | [TS-02](scenarios/TS-02_<Slug>.md) |
```

### Step 7: Risk Register (lite)

Optional but recommended for bug fixes that touch shared code paths or have customer-visible impact. Output as `test_design/risk_register.md`:

```markdown
# Risk Register — [PROJECT_ID]

| Scenario | Risk Level | Notes |
|----------|-----------|-------|
| [TS-XX](scenarios/TS-XX_<Slug>.md) | High/Medium/Low | [Why] |
```

If the bug is purely cosmetic or contained to a small surface, omit the risk register entirely — note that in `03_Test_Strategy.md` § 3.5 Companion Artifacts.

### Step 8: Overlap Sweep

Even for 2-4 scenarios, run the overlap-review prompt — bugs often re-test paths that adjacent scenarios already cover. See `skills/planning-tests/references/overlap-review.md`.

### Step 9: Environment Rules Check

Confirm `03_Test_Strategy.md` describes environment **capability**, not specific instances. Specifics belong in `config/`. See `skills/planning-tests/references/environment-rules.md`.

> **Skipped for bug fix plans (Focused profile):**
> - Entry/exit criteria — implicit (defect verified + regression passes)
> - Diagrams — bug fixes rarely need them; add only if the fix touches a multi-step flow
> - Hybrid depth strategy — bug fixes don't have variants in the feature sense

---

## OUTPUT FORMAT

### File Structure

```
test_plan/
├── README.md                          # Index with metadata + linked TOC
├── sections/
│   ├── 01_Problem_Context.md          # § 1.1-1.3
│   ├── 02_Test_Scope.md               # § 2.1-2.3
│   ├── 03_Test_Strategy.md            # § 3.1-3.5 (lean: approach, data, depth (rare), entry/exit (implicit), companion-artifacts pointer)
│   ├── 04_References_Resources.md     # § 4
│   └── 05_Revision_History.md         # § 5
└── test_design/
    ├── scenarios/
    │   ├── README.md                  # Scenario index (Mermaid optional for bugfix)
    │   ├── TS-01_<Slug>.md            # One file per scenario
    │   └── ...
    ├── traceability_matrix.md         # Lite — see Step 6
    └── risk_register.md               # Optional — see Step 7
```

`test_design/` is a sibling of `sections/` under `test_plan/`. See `skills/planning-tests/references/file-layout.md`.

### test_plan/README.md

```markdown
# Test Plan: [Bug Description] ([Bug Ticket ID])

**Test Plan Type:** Bug Fix Validation
**Test Plan Version:** 1.0
**Created:** [Date]
**Last Updated:** [Date]
**QA Engineer:** [Name]
**Bug Ticket:** [TICKET-123](link)
**Related Tickets:** [Links to related bugs if any]
**Target Fix Version:** [Version]
**Severity:** [Critical/High/Medium/Low]

---

## Test Plan Sections

1. [Problem Context](sections/01_Problem_Context.md)
2. [Test Scope](sections/02_Test_Scope.md)
3. [Test Strategy](sections/03_Test_Strategy.md)
4. [References & Resources](sections/04_References_Resources.md)
5. [Revision History](sections/05_Revision_History.md)

---

## Quick Reference

- **Total Test Scenarios:** [N]
- **Estimated Test Cases:** [N]
```

### test_plan/sections/01_Problem_Context.md

```markdown
## 1. Problem Context

### 1.1 Problem Overview
**Customer Issue:** [Brief description]
**Reported By:** [Customer/User identifier]
**Impact:** [Who is affected and how]
**Frequency:** [Always/Intermittent/Edge case]

**Problem Behavior:**
- **Expected:** [What should happen]
- **Actual:** [What currently happens]
- **Root Cause:** [If known]

### 1.2 Reproduction Context
**Environment:** [Where problem occurs]
**Preconditions:** [Setup needed to reproduce]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:** [Correct behavior]
**Current Workaround:** [If any]

### 1.3 Fix Summary
**Component:** [What was fixed]
**Fix Approach:** [How it was fixed]
**Code Changes:** [Link to PR/commit or "Not documented"]
**Fix Version:** [When deployed/planned]
```

### test_plan/sections/02_Test_Scope.md

```markdown
## 2. Test Scope

### 2.1 Defect Verification
[Tests to verify the original problem is fixed]

### 2.2 Regression Testing
[Tests to verify fix didn't break other features]

### 2.3 Edge Case Coverage
[Tests to prevent similar issues]
```

### test_plan/sections/03_Test_Strategy.md (lean)

```markdown
## 3. Test Strategy

### 3.1 Test Approach
- **Test Environment:** [environment requirement; specific tenant in `config/`]
- **Test Focus:** Defect verification, regression, edge cases

### 3.2 Test Data Setup (if non-trivial; otherwise omit)
| Item | Value |
|------|-------|
| Tenant | [capability requirement; specifics in `config/`] |

### 3.3 Hybrid Depth Strategy (rare for bugfixes — omit unless variants exist)

### 3.4 Entry/Exit Criteria (implicit — defect verified + regression passes)

### 3.5 Companion Artifacts

Per ISO/IEC/IEEE 29119-3, the following live as separate artifacts in `test_design/`:

| Artifact | Location | Contents |
|---|---|---|
| Scenario specifications | [`test_design/scenarios/`](../test_design/scenarios/) | One file per TS-XX |
| Requirements Traceability Matrix (lite) | [`test_design/traceability_matrix.md`](../test_design/traceability_matrix.md) | Repro steps + AC items → scenarios |
| Risk Register (optional) | [`test_design/risk_register.md`](../test_design/risk_register.md) | Only if the bug has customer-visible impact or shared-code-path risk |

**Total Test Coverage:** [N] Test Scenarios — [N] estimated test cases.
```

### test_design/scenarios/README.md, TS-XX_<Slug>.md, traceability_matrix.md, risk_register.md

These files follow the same templates as Type A (Feature). See `/tw-plan-feature` Steps 6-9 and the `skills/planning-tests/references/` directory for full templates and conventions. Bug-fix scenarios usually have a Reproduction Steps preamble; embed it as the optional preamble line per the scenario header convention.

### test_plan/sections/04_References_Resources.md

```markdown
## 4. References & Resources

| Resource | Link |
|----------|------|
| **Bug Ticket** | [Link] |
| **Related Bugs** | [Links] |
| **Component Documentation** | [If available] |
```

### test_plan/sections/05_Revision_History.md

```markdown
## 5. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | [Name] | Initial bug fix test plan |
```

---

## NEXT STEP

After creating the test plan, run `/tw-plan-review` to verify coverage.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW CONTINUATION                         │
└─────────────────────────────────────────────────────────────────┘

/tw-plan-init
    └── Detected Type B: Bug Fix
                              ↓
/tw-plan-bugfix  ◄── YOU ARE HERE
    └── Creates test_plan/README.md + test_plan/sections/*.md
                              ↓
/tw-plan-review
    └── Reviews test plan for completeness
                              ↓
/tw-case-init
    └── Routes to /tw-case-bugfix
```
```
