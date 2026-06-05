# Test Plan Review

Review test plan for completeness, gaps, and overlaps before creating test cases.

## Purpose

Analyze the test plan to:
1. Identify coverage gaps in test scenarios
2. Identify overlaps and redundancies
3. Generate coverage matrix
4. **Generate diagrams for features with 5+ scenarios**
5. Recommend improvements BEFORE test case creation

## Prerequisites

- `test_plan/README.md` and `test_plan/sections/` exist (created by `/tw-plan-*` commands)
- Fallback: If `test_plan/sections/` does not exist, read `test_plan/README.md` directly

**If test plan is missing:**
```
Ask user: "Please run /tw-plan-init first to create the test plan."
STOP - Cannot proceed without test plan
```

## When to Use

- **After** running `/tw-plan-feature`, `/tw-plan-bugfix`, or `/tw-plan-enhance`
- **Before** running `/tw-case-init`
- When updating an existing test plan
- When test suite feels incomplete or bloated

## Review Profiles

The review depth is **auto-detected** from the test plan type. The user can override by specifying a profile explicitly.

| Check | Feature (Full) | Enhancement (Standard) | Bug Fix (Focused) |
|-------|:-:|:-:|:-:|
| Coverage Matrix (Step 3) | Yes | Yes | Yes |
| Gap & Overlap Analysis (Step 5) | Yes | Yes | Yes |
| Hybrid Depth Strategy (Step 6) | Yes | Yes | Yes |
| Diagrams (Step 4) | 5+ scenarios | 5+ scenarios | Skip |
| Requirements Traceability (Step 7) | Yes | Yes | Skip |
| Entry/Exit Criteria (Step 8) | Yes | Yes | Skip |
| Risk Assessment (Step 9) | Full | Lite | Skip |
| Recommendations (Step 10) | Yes | Yes | Yes |

## Agent Instructions

### Step 1: Read Test Plan and Detect Profile

Read the test plan index and section files:

```
1. Read test_plan/README.md for type and quick reference
2. Identify test plan type and review profile:
   - "New Feature Validation" → Full profile (comprehensive review)
   - "Bug Fix Validation" → Focused profile (targeted review)
   - "Enhancement Validation" → Standard profile (hybrid review)
3. Announce detected profile: "Review profile: [Full/Standard/Focused]"
4. Read all files in test_plan/sections/
5. Extract test scenarios — layout-aware:
   IF test_plan/test_design/scenarios/ exists (new layout):
     - Read each test_plan/test_design/scenarios/TS-XX_*.md file
     - Each file's metadata header gives the Focus and Estimated test cases
     - The intro paragraph + optional `## Scenario Preconditions` block establish the shared context
     - Each `### Case N:` block (Objective + Checkpoints mandatory; Preconditions + Notes optional) is the source of truth for that case
   ELSE (legacy layout):
     - Feature/Enhancement: sections/04_Test_Strategy.md § 4.4 / § 4.2
     - Bug Fix: sections/03_Test_Strategy.md § 3.2
6. For each scenario, note:
   - Scenario ID and name
   - Focus area
   - Estimated test case count
   - Per-case Objective + Checkpoints (use these for the coverage matrix; ignore Steps if any — those belong in the test cases)
