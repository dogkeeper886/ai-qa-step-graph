# tw-baseline-trace

Capture a UI baseline of the live web application **before** drafting test scenarios.

## Purpose

Test scenarios drafted purely from design spec + wireframes systematically over-specify — they generate cases for pre-existing behaviors (sort, search, navigation tabs) and miss UI realities the wireframes don't show (feature flags hiding controls; "tabs" that are actually separate routes over different domain objects).

A short UI baseline trace, captured **before** scenarios are drafted, anchors the scenario author in observable reality:

- Which columns / controls / filters are visible today
- Which controls are pre-existing behavior (NOT modified by this feature)
- Where the live UI differs from wireframes — and which version to trust
- Whether feature-flagged controls are gated as the spec claims
- Whether elements the spec calls "tabs" are real tabs (shared state) or separate routes (no shared state)

The authoring rule the baseline enforces:

> **Do not write a case for a behavior that's already visible in the baseline and isn't modified by the feature.** That's regression of the existing suite, not new coverage for this feature.

## When to use

- **After** `/jr-trace [TICKET]` (project folder exists; design spec downloaded)
- **Before** `/tw-plan-feature` / `/tw-plan-enhance` / `/tw-plan-bugfix`
- Recommended for any feature or enhancement that touches an existing UI page
- Optional for bug fixes; useful when the repro page is non-obvious

This step is **strongly recommended** — a recent project's self-review found that roughly half the drafted cases turned out to be either pre-existing-behavior regression or based on UI misreadings, both visible at trace time and neither caught at draft time. Skipping the trace works only when the feature genuinely lands on a page that doesn't exist yet.

## Prerequisites

- Project folder exists at `active/<TICKET>/` with design spec + feature-definition files (`/jr-trace` ran)
- Playwright MCP available in the session
- Test environment credentials available — typically in `config/env-<tenant>.txt`; any non-production tenant where the feature flag can be controlled works
- Feature flag should be **OFF** on the tenant for the cleanest baseline (captures the pre-feature world; the post-feature world is what the test plan describes)

## Inputs

- `<TICKET>` — Jira ticket ID (folder slug under `active/`, e.g., `PROJ-12345_Feature_Name`)
- Optional `<env>` — environment profile name (default: current profile)

## Tools

Allowed: Playwright MCP (browser_navigate, browser_snapshot, browser_take_screenshot, browser_click, browser_type, browser_fill_form, browser_wait_for, browser_resize, browser_press_key), Read, Write, Bash, Glob, Grep, TodoWrite

## Workflow

### Step 1: Identify pages to trace

```
1. Read active/<TICKET>/confluence/HLD_*.md (or design-spec equivalent)
   - Find every section that references a UI page — Wireframes, Use Case
     Flows, Components, Admin GUI / End-User Portal sections
   - Extract a candidate page list: page name + spec-claimed route + paired
     wireframe image path (hld_images/*.png)
2. Read active/<TICKET>/00_Main_Task_<TICKET>.md and any 01_*Feature_Request*.md
   - Cross-check the candidate list with the ticket's affected-areas section
3. Present the candidate page list to the user:
   "Will trace these N pages — confirm or edit"
4. User confirms or edits; proceed with the agreed list
```

The page list typically includes 2–5 entries: one or two admin-facing pages (where the feature is configured), one or two end-user-facing pages (where the feature is observed), and the downstream admin observation page (where the result of the end-user action appears).

### Step 2: Prepare output folders

```bash
DATE=$(date +%Y-%m-%d)
mkdir -p active/<TICKET>/ui_baseline/$DATE/{screenshots,snapshots}
```

Convention: each capture goes in a dated folder so subsequent traces (after a build update, after flag flip) don't overwrite earlier captures.

### Step 3: Verify Playwright session and tenant state

```
1. If Playwright is not yet logged into the target tenant, prompt the user
   to log in manually first (do NOT pass credentials inline; the user logs
   in once and the command drives the rest)
2. Confirm the tenant currently has the feature flag OFF (or the state
   matches what the trace is meant to document) — record the state in
   the baseline metadata
3. Resize the viewport to a stable size (e.g., 1440x900 or whatever the
   target app's minimum width comfortably supports)
```

### Step 4: Drive Playwright through each page

For each page on the agreed list:

```
1. browser_navigate to the page (or navigate via the side menu — match
   what a real admin would do, since route accessibility itself is part
   of what the baseline captures)
2. browser_wait_for time:3 to let the page settle (list pages re-render
   on filter init)
3. browser_snapshot — save raw accessibility YAML to:
     active/<TICKET>/ui_baseline/<DATE>/snapshots/<page_slug>.yml
4. browser_take_screenshot type=png — save PNG to:
     active/<TICKET>/ui_baseline/<DATE>/screenshots/<page_slug>.png
5. Extract structural info from the snapshot:
   - Page title + breadcrumbs
   - Tabs in the tablist (and verify: do they change the URL on click?
     If yes → they're routes, not tabs)
   - Toolbar: search bar placeholder text, filters (combobox/dropdown
     names), buttons
   - Table columns (if present): each columnheader name + sort affordance
   - Bulk-action controls — note that the bulk bar usually appears only
     after row selection (test by selecting a row)
   - Wizard steps (if present): step list + current step
   - Form fields (if present): each field name + type + required marker
6. Note any spec-described control that is NOT in the live snapshot —
   typical reason: feature-flag gated
7. Note any control IN the live snapshot that's NOT in the wireframe —
   typical reason: pre-existing behavior the wireframe didn't draw
```

