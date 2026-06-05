# Test Workflow Templates

Shared templates and guidelines referenced by all test workflow commands.

```
This file contains reusable templates for test planning and test case creation.
Reference this file when you need standard formats.

{{input}}

---

## DECISION TREES: HANDLING MISSING INFORMATION

### No Confluence HLD Found (Type A)
```
IF no HLD in confluence/ folder:
  1. Check Main Ticket description for technical details
  2. Check UX ticket for feature definition
  3. Check README.md for feature summary
  4. Ask user for Confluence link or proceed without
  5. If proceeding without:
     - Use ticket descriptions as primary source
     - Note: "HLD not available - based on ticket descriptions"
  6. Continue with available information
```

### No Clear Reproduction Steps (Type B)
```
IF no reproduction steps in bug ticket:
  1. Check all comments for "repro", "steps", "reproduce"
  2. Check README.md problem summary
  3. Check related bug tickets
  4. Ask user or create general tests
  5. Note: "Reproduction steps not documented"
  6. Continue with broader coverage
```

### No Test Environment Info
```
IF no test environment details:
  1. Check confluence docs for environment info
  2. Check README.md for references
  3. Use reasonable defaults:
     - Environment: "QA/Staging environment"
     - Browser: "Chrome latest, 1920x1080+"
  4. Note: "Test environment details TBD"
  5. Continue without blocking
```

### Unclear Feature Scope
```
IF feature scope is ambiguous:
  1. Check HLD "In Scope" / "Out of Scope" sections
  2. Check acceptance criteria
  3. Ask user specific questions
  4. Document assumptions with "ASSUMPTION:" prefix
  5. Continue with documented assumptions
```

---

## COMMON SENSE GUIDELINES

### 1. Don't Block on Minor Details
- Missing stakeholder name? Use "[TBD]" and continue
- Missing performance numbers? Estimate reasonably
- No design link? Describe from text descriptions
- **Principle:** Complete plan with documented gaps > incomplete plan

### 2. Prioritize Actionable Information
- Focus on WHAT to test (operations, behaviors)
- Be specific: "Threshold Testing (9, 10, 11 items)" not "Test various amounts"
- **Principle:** QA should understand exactly what to test

### 3. Make Reasonable Assumptions (Document Them)
- Document assumptions with "ASSUMPTION:" prefix
- Example: "ASSUMPTION: Feature only affects logged-in users"

### 4. Adapt Test Depth to Context
- **Type A (New Feature):** 5-8 test scenarios, 20-40 test cases
- **Type B (Bug Fix):** 2-4 test scenarios, 8-15 test cases
- **Type C (Enhancement):** 4-6 test scenarios, 15-25 test cases

### 5. Be Specific in Test Operations
- **Good:** "Create 100+ notifications to test grouping threshold"
- **Bad:** "Test various notification scenarios"

### 6. Test Independence
- Each test should run standalone
- Don't rely on previous test's data or state
- Include all setup in preconditions

---

## OUTPUT TEMPLATES

### Test Plan Header Template

```markdown
# Test Plan: [Name] ([Ticket ID])

**Test Plan Type:** [New Feature / Bug Fix / Enhancement] Validation
**Test Plan Version:** 1.0
**Created:** [Date]
**Last Updated:** [Date]
**QA Engineer:** [Name]
**[Epic/Bug/Enhancement] Ticket:** [Link]
**Target Release:** [Date]
**Feature Flag:** `[flag-name]` (if applicable)
```

### Test Scenario Table Template

```markdown
| ID | Test Scenario | Focus | Est. Cases | Test Activities |
|----|---------------|-------|------------|-----------------|
| **TS-01** | [Name] | [Focus] | [N] | • [Activity 1]<br>• [Activity 2] |
| **TS-02** | [Name] | [Focus] | [N] | • [Activity 1]<br>• [Activity 2] |
```

### Test Case File Header Template

Each metadata label must be its own paragraph (blank line between). Stacking consecutive `**Label:**` lines without a blank line causes the markdown converter to render the whole block as a single `<p>` with `<br/>` separators, fusing the metadata visually with whatever follows. See `skills/reviewing-typography/references/typography-principles.md` anti-pattern A1.

```markdown
# TS-XX: [Scenario Name]