```

> **Fallback:** If `test_plan/sections/` does not exist, read `test_plan/README.md` directly.

### Step 2: Analyze Coverage [All Profiles]

For each test scenario, identify which aspects it covers. Select only the aspects relevant to the feature under test — omit aspects that do not apply. If fewer than 5 aspects apply, note this in the summary.

| Coverage Aspect | Description | Typical Applicability |
|-----------------|-------------|----------------------|
| UI Configuration | Tests that configure via user interface | Most features |
| API Configuration | Tests that configure via API | API-facing features |
| Data Flow | How data moves through the system | Data pipeline features |
| Error Handling | Invalid inputs, edge cases, failures | Most features |
| Backward Compatibility | Existing functionality still works | Enhancements, migrations |
| Client/End-user Validation | End-to-end user scenarios | User-facing features |
| Feature Flags | ON/OFF state behavior | Gated rollouts only |
| Edge Cases | Boundary conditions, empty/max states | Most features |
| Performance | Response time, throughput | Scale-sensitive features |
| Accessibility | WCAG compliance, keyboard navigation | UI features only |

### Step 3: Generate Coverage Matrix (on demand) [All Profiles]

The coverage matrix is **no longer authored as a separate artifact** — it's a derivative of the requirements traceability matrix (`test_design/traceability_matrix.md` in the new layout). See `skills/planning-tests/references/file-layout.md`.

For review purposes, generate one **on demand** if a reviewer specifically asks. Format:

```
┌────────────────────────┬───────┬───────┬───────┬───────┬───────┐
│ Test Aspect            │ TS-01 │ TS-02 │ TS-03 │ TS-04 │ TS-05 │
├────────────────────────┼───────┼───────┼───────┼───────┼───────┤
│ UI Configuration       │   ✓   │       │       │   ✓   │       │
│ API Configuration      │       │       │   ✓   │       │       │
│ Error Handling         │       │   ✓   │       │       │       │
│ Backward Compatibility │       │       │       │   ✓   │       │
│ Edge Cases             │       │       │       │       │   ✓   │
└────────────────────────┴───────┴───────┴───────┴───────┴───────┘
```

Output as part of the review report. Do NOT save it back into `04_Test_Strategy.md` or anywhere else under `test_plan/`.

### Step 4: Generate Diagrams (For 5+ Scenarios) [Full / Standard]

Generate diagrams following the templates defined in `/tw-diagrams`. Include Configuration Flow, Data Flow, and Modular Test Design diagrams as appropriate.

**Diagram Selection Guide:**

| Scenario Count | Diagrams to Generate |
|----------------|---------------------|
| 1-3 scenarios | Coverage Matrix only |
| 5+ scenarios | Run `/tw-diagrams` for all diagram types |

### Step 5: Identify Issues [All Profiles]

Report any issues found:

**Gaps:**
- Aspects not covered by any test scenario
- Missing error handling tests
- Missing edge case coverage
- Missing integration tests

**Overlaps (mandatory overlap sweep):**

For each scenario, apply the prompt:

> *List any case in this scenario whose object-under-test or assertion overlaps another scenario's case. Note as: layered (justified) or duplicate (fix).*

For every flagged pair, record:
- TS-X case N ⟷ TS-Y case M
- object-under-test
- layered (justified) vs duplicate (fix)
- recommended resolution (keep both | merge | move to TS-X | delete from TS-Y)

See `skills/planning-tests/references/overlap-review.md` for the layered-vs-duplicate decision rule and examples from past reviews.

Common overlap shapes:
- Multiple scenarios testing the same aspect
- Redundant test activities
- Duplicated coverage between a "deep representative" scenario and a "wide variants" scenario when the latter re-runs the full case-set per variant instead of just placement + happy path

**Recommendations:**
- Scenarios to consolidate
- New scenarios to add
- Test activities to move or remove

### Step 6: Apply Hybrid Depth Strategy [All Profiles]

Check if the feature has variants (multiple types, modes, configurations):

1. Identify the **representative case** for full verification
   - The representative case is the scenario that covers the most coverage aspects in the matrix (Step 3)
   - If tied, choose the scenario with the most complex or highest-risk user path
   - This scenario gets deep, comprehensive testing

2. Identify **variants** for lightweight validation
   - Variants are scenarios that differ by only 1-2 configuration parameters from the representative case
   - These get configuration + basic functionality tests only

3. Recommend which scenarios should be "deep" vs "wide"

### Step 7: Requirements Traceability [Full / Standard]

Verify that test scenarios trace back to requirements:

```
1. List all requirements/acceptance criteria from:
   - test_plan/sections/ (scope and feature definition sections)
   - confluence/HLD_*.md files in the project folder (if they exist)
   - Jira ticket acceptance criteria (use Atlassian MCP tools if needed)

2. For each requirement, verify at least one scenario covers it

3. Flag requirements with no scenario coverage

