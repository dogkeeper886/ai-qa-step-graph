# Generate Test Diagrams

Generate ASCII diagrams for test plan documentation based on feature analysis.

## Purpose

Create visual diagrams to document test design:
1. Configuration Flow - User journey through feature
2. Data Flow - How data moves through system
3. Modular Test Design - Test scenario organization
4. Coverage Matrix - What each scenario covers

## Agent Instructions

### Step 1: Analyze Feature

Read available documentation to understand:
- Feature entry points (UI, API, CLI)
- Data flow paths (direct, proxy, async)
- Configuration hierarchy (global, venue, network)
- Variants (WLAN types, device types, modes)

### Step 2: Generate Configuration Flow Diagram

For UI-centric features, show the user journey:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEATURE CONFIGURATION FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │  Entry Point    │
                              └────────┬────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────────┐
                    │         Decision Point               │
                    └──────────────────┬───────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
    ┌─────────┐                  ┌─────────┐                  ┌─────────┐
    │Option A │                  │Option B │                  │Option C │
    └────┬────┘                  └────┬────┘                  └────┬────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │
                                      ▼
                         ┌───────────────────────┐
                         │   Configuration       │
                         │   Applied             │
                         └───────────────────────┘
```

### Step 3: Generate Data Flow Diagram

For integration features, show data paths:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW PATHS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐                                           ┌──────────────┐
    │  Source  │                                           │   Target     │
    └────┬─────┘                                           └──────▲───────┘
         │                                                        │
         │ Protocol/Format                                        │
         ▼                                                        │
    ┌──────────┐         ┌─────────────────────────────────┐     │
    │ Process  │────────►│     Data Transformation         │─────┘
    └──────────┘         └─────────────────────────────────┘

                    ════════════════════════════════════════
                              MULTIPLE MODES
                    ════════════════════════════════════════

    MODE 1: Direct                        MODE 2: Proxy
    ─────────────────                     ─────────────────
    
    ┌────────┐     ┌──────────┐          ┌────────┐     ┌────────┐     ┌──────────┐
    │ Source │────►│  Target  │          │ Source │────►│  Proxy │────►│  Target  │
    └────────┘     └──────────┘          └────────┘     └────────┘     └──────────┘
```

### Step 4: Generate Modular Test Design Diagram

For complex test suites, show organization:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MODULAR TEST SCENARIO DESIGN                             │
│              (Each module tests one variable/aspect)                        │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────────────┐
                              │   CORE FEATURE    │
                              │     TS-01         │
                              │  Basic Config &   │
                              │  Functionality    │
                              └─────────┬─────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        ▼                               ▼                               ▼
┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│   INTEGRATION     │         │   COMPATIBILITY   │         │   CONTROL         │
├───────────────────┤         ├───────────────────┤         ├───────────────────┤
│                   │         │                   │         │                   │
│  TS-02: [Name]    │         │  TS-04: [Name]    │         │  TS-06: [Name]    │
│  - Detail 1       │         │  - Detail 1       │         │  - Detail 1       │
│  - Detail 2       │         │  - Detail 2       │         │  - Detail 2       │
│                   │         │                   │         │                   │
│  TS-03: [Name]    │         │  TS-05: [Name]    │         │                   │
│  - Detail 1       │         │  - Detail 1       │         │                   │
│  - Detail 2       │         │  - Detail 2       │         │                   │
└───────────────────┘         └───────────────────┘         └───────────────────┘
```

### Step 5: Generate Coverage Matrix

Always generate a coverage matrix:

```
┌────────────────────┬───────┬───────┬───────┬───────┬───────┬───────┐
│ Test Aspect        │ TS-01 │ TS-02 │ TS-03 │ TS-04 │ TS-05 │ TS-06 │
├────────────────────┼───────┼───────┼───────┼───────┼───────┼───────┤
│ UI Configuration   │   ✓   │       │       │       │   ✓   │       │
│ API Configuration  │       │       │   ✓   │       │       │       │
│ Data Flow Direct   │   ✓   │   ✓   │       │   ✓   │   ✓   │       │
│ Data Flow Proxy    │       │       │       │       │       │   ✓   │
│ Backward Compat    │       │   ✓   │       │       │       │       │
│ Error Handling     │       │       │       │       │       │   ✓   │
│ Feature Flag       │       │       │       │       │       │   ✓   │
│ Client Validation  │   ✓   │       │       │       │       │       │
└────────────────────┴───────┴───────┴───────┴───────┴───────┴───────┘
```

## Output Format

Provide diagrams in markdown code blocks that can be directly copied to test plan documentation.

## Example Usage

```
User: /generate-test-diagrams

Agent: What feature are you designing tests for? Please provide:
1. Feature name and brief description
2. Entry points (UI paths, API endpoints)
3. Data flow (what talks to what)
4. Test scenarios defined so far (if any)

User: [Provides feature details]

Agent: [Generates relevant diagrams based on feature complexity]
```

## Diagram Selection Guide

| Feature Complexity | Diagrams to Generate |
|--------------------|---------------------|
| Simple (1-3 scenarios) | Coverage Matrix only |
| Medium (4-6 scenarios) | Coverage Matrix + one flow diagram |
| Complex (7+ scenarios) | All 4 diagram types |

## Tips for Good Diagrams

1. **Keep boxes aligned** - Use consistent spacing
2. **Use clear labels** - Short but descriptive
3. **Show relationships** - Arrows indicate flow/dependency
4. **Highlight the new** - Mark new features with ◄── NEW
5. **Group related items** - Use visual clustering