**Focus:** [Test type - Functional, UI/UX, etc.]

**Test Cases:** [Count]

**Test Plan Reference:** test_plan/sections/[Section_File].md § X.X, TS-XX

---

**Objective:** [Copy from test plan — keep as its own paragraph after the divider; maps to TestLink Suite Details on sync]
```

### Test Case Template

**Do NOT add `**Priority:**` or `**Test Type:**` to the markdown.** Priority and Test Type are managed in TestLink (per `/tw-case-review` Step 7 — Priority Recommendation runs against the markdown files and feeds TestLink; the values themselves don't live in markdown). Only `**Execution Type:**` belongs in the file (it's the markdown-to-TestLink mapping per the table below).

```markdown
## TC-XX: [Descriptive Name]

**Objective:**
[What this test case validates]

**Preconditions:**
- [Only non-default requirements]
- [Specific test data needed]

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | [Specific action] | [Measurable result] |
| 2 | [Next action] | [Expected outcome] |

**Execution Type:** Manual
```

### Test Case Summary Table Template

```markdown
## Summary

| TC ID | Name | Priority | Type |
|-------|------|----------|------|
| TC-01 | [Name] | P0 | [Type] |
| TC-02 | [Name] | P1 | [Type] |
```

---

## PRIORITY GUIDELINES

### P0 (Critical - Must Pass)
- Core functionality
- Defect verification (bug fixes)
- Feature flag ON behavior
- Happy path scenarios

### P1 (High - Should Pass)
- Important variations
- Regression tests
- Common user scenarios
- Feature flag OFF behavior

### P2 (Medium - Nice to Have)
- Edge cases
- Rare scenarios
- Nice-to-have validations

---

## TEST CASE VARIATION TYPES

Create variations based on:

### Volume
- Small: 2-3 items (basic functionality)
- Medium: 10-20 items (typical usage)
- Large: 50-100+ items (stress test)
- Edge: 0 items (empty), 1 item (minimum), max limit

### State
- Enabled / Disabled
- Partial / Full
- Loading / Complete
- Error / Success

### Data
- Valid / Invalid
- Boundary values
- Special characters
- Null / Empty

### User Context
- Different roles
- Different permissions
- Different states (logged in, logged out)

---

## TESTLINK FIELD MAPPING

| Markdown Element | TestLink Field |
|------------------|----------------|
| `# TS-XX: [Name]` | Test Suite Name |
| File `**Objective:**` | Suite Details |
| `## TC-XX: [Name]` | Test Case Name |
| TC `**Objective:**` | Summary |
| `**Preconditions:**` | Preconditions (HTML) |
| Test Steps table | Steps |
| `**Execution Type:**` | Execution Type (1=Manual) |

### HTML Formatting for TestLink

```html
<ul>
    <li>Item using &gt; for greater than</li>
    <li>Item using &lt; for less than</li>
    <li>Item using &quot; for quotes</li>
</ul>
```

---

## WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE TEST WORKFLOW                        │
└─────────────────────────────────────────────────────────────────┘

/jr-trace [TICKET]
    └── Creates project structure
                              ↓
/tw-plan-init
    └── Detects type, verifies prereqs
                              ↓
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
  /tw-plan-feature     /tw-plan-bugfix     /tw-plan-enhance
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ↓
/tw-plan-review
    └── Reviews test plan, runs overlap sweep, generates coverage on demand
                              ↓
/tw-case-init
    └── Detects type, routes to case workflow
                              ↓
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
  /tw-case-feature     /tw-case-bugfix     /tw-case-enhance
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ↓
/tw-case-review
    └── Reviews test case quality
                              ↓
/tl-sync
    └── Syncs to TestLink
```
```