4. Flag scenarios that don't trace to any requirement
   (may indicate scope creep or undocumented requirements)
```

> **Skip for Focused (Bug Fix):** Bug fix scenarios trace to the defect description, not requirements.

### Step 8: Entry/Exit Criteria [Full / Standard]

Check that the test plan defines clear start and done conditions:

```
Entry Criteria (when can testing start?):
- [ ] Build/deployment prerequisites defined
- [ ] Test environment requirements specified
- [ ] Test data requirements identified
- [ ] Dependencies on other teams/features noted

Exit Criteria (when is testing done?):
- [ ] Pass/fail thresholds defined (e.g., "100% P0 pass, 90% P1 pass")
- [ ] Defect resolution criteria stated
- [ ] Sign-off process described
```

> **Skip for Focused (Bug Fix):** Bug fix testing has implicit criteria — the defect is verified fixed and regression passes.

### Step 9: Risk Assessment [Full / Standard-Lite]

Assess testing risks at the scenario level:

```
For each scenario, evaluate:
- Likelihood of failure (based on complexity, novelty, dependencies)
- Impact if defect escapes (user-facing? data loss? security?)

Full profile: Create risk matrix table
Standard profile (Lite): Flag only high-risk scenarios
```

**Risk levels:**

| Risk | Criteria |
|------|----------|
| **High** | New technology, complex integration, user-facing with no rollback |
| **Medium** | Modified existing flow, has partial rollback, affects subset of users |
| **Low** | Well-understood path, easy rollback, internal-only impact |

### Step 10: Provide Recommendations [All Profiles]

Based on analysis, provide specific recommendations:

1. **Immediate fixes** - Issues to address before creating test cases
2. **Scenario adjustments** - Merge, split, or reorder scenarios
3. **Coverage additions** - Missing aspects to add
4. **Optimization** - Ways to reduce overlap

---

## Output Format

```markdown
# Test Plan Review: [Feature Name]

## Summary
- **Review Profile:** Full / Standard / Focused
- **Test Plan Type:** [New Feature / Bug Fix / Enhancement]
- **Total Scenarios:** X
- **Total Estimated Test Cases:** Y
- **Coverage Score:** Good / Fair / Needs Improvement

## Coverage Matrix

┌────────────────────────┬───────┬───────┬───────┐
│ Test Aspect            │ TS-01 │ TS-02 │ TS-03 │
├────────────────────────┼───────┼───────┼───────┤
│ [Aspect 1]             │   ✓   │       │   ✓   │
│ [Aspect 2]             │       │   ✓   │       │
│ [Aspect 3]             │   ✓   │   ✓   │       │
└────────────────────────┴───────┴───────┴───────┘

## Diagrams (For 5+ Scenarios) [Full / Standard only]

[Include Configuration Flow, Data Flow, and Modular Design diagrams]

## Gaps Identified

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| [Gap 1] | [High/Medium/Low] | [How to address] |
| [Gap 2] | [High/Medium/Low] | [How to address] |

## Overlaps Found

| Overlap | Scenarios | Recommendation |
|---------|-----------|----------------|
| [Overlap 1] | TS-01, TS-03 | [Consolidate/Remove] |

## Modular Design Assessment

| Category | Scenarios | Purpose |
|----------|-----------|---------|
| **Core** | TS-XX | Primary functionality validation |
| **Integration** | TS-XX, TS-XX | Component interactions |
| **Compatibility** | TS-XX | Backward compatibility |
| **Edge Cases** | TS-XX | Boundary conditions |

## Requirements Traceability [Full / Standard only]

| Requirement | Source | Covered By | Status |
|-------------|--------|------------|--------|
| [Requirement 1] | HLD § X.X | TS-01, TS-02 | Covered |
| [Requirement 2] | Jira AC #3 | — | **Not covered** |
| [Requirement 3] | Scope § X.X | TS-03 | Covered |

## Entry/Exit Criteria Assessment [Full / Standard only]

| Criteria Type | Defined? | Notes |
|---------------|----------|-------|
| Build prerequisites | Yes / No | [Details] |
| Test environment | Yes / No | [Details] |
| Pass/fail thresholds | Yes / No | [Details] |
| Sign-off process | Yes / No | [Details] |

