# Test Plan File Templates

Markdown templates for the `test_plan/` and `test_design/` files produced by `/tw-plan-feature`, `/tw-plan-enhance`, and `/tw-plan-bugfix`.

See [`file-layout.md`](file-layout.md) for the directory structure rationale. See [`scenario-conventions.md`](scenario-conventions.md) for the TS-XX scenario file template.

---

## `test_plan/README.md`

```markdown
# Test Plan: [Feature Name] ([Epic ID])

**Test Plan Type:** New Feature Validation
**Test Plan Version:** 1.0
**Created:** [Date]
**Last Updated:** [Date]
**QA Engineer:** [Name]
**Epic:** [Link]
**Feature Request:** [Link]
**Target Release:** [Date]
**Feature Flag:** `[flag-name]` (if applicable)

---

## Test Plan Sections

1. [Project & Business Context](sections/01_Project_Business_Context.md)
2. [Feature Definition](sections/02_Feature_Definition.md)
3. [Scope & Boundaries](sections/03_Scope_Boundaries.md)
4. [Test Strategy](sections/04_Test_Strategy.md)
5. [References & Resources](sections/05_References_Resources.md)
6. [Revision History](sections/06_Revision_History.md)

---

## Quick Reference

- **Total Test Scenarios:** [N]
- **Estimated Test Cases:** [N]
```

---

## `test_plan/sections/01_Project_Business_Context.md`

```markdown
## 1. Project & Business Context
### 1.1 Product Overview
### 1.2 Business Value
### 1.3 Stakeholders
```

---

## `test_plan/sections/02_Feature_Definition.md`

```markdown
## 2. Feature Definition
### 2.1 Core Functionality
### 2.2 Feature Control
### 2.3 Non-Functional Requirements
```

---

## `test_plan/sections/03_Scope_Boundaries.md`

```markdown
## 3. Scope & Boundaries
### 3.1 In-Scope Testing
### 3.2 Out of Scope
```

---

## `test_plan/sections/04_Test_Strategy.md` (lean)

```markdown
## 4. Test Strategy

### 4.1 Test Levels
| Level | Approach |
|-------|----------|
| Functional | ... |
| Integration | ... |
| Regression | ... |

### 4.2 Test Types
| Type | Coverage |
|------|----------|
| GUI Testing | ... |
| API Testing | ... |
| End-to-End | ... |

### 4.3 Test Approach
- **Verification Perspective:** Hybrid (Web GUI + API + ...)
- **Test Environment:** [environment requirement; specific tenant in `config/`]
- **Feature Flag:** `<flag-name>` (if applicable)
- **Visual Baseline:** [path to wireframes / live captures]

### 4.4 Test Data Setup
| Item | Value |
|------|-------|
| Tenant | [capability requirement; specifics in `config/`] |
| Networks | ... |
| ... | ... |

### 4.5 Hybrid Depth Strategy

**Deep (representative case):** TS-XX — [reason it's the deep test]

**Wide (variant scenarios):** TS-YY — [what makes them variants]

### 4.6 Entry/Exit Criteria

**Entry Criteria:**
- [ ] Build deployed to test environment
- [ ] Test data provisioned
- [ ] Dependencies available (list specific dependencies)
- [ ] Feature flag enabled (if applicable)

**Exit Criteria:**
- [ ] 100% P0 test cases pass
- [ ] ≥90% P1 test cases pass
- [ ] All P0/P1 defects resolved or deferred with approval
- [ ] Sign-off from QA lead

### 4.7 Companion Artifacts

Per ISO/IEC/IEEE 29119-3, the following live as separate artifacts in `test_design/`:

| Artifact | Location | Contents |
|---|---|---|
| Scenario specifications | [`test_design/scenarios/`](../test_design/scenarios/) | One file per TS-XX with focus, est. cases, activities |
| Requirements Traceability Matrix | [`test_design/traceability_matrix.md`](../test_design/traceability_matrix.md) | Requirement → scenario mapping; coverage gaps |
| Risk Register | [`test_design/risk_register.md`](../test_design/risk_register.md) | Per-scenario risk level, likelihood/impact, mitigation |

**Total Test Coverage:** [N] Test Scenarios — [N] estimated test cases (see scenario index).
```

---

## `test_plan/sections/05_References_Resources.md`

```markdown
## 5. References & Resources
### 5.1 Design & Documentation
```

---

