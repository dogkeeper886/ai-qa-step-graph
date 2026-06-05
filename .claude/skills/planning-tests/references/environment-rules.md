# Environment Specifics — Out of the Plan

The plan describes test environment **requirements** (what capability is needed). It never names a specific instance.

Specific tenant names, URLs, credentials, hardware serial numbers, network names, or test-account identifiers belong in `config/` files, not in any markdown that ships with the plan.

## Why

Three reasons drive this rule:

1. **Open-source repository hygiene.** Identifiers like specific tenant names and credentials must not appear in committed `commands/`, `demo/`, or test plan documents. Even tenant names alone are mild leakage.
2. **Volatility.** The test tenant rotates per feature or sprint. Specific tenant names written into `04_Test_Strategy.md` make the plan rot every project.
3. **ISO 29119 separation.** ISO/IEC/IEEE 29119 distinguishes test environment **requirements** (in the plan) from test environment **configuration** (in a separate, often gitignored artifact). Mixing them is a documented anti-pattern.

## What goes in the plan

In `04_Test_Strategy.md` § 4.3 (Test Approach) and § 4.4 (Test Data Setup), describe capability — not instance:

Good:
> *Test Tenant: any tenant where the feature flag `<flag-name>` is operational; current selection in `config/`.*

Good:
> *Test Hardware: at least one device assigned to the venue, broadcasting each variant's network. Specific serial numbers in `config/test_env.md`.*

Good:
> *Client Device: Android (primary); iOS spot-check.*

Bad:
> *Test Tenant: \<tenant-id\> (per design-review credential handoff from \<reviewer\> on \<date\>).*

Bad:
> *Login: \<email\> / \<password\>.*

## What goes in `config/`

| File | Purpose |
|---|---|
| `config/env-<tenant>.txt` | Tenant-specific credentials and runtime values |
| `config/.env.runtime` | Runtime configuration (gitignored) |

The plan can reference the file by name (*"current selection in `config/env-<tenant>.txt`"*) but should not embed its contents.

## Reviewing existing plans

When reviewing a plan that violates this rule, replace specific tenant names with the capability description and note the change in the plan's revision history. Do not commit a fix that retains the specific tenant name "for context" — the whole point is that context belongs in `config/`.

## Reference

When a past project's strategy file still names a specific tenant, schedule the cleanup as a follow-up rather than blocking on it. When you encounter such cases on new work, apply this rule from the start.