## Risk Assessment [Full / Standard-Lite]

| Scenario | Risk Level | Likelihood | Impact | Mitigation |
|----------|-----------|------------|--------|------------|
| TS-01 | High | Complex integration | User-facing | Deep testing, extra review |
| TS-02 | Medium | Modified flow | Subset of users | Standard coverage |
| TS-03 | Low | Well-understood | Internal only | Lightweight validation |

## Hybrid Depth Strategy

| Scenario | Depth | Rationale |
|----------|-------|-----------|
| TS-01 | Deep | Representative case - full verification |
| TS-02 | Wide | Variant - lightweight validation |
| TS-03 | Deep | Critical path - comprehensive |

## Recommendations

### Immediate Actions (Before Test Case Creation)
1. [Specific recommendation with scenario reference]
2. [Specific recommendation with scenario reference]

### Optional Improvements
1. [Nice-to-have improvement]
2. [Nice-to-have improvement]

## Overall Assessment

**Status:** READY FOR TEST CASES / NEEDS REVISION

[Brief summary of overall test plan quality and readiness]

---

## Next Steps

1. Address immediate action items (if any)
2. Run `/tw-case-init` to start creating detailed test cases
3. After test cases created, run `/tw-case-review` to verify quality
```

---

## Example Usage

```
User: /tw-plan-review
(project: active/PROJ-12345_User_Session_Management/)

Agent:
1. Reads test_plan/README.md → "New Feature Validation", 8 scenarios
2. Announces: "Review profile: Full"
3. Produces report:

   ## Summary
   - **Review Profile:** Full
   - **Test Plan Type:** New Feature Validation
   - **Total Scenarios:** 8
   - **Total Estimated Test Cases:** 32
   - **Coverage Score:** Good

   ## Coverage Matrix
   ┌────────────────────┬───────┬───────┬───────┬─────┐
   │ Test Aspect        │ TS-01 │ TS-02 │ TS-03 │ ... │
   ├────────────────────┼───────┼───────┼───────┼─────┤
   │ UI Configuration   │   ✓   │   ✓   │       │     │
   │ Error Handling     │       │       │   ✓   │     │
   │ Edge Cases         │       │       │       │  ✓  │
   └────────────────────┴───────┴───────┴───────┴─────┘

   ## Gaps Identified
   | Gap | Impact | Recommendation |
   |-----|--------|----------------|
   | No API config scenario | Medium | Add TS-09 for API-based scheduling |

   ## Hybrid Depth Strategy
   | Scenario | Depth | Rationale |
   |----------|-------|-----------|
   | TS-01 | Deep | Covers 5/6 aspects — representative case |
   | TS-08 | Wide | Differs from TS-01 only by dual network type |

   **Status:** READY FOR TEST CASES
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
                              ↓
              ┌───────────────────────────────┐
              │  /tw-plan-review  ◄── YOU     │
              │  Reviews test plan quality    │
              │  Profile-scaled depth         │
              └───────────────────────────────┘
                              ↓
/tw-case-init → /tw-case-[feature|bugfix|enhance]
    └── Creates test_cases/README.md + TS-XX_*.md files

/tw-case-review
    └── Reviews test case quality + recommends priorities

/tl-sync
    └── Syncs test cases to TestLink
```

---

## Tips for Reviewers

### 1. Check for Complete Coverage
- Every major feature should have at least one scenario
- Error handling should be explicitly covered
- Edge cases should not be afterthoughts

### 2. Check for Appropriate Depth
- Bug fix test plans: 2-4 focused scenarios
- Enhancement test plans: 4-6 scenarios
- New feature test plans: 5-8+ scenarios

### 3. Check Test Activity Quality
- Activities should be specific, not vague
- Good: "Test grouping threshold at 9, 10, 11 items"
- Bad: "Test various amounts"

### 4. Check Scenario Organization
- Related activities should be grouped together
- Each scenario should have a clear focus
- Avoid "catch-all" scenarios with unrelated tests
