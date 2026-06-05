# Test Case Design Rules

## Sanitization Checklist

Before completing test case design, verify all test case content passes this checklist:

- No hardcoded tenant names — use generic placeholders (e.g., "TestTenant-A")
- No real credentials or passwords — use placeholders like `<password>`
- No real IP addresses — use example ranges like `10.x.x.x` or `192.168.x.x`
- No RBAC scope lines unless the scenario specifically tests RBAC
- No real user email addresses — use generic addresses like `testuser@example.com`

## Verification Perspective

Before writing test cases for a scenario, decide and document the verification perspective: **"Web GUI"**, **"API"**, or **"Hybrid"**. Record this in the scenario file header. This prevents mid-stream perspective shifts that cause restructuring.

## Verify Before Committing Expected Results

When updating expected results based on actual system behavior, verify with a screenshot or live browser session before committing. Do not guess or assume behavior from documentation alone.

## Navigation Step Strategy

When writing test case steps, apply these rules to keep focus on the test objective:

1. **Setup navigation → preconditions** when 3+ TCs in the same scenario navigate to the same page
2. **Condense navigation to 1-2 steps max** — combine "Navigate to X" + "Click Add" into one step, not two
3. **No URLs/routes in test steps** — use page names ("RADIUS Server creation form"), not paths (`/t/policies/aaa/create`)
4. **Don't verify intermediate pages** — "Service Catalog page displays" adds no test value if it's not the test objective
5. **Start steps at the test objective** — the feature behavior being validated, not the journey to reach it

**Before (over-specified):**
```
| 1 | Navigate to Network Control → Service Catalog | Service Catalog page displays |
| 2 | Click Add on RADIUS Server card | Form opens at /t/policies/aaa/create |
| 3 | Enter Profile Name: Test-FQDN-{timestamp} | Field populated |
```

**After (condensed):**
```
Preconditions: RADIUS Server creation form open (Network Control → Service Catalog → Add on RADIUS Server card)

| 1 | Enter Profile Name: Test-FQDN-{timestamp} | Field populated |
```

## Auto-Regenerate test_cases/README.md

When adding or removing test cases, always regenerate `test_cases/README.md` by scanning all `sections/*.md` files rather than manually editing counts. The README should contain a scenario table with TC counts derived from actual files. Never hand-edit TC counts — they drift out of sync.

## Bug Report Placement Convention

Bug reports go in `bug/<slug>/bug_report.md` within the project directory. Never place bug report files directly in the project root — use a descriptive slug subdirectory (e.g., `bug/fqdn-config-not-updated/bug_report.md`).

## Screenshot Placement Convention

Screenshots go in `test_cases/diagrams/[scenario-slug]/` immediately when captured. Never place screenshots in the project root or `test_cases/` root — they will need to be reorganized later.
