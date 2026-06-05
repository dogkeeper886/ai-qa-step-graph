# Test Plan File Layout

The skill produces an ISO/IEC/IEEE 29119-3-aligned tree, splitting the plan into stable artifacts and volatile artifacts.

## Target shape

```
ui_baseline/                          ← captured BEFORE scenarios via /tw-baseline-trace
└── <YYYY-MM-DD>/
    ├── baseline.md                  ← per-page structure + wireframe diff + authoring guidance
    ├── screenshots/<page_slug>.png
    └── snapshots/<page_slug>.yml    ← raw accessibility snapshots

test_plan/
├── README.md
├── sections/
│   ├── 01_Project_Business_Context.md
│   ├── 02_Feature_Definition.md
│   ├── 03_Scope_Boundaries.md
│   ├── 04_Test_Strategy.md         ← lean: levels, types, approach, data, depth, entry/exit
│   ├── 05_References_Resources.md
│   └── 06_Revision_History.md
└── test_design/
    ├── scenarios/
    │   ├── README.md                ← scenario index + Mermaid flow diagrams
    │   ├── TS-01_<name>.md
    │   ├── TS-02_<name>.md
    │   └── ...
    ├── traceability_matrix.md       ← formerly § 4.8
    └── risk_register.md             ← formerly § 4.10
```

The numeric prefixes in `sections/` shift by one between project types (Type A: 1-6, Type B: 1-5, Type C: 1-6) — the "Test Strategy" file is § 4 for Types A and C, § 3 for Type B. The same lean-content rule applies regardless.

## What lives where

### `ui_baseline/<YYYY-MM-DD>/`

**Captured before scenarios are drafted** (via `/tw-baseline-trace`). Holds the live UI state for pages the feature touches:

- `baseline.md` — per-page structure (columns, controls, tabs, wizard steps, form fields) + wireframe diff + authoring guidance for scenarios. Documents which controls are pre-existing behavior (not to retest) and which are feature-flag-gated (route to a flag-gating scenario).
- `screenshots/<page_slug>.png` — visual capture per page
- `snapshots/<page_slug>.yml` — raw accessibility tree per page (useful for grepping later when a column name or button label is needed)

Multiple dated folders may coexist (capture before flag flip, capture after flag flip, capture after a build update). The most recent dated folder is canonical for current planning. The scenario-conventions rule "Don't author regression of pre-existing behavior" reads from the latest `baseline.md`.

### `sections/04_Test_Strategy.md` (or § 3 for Type B)

**Stable** content — reviewed once per project, rarely churns:

- 4.1 Test Levels (Functional / Integration / Regression)
- 4.2 Test Types (GUI / API / E2E / Negative / Backward-Compat / etc.)
- 4.3 Test Approach (verification perspective, environment requirements, visual baseline)
- 4.4 Test Data Setup (per-tenant setup requirements)
- 4.5 Hybrid Depth Strategy (the deep representative + wide variants split)
- 4.6 Entry / Exit Criteria
- 4.7 Companion Artifacts (pointer to `test_design/`)

### `test_design/scenarios/`

**Volatile** — scenarios churn as understanding deepens. Each TS-XX gets its own file. See `scenario-conventions.md` for the required header, optional Scenario Preconditions block, and per-case format (Objective + Checkpoints mandatory; Preconditions + Notes optional). Steps belong in the test cases, not the scenarios.

The directory's `README.md` is the index — it lists every TS-XX with focus + estimated cases, plus Mermaid flow diagrams for the admin and end-user flows.

### `test_design/traceability_matrix.md`

Requirement → scenario mapping. Was § 4.8 of the legacy strategy file. Includes a "Coverage Gaps" subsection for items the design spec doesn't specify or that QA observed but couldn't pin to a requirement.

### `test_design/risk_register.md`

Per-scenario risk row (likelihood / impact / mitigation). Was § 4.10 of the legacy strategy file. Cross-cutting; updated independently of the strategy.

## Sections explicitly dropped

### Coverage Matrix (legacy § 4.6)

The X-marks grid mapping scenarios × test aspects is **dropped**. It's a derivative of the traceability matrix and adds no information beyond it. Modern QA tools (TestRail, Xray, Polarion) auto-derive coverage from the RTM rather than authoring it by hand.

If a reviewer specifically asks for a coverage matrix, generate it on-demand from `traceability_matrix.md` rather than committing one as a separate artifact.

## Migration policy

**New projects:** generate this layout from the start.

**Already-completed projects:** preserve their original layout — do not migrate retroactively. The `tw-case-*` reader commands fall back to the legacy `sections/`-only layout when `test_design/` is absent.

**In-flight projects:** opt-in migration. Reviewer or QA lead decides per project. If migrating, do it as one commit on a feature branch, with the strategy file slim-down and the `test_design/` extraction in the same change.