## `test_plan/sections/06_Revision_History.md`

```markdown
## 6. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | [Name] | Initial test plan |
```

---

## `test_design/scenarios/README.md`

```markdown
# Scenario Specifications — [PROJECT_ID]

Per ISO/IEC/IEEE 29119-3, scenarios live separate from the test plan. The plan in `test_plan/sections/04_Test_Strategy.md` describes the strategy, scope, and gates; this directory holds the detailed scenarios.

[One-paragraph note about journey order or organizing principle.]

## Admin Flow

\`\`\`mermaid
flowchart LR
    A[step] --> B[step]
\`\`\`

## End-User Flow

\`\`\`mermaid
flowchart LR
    A[step] --> B[step]
\`\`\`

## Scenario Index

| ID | Scenario | Focus | Est. Cases |
|---|---|---|---|
| [TS-01](TS-01_<Slug>.md) | [Name] | [GUI / API / E2E] | [N] |
| [TS-02](TS-02_<Slug>.md) | [Name] | [Focus] | [N] |

**Total:** [N] estimated test cases.
```

---

## `test_design/scenarios/TS-XX_<Slug>.md`

Each scenario file follows the uniform metadata header, an optional `## Scenario Preconditions` block, and a `### Case N:` block per case (Objective + Checkpoints mandatory; Preconditions + Notes optional). Click-by-click steps belong in the test cases, not the scenarios. See [`scenario-conventions.md`](scenario-conventions.md) for the full authoring guide.

```markdown
# TS-XX: <name>

**Focus:** <GUI / API / E2E / Config / hybrid>

**Estimated test cases:** N

**Test plan reference:** [`test_plan/sections/04_Test_Strategy.md`](../../sections/04_Test_Strategy.md)

---

<intro paragraph — what this scenario owns, what it doesn't, key cross-references. Split into 2-3 short paragraphs at conceptual seams when it crosses 3+ ideas — see `skills/reviewing-typography/references/typography-principles.md` anti-pattern A2.>

## Scenario Preconditions

- <setup that applies to every case>

## Test Cases

### Case 1: <Short imperative title>

- **Objective:** <one sentence — what the case proves>
- **Checkpoints:**
  - <Observable 1>
  - <Observable 2>

### Case 2: <Short imperative title>

- **Objective:** ...
- **Preconditions:** <case-specific, optional>
- **Checkpoints:**
  - ...
- **Notes:** <HLD-silent flags, TKT cross-refs, sequencing hints — optional>
```

---

## `test_design/traceability_matrix.md`

```markdown
# Requirements Traceability Matrix — [PROJECT_ID]

Maps each requirement to the scenario(s) that cover it. Source documents:
[list source HLDs, FRs, review transcripts].

## Coverage

| Requirement | Source | Covered By |
|-------------|--------|------------|
| [Req 1] | HLD § X.X | [TS-01](scenarios/TS-01_<Slug>.md), [TS-02](scenarios/TS-02_<Slug>.md) |
| [Req 2] | Jira AC #3 | [TS-03](scenarios/TS-03_<Slug>.md) |

## Coverage Gaps

- **[Gap description]** — the HLD does not specify [X]. Tested as observed
  (TS-XX); the actual behavior will be captured live for the test plan review.
```

Cross-link from scenario → matrix uses `../traceability_matrix.md` if you want to add reverse references; matrix → scenario uses `scenarios/TS-XX_<Slug>.md` (relative within `test_design/`).

---

## `test_design/risk_register.md`

```markdown
# Risk Register — [PROJECT_ID]

Per-scenario risk assessment. Risk level reflects the joint judgment of
likelihood × impact; mitigation describes the action QA takes during
execution.

| Scenario | Risk Level | Likelihood | Impact | Mitigation |
|----------|-----------|------------|--------|------------|
| [TS-01](scenarios/TS-01_<Slug>.md) | Medium | Moderate | User-facing | Deep testing |
| [TS-02](scenarios/TS-02_<Slug>.md) | Low | Low | Internal | Standard coverage |
```

Risk-level criteria:

| Risk Level | Criteria |
|------------|----------|
| **High** | New technology, complex integration, user-facing with no rollback |
| **Medium** | Modified existing flow, partial rollback, affects subset of users |
| **Low** | Well-understood path, easy rollback, internal-only impact |

Cross-link to scenarios uses `scenarios/TS-XX_<Slug>.md` (relative within `test_design/`).