### Step 5: Cross-check "tab" semantics

For each "tab" element found:

```
1. Click the next tab in the tablist
2. Observe whether the URL changes
3. If URL changes → it's a route, not a tab. Selection / filter / scroll
   state will NOT survive switching, and shouldn't be tested as if they
   would. Document this in the baseline.
4. If URL stays the same → it's a true tab with shared state. Cases that
   assert state preservation across tabs are valid.
```

This check explicitly catches the common misread where two related routes (e.g., a "Users" tab next to a "Roles" tab) look like tabs but each click switches the URL — they share no selection / filter / scroll state, and asserting that they would is testing for behavior the design doesn't claim.

### Step 6: Generate baseline.md

Write `active/<TICKET>/ui_baseline/<DATE>/baseline.md` using this template:

```markdown
# UI Baseline — <TICKET>

**Captured:** <YYYY-MM-DD>
**Tenant:** <tenant capability description> / <env URL>
**Feature flag state:** <ON / OFF — usually OFF for pre-feature baselines>
**Captured by:** <author>
**Captured via:** /tw-baseline-trace + Playwright MCP

## Pages traced

### <Page name, e.g., "Settings → Profiles → Add → Form → Step 2">

- **Route:** `<URL path>`
- **Navigate via:** <menu path>
- **Screenshot:** [`screenshots/<page_slug>.png`](screenshots/<page_slug>.png)
- **Raw snapshot:** [`snapshots/<page_slug>.yml`](snapshots/<page_slug>.yml)

**Live structure (flag <state>):**
- <bullet list of observed columns / controls / tabs / wizard steps / fields>

**Tab vs route semantics:** <if any tab-like elements were found, note whether they change the URL on click (route) or not (true tab)>

**Wireframe diff (`<wireframe.png>`):**
- Spec adds (not visible today): <list — conclusion: "feature-flag gated" / "spec aspirational">
- Live has (not in spec): <list — conclusion: "pre-existing behavior" / "spec didn't draw it">

**Authoring guidance for scenarios:**
- Pre-existing behaviors NOT to test for this feature: <list>
- Feature-flag-gated controls to verify under flag ON (likely in the flag-gating scenario): <list>
- Other UI realities the spec doesn't show: <list>

---

### <Next page...>
```

### Step 7: Validate + handoff

```
1. Report:
   - Number of pages traced
   - Number of spec-vs-live diffs found
   - List of pre-existing behaviors flagged as "not to retest"
2. Confirm baseline.md is readable + screenshots/snapshots all saved
3. Print next-step prompt:
   "Run /tw-plan-feature (or tw-plan-enhance / tw-plan-bugfix) — it will
    read the baseline alongside the design spec."
```

## What `/tw-plan-*` does with the baseline

The plan-drafting commands check for `active/<TICKET>/ui_baseline/*/baseline.md` on entry. If found, they:

- Load the baseline alongside the design spec
- When proposing each scenario / case, cross-check against the baseline's "Pre-existing behaviors" and "Feature-flag-gated controls" lists
- Skip cases for pre-existing behaviors unmodified by this feature
- Route feature-flag-gated assertions to the flag-gating scenario

If no baseline is found, the plan-drafting commands warn:

> No UI baseline found at `ui_baseline/`. Drafting from design spec only — recommend running `/tw-baseline-trace` first to ground scenarios in observable UI reality. Proceed without baseline? (yes/no)

A "yes" answer is fine for bug fixes or pages that don't exist yet; a "no" answer rewinds to `/tw-baseline-trace`.

## Output layout

```
active/<TICKET>/
└── ui_baseline/
    └── <YYYY-MM-DD>/
        ├── baseline.md          # the narrative + structural notes
        ├── screenshots/
        │   ├── <page_slug>.png
        │   └── ...
        └── snapshots/
            ├── <page_slug>.yml
            └── ...
```

Multiple dated folders coexist when traces are repeated (e.g., before flag flip, after flag flip, after build update). The most recent is canonical for current planning.

## NEXT STEP

After the baseline is captured, run `/tw-plan-feature`, `/tw-plan-enhance`, or `/tw-plan-bugfix` per the feature type. Those commands will load `ui_baseline/<latest-date>/baseline.md` alongside the design spec and apply the "don't author regression of pre-existing behavior" rule from `skills/planning-tests/references/scenario-conventions.md`.

---

## Related

- `skills/planning-tests/SKILL.md` — describes where this command sits in the broader test-planning lifecycle
- `skills/planning-tests/references/scenario-conventions.md` — the authoring rule the baseline enforces
- `skills/planning-tests/references/file-layout.md` — documents `ui_baseline/` as part of the per-project tree
