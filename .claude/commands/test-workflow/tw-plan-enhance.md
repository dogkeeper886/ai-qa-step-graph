# Test Plan: Enhancement (Type C)

Create a test plan for enhancement/improvement testing.

```
Use this command for enhancements and improvements to existing features.
This creates test_plan/README.md + test_plan/sections/*.md with 4-6 test scenarios.

{{input}}

## PURPOSE

Create a hybrid test plan for enhancements:
- Enhancement context and changes
- New/changed functionality validation
- Integration impact assessment
- Moderate test scenarios (4-6 typical)

AUDIENCE: QA Engineers, Developers, Product Team

---

## INFORMATION GATHERING PRIORITY

**PRIMARY SOURCES:**
1. **Enhancement Ticket** (`00_Main_Task_*.md`) - What's being improved
2. **README.md** - Enhancement summary
3. **Confluence Docs** (if any) - Enhancement specs

**SECONDARY SOURCES:**
4. **Original Feature Docs** - Existing functionality documentation
5. **Related Tickets** - Original feature implementation
6. **Comments** - Enhancement rationale, design decisions

---

## HYBRID APPROACH

Enhancements require testing BOTH:
- **New/Changed Functionality** → Use Type A approach (feature testing)
- **Existing Functionality Impact** → Use Type B approach (regression testing)

---

## STEP-BY-STEP WORKFLOW

### Step 1: Understand the Enhancement

**Questions to ask:**
- What existing feature is being enhanced?
- What is new or changed?
- Why is this enhancement needed?
- What is the expected impact on users?

**Extract into template:**
```markdown
### 1.1 Enhancement Overview
**What's Being Enhanced:** [Existing feature name]
**Enhancement Summary:** [What's changing/being added]
**Business Value:** [Why this enhancement]
**Requested By:** [Customer/Internal]
```

### Step 2: Identify What's New vs Changed

**Questions to ask:**
- What behaviors are completely new?
- What existing behaviors are modified?
- What stays the same?
- What configuration options changed?

**Extract into template:**
```markdown
### 2.1 New/Changed Functionality
**What's New:**
- [New behavior 1]
- [New behavior 2]

**What's Changed:**
- [Changed behavior 1]
- [Changed behavior 2]

**What's Unchanged:**
- [Existing behavior 1]
- [Existing behavior 2]
```

### Step 2.5: Visual Baseline Check

Before assessing impact, verify the current UI for the area being enhanced.

**Ask the user:** "Can I open the browser to see the current state of the feature being enhanced?"

```
IF live environment available:
  → Open browser and navigate to the affected UI area
  → Capture screenshots of the CURRENT state (before enhancement)
  → This becomes the baseline for "what changed" verification
  → Save to test_plan/visual_baseline/

IF wireframes/mockups exist in HLD:
  → Review embedded images to understand the target state
  → Compare current vs target to identify visual changes

IF neither available:
  → Flag: "No visual baseline captured — verify UI changes manually during test case design"
```

### Step 3: Assess Integration Impact

**Questions to ask:**
- What components interact with this feature?
- What API changes are involved?
- What downstream effects might occur?
- What backward compatibility concerns exist?

### Step 4: Define Test Scope

**Enhancement Validation:**
- Test new functionality works as specified
- Test changed functionality behaves correctly
- Test configuration changes are applied

**Integration Impact:**
- Test component interactions
- Test API compatibility
- Test backward compatibility

**Regression Testing:**
- Test unchanged functionality still works
- Test adjacent features not affected

### Step 5: Create Test Scenarios

For enhancements, typically create 4-6 scenarios. Each scenario gets its own file under `test_design/scenarios/`.

**Output location:**
- One file per scenario: `test_design/scenarios/TS-XX_<Slug>.md`
- Index file: `test_design/scenarios/README.md` (lists all TS-XX, includes Mermaid flow diagrams from Step 10)

Typical scenario shape for an enhancement:

```
| ID | Scenario | Focus | Est. Cases |
|---|---|---|---|
| TS-01 | Enhancement Verification | New behavior | 4-6 |
| TS-02 | Configuration Changes | Settings | 2-4 |
| TS-03 | Integration Impact | Component interactions | 2-4 |
| TS-04 | Backward Compatibility | Existing behavior | 2-3 |
```

Every TS-XX file follows the uniform metadata header, an optional Scenario Preconditions block, and a `### Case N:` block per case (Objective + Checkpoints mandatory; Preconditions + Notes optional). Click-by-click steps belong in test cases, not scenarios. See `skills/planning-tests/references/scenario-conventions.md`.

**Scenario organization note:** When the enhancement is substantial (adding new user workflows), apply the user-journey methodology from `/tw-plan-feature` Step 5 to organize scenarios around user journeys rather than technical components.

---

## DECISION TREES: HANDLING MISSING INFORMATION

### No Original Feature Documentation
```
IF original feature docs not available:
  1. Check README.md for feature summary
  2. Check related tickets for context
  3. Ask user: "Can you describe the existing functionality being enhanced?"
  4. Create test plan based on enhancement ticket + user input
  5. Note: "Original feature documentation not available"
```

### Unclear Enhancement Scope
```
IF enhancement scope is ambiguous:
  1. Check enhancement ticket acceptance criteria
  2. Check for design documents
  3. Ask user specific questions:
     - "What specific behaviors are changing?"
     - "What should remain unchanged?"
  4. Document assumptions clearly
```

---

## BEST PRACTICE SECTIONS (Standard Profile)

After finalizing test scenarios (Step 5), produce the following companion artifacts. These align with what `/tw-plan-review` checks at the Standard profile level.

The legacy "Coverage Matrix" section is **dropped** — it's a derivative of the traceability matrix and adds no information beyond it. See `skills/planning-tests/references/file-layout.md`.

### Step 6: Hybrid Depth Strategy

If the enhancement has variants:

1. **Identify the representative case** — the scenario covering the broadest set of behaviors. This gets deep testing.
2. **Identify variants** — scenarios differing by only 1-2 parameters. These get lightweight validation only.
3. Document which scenarios are "deep" vs "wide" in `04_Test_Strategy.md` § 4.5.

### Step 7: Requirements Traceability

Map each requirement/acceptance criterion to test scenarios. Output as a **standalone artifact** at `test_design/traceability_matrix.md` — not inlined in the strategy file.

```
1. List requirements from:
   - Enhancement Definition (§ 2.1-2.2)
   - Test Scope (§ 3.1-3.3)
   - Enhancement ticket acceptance criteria
2. For each requirement, note which scenario(s) cover it
3. Flag uncovered requirements
4. Add a "Coverage Gaps" subsection for items the source documents don't specify
```

`test_design/traceability_matrix.md` template:

```markdown
# Requirements Traceability Matrix — [PROJECT_ID]

## Coverage

| Requirement | Source | Covered By |
|-------------|--------|------------|
| [Req 1] | Enhancement ticket AC #1 | [TS-01](scenarios/TS-01_<Slug>.md) |
| [Req 2] | § 2.1 New Functionality | [TS-01](scenarios/TS-01_<Slug>.md), [TS-02](scenarios/TS-02_<Slug>.md) |
| [Req 3] | § 3.3 Backward Compat | [TS-04](scenarios/TS-04_<Slug>.md) |

## Coverage Gaps

- [Items the source documents don't specify but QA observed in the live build]
```

### Step 8: Entry/Exit Criteria

Add to `04_Test_Strategy.md` § 4.6:

```markdown
### 4.6 Entry/Exit Criteria

**Entry Criteria:**
- [ ] Enhancement deployed to test environment
- [ ] Existing feature baseline verified
- [ ] Test data provisioned

**Exit Criteria:**
- [ ] 100% P0 test cases pass
- [ ] ≥90% P1 test cases pass
- [ ] No regression in existing functionality
```

### Step 9: Risk Assessment

For enhancements, pay special attention to:
- Backward compatibility risks
- Integration breakage risks
- Data migration risks

Output as a **standalone artifact** at `test_design/risk_register.md` — not inlined in the strategy file.

`test_design/risk_register.md` template:

```markdown
# Risk Register — [PROJECT_ID]

| Scenario | Risk Level | Likelihood | Impact | Mitigation |
|----------|-----------|------------|--------|------------|
| [TS-XX](scenarios/TS-XX_<Slug>.md) | High | [Likelihood] | [Why high impact] | [Mitigation] |
```

### Step 10: Diagrams (5+ Scenarios)

If the test plan has 5 or more scenarios, run `/tw-diagrams` to generate Mermaid flow diagrams. Place them at the top of `test_design/scenarios/README.md` (the scenario index), labeled with the TS-XX each node belongs to.

### Step 11: Overlap Sweep

After scenarios + traceability + risk register are written, run an overlap review against every scenario. The prompt:

> *List any case in this scenario whose object-under-test or assertion overlaps another scenario's case. Note as: layered (justified) or duplicate (fix).*

See `skills/planning-tests/references/overlap-review.md`.

### Step 12: Environment Rules Check

Confirm `04_Test_Strategy.md` § 4.3 and § 4.4 describe environment **capability**, not specific instances. Specific tenant names, credentials, and hardware serials belong in `config/`. See `skills/planning-tests/references/environment-rules.md`.

---

## OUTPUT FORMAT

### File Structure

```
test_plan/
├── README.md                              # Index with metadata + linked TOC
├── sections/
│   ├── 01_Enhancement_Context.md          # § 1.1-1.2
│   ├── 02_Enhancement_Definition.md       # § 2.1-2.2
│   ├── 03_Test_Scope.md                   # § 3.1-3.3
│   ├── 04_Test_Strategy.md                # § 4.1-4.7 (lean: levels/types if non-trivial, approach, data, depth, entry/exit, companion-artifacts pointer)
│   ├── 05_References_Resources.md         # § 5
│   └── 06_Revision_History.md             # § 6
└── test_design/
    ├── scenarios/
    │   ├── README.md                      # Scenario index + Mermaid flow diagrams
    │   ├── TS-01_<Slug>.md                # One file per scenario
    │   ├── TS-02_<Slug>.md
    │   └── ...
    ├── traceability_matrix.md             # Requirements → scenarios mapping
    └── risk_register.md                   # Per-scenario risk
```

`test_design/` is a sibling of `sections/` under `test_plan/`. See `skills/planning-tests/references/file-layout.md`.

### test_plan/README.md

```markdown
# Test Plan: [Enhancement Name] ([Ticket ID])

**Test Plan Type:** Enhancement Validation
**Test Plan Version:** 1.0
**Created:** [Date]
**Last Updated:** [Date]
**QA Engineer:** [Name]
**Enhancement Ticket:** [TICKET-123](link)
**Target Release:** [Date]
**Feature Flag:** `[flag-name]` (if applicable)

---

## Test Plan Sections

1. [Enhancement Context](sections/01_Enhancement_Context.md)
2. [Enhancement Definition](sections/02_Enhancement_Definition.md)
3. [Test Scope](sections/03_Test_Scope.md)
4. [Test Strategy](sections/04_Test_Strategy.md)
5. [References & Resources](sections/05_References_Resources.md)
6. [Revision History](sections/06_Revision_History.md)

---

## Quick Reference

- **Total Test Scenarios:** [N]
- **Estimated Test Cases:** [N]
```

### test_plan/sections/01_Enhancement_Context.md

```markdown
## 1. Enhancement Context

### 1.1 Enhancement Overview
**What's Being Enhanced:** [Existing feature being improved]
**Enhancement Summary:** [What's changing/being added]
**Business Value:** [Why this enhancement]

### 1.2 Stakeholders
[Key people - may be limited compared to new features]
```

### test_plan/sections/02_Enhancement_Definition.md

```markdown
## 2. Enhancement Definition

### 2.1 New/Changed Functionality
**What's New:**
- [New behavior 1]
- [New behavior 2]

**What's Changed:**
- [Changed behavior 1]
- [Changed behavior 2]

### 2.2 Integration Impact
**Affected Components:**
- [Component 1]
- [Component 2]

**API Changes:**
- [Change 1]
- [Change 2]
```

### test_plan/sections/03_Test_Scope.md

```markdown
## 3. Test Scope

### 3.1 Enhancement Validation
[Tests for new/changed functionality]

### 3.2 Integration Impact
[Tests for component interactions]

### 3.3 Backward Compatibility
[Tests for existing functionality]
```

### test_plan/sections/04_Test_Strategy.md (lean)

```markdown
## 4. Test Strategy

### 4.1 Test Levels (if non-trivial; otherwise omit for enhancements)

### 4.2 Test Types (if non-trivial; otherwise omit)

### 4.3 Test Approach
- **Focus:** Validate enhancement works as specified + no regression
- **Test Environment:** [environment requirement; specific tenant in `config/`]
- **Visual Baseline:** [path to wireframes / live captures]

### 4.4 Test Data Setup
| Item | Value |
|------|-------|
| Tenant | [capability requirement; specifics in `config/`] |
| ... | ... |

### 4.5 Hybrid Depth Strategy

**Deep (representative case):** TS-XX — [reason it's the deep test]

**Wide (variant scenarios):** TS-YY — [what makes them variants]

### 4.6 Entry/Exit Criteria

**Entry Criteria:**
- [ ] Enhancement deployed to test environment
- [ ] Existing feature baseline verified

**Exit Criteria:**
- [ ] 100% P0 pass, ≥90% P1 pass
- [ ] No regression in existing functionality

### 4.7 Companion Artifacts

Per ISO/IEC/IEEE 29119-3, the following live as separate artifacts in `test_design/`:

| Artifact | Location | Contents |
|---|---|---|
| Scenario specifications | [`test_design/scenarios/`](../test_design/scenarios/) | One file per TS-XX |
| Requirements Traceability Matrix | [`test_design/traceability_matrix.md`](../test_design/traceability_matrix.md) | Requirement → scenario mapping |
| Risk Register | [`test_design/risk_register.md`](../test_design/risk_register.md) | Per-scenario risk |

**Total Test Coverage:** [N] Test Scenarios — [N] estimated test cases.
```

### test_design/scenarios/README.md, TS-XX_<Slug>.md, traceability_matrix.md, risk_register.md

These files follow the same templates as Type A (Feature). See `/tw-plan-feature` Steps 6-9 and the `skills/planning-tests/references/` directory for full templates and conventions.

### test_plan/sections/05_References_Resources.md

```markdown
## 5. References & Resources

| Resource | Link |
|----------|------|
| **Enhancement Ticket** | [Link] |
| **Original Feature Documentation** | [Link if available] |
| **Related Tickets** | [Links] |
```

### test_plan/sections/06_Revision_History.md

```markdown
## 6. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | [Name] | Initial enhancement test plan |
```

---

## NEXT STEP

After creating the test plan, run `/tw-plan-review` to verify coverage.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW CONTINUATION                         │
└─────────────────────────────────────────────────────────────────┘

/tw-plan-init
    └── Detected Type C: Enhancement
                              ↓
/tw-plan-enhance  ◄── YOU ARE HERE
    └── Creates test_plan/README.md + test_plan/sections/*.md
                              ↓
/tw-plan-review
    └── Reviews test plan for gaps
                              ↓
/tw-case-init
    └── Routes to /tw-case-enhance
```
```
