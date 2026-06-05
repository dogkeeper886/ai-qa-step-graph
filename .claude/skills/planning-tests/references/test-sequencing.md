# Test Sequencing — State-Preserving Order

When a test case includes state-changing operations, the order of steps affects which subsequent observations are valid. Pick the order that keeps the test environment usable for all observations on a single device / single profile / single tenant.

## Principle

If step A irreversibly changes the system into a state that step B cannot run from, **step B must come first**.

State-preserving order is not a stylistic choice. Wrong order forces a device reset, a fresh profile, or a re-provisioned tenant — each of which is expensive and easy to forget under execution pressure.

## Common patterns

### Permissive vs strict toggle — strict first, permissive last

When a single test verifies both states of a permissive-vs-strict toggle (allow-list OFF vs ON, feature flag OFF vs ON, etc.) for the same trigger, run **strict first** (action blocked) then **permissive last** (action succeeds).

Why: a successful permissive action often releases the device / session from the constrained state under test (authenticates, navigates away, consumes a one-shot token). Subsequent attempts to observe the strict state from the same session are then invalidated. Reversing the order keeps the session firmly in the constrained state through both observations on one device.

### Mode switching — destructive observation last

When testing mutual-exclusion via mode switching (e.g., admin switches from Mode A to Mode B), record the field-cleared assertion *during* the switch, not after subsequent operations that might further mutate the field.

### Lifecycle tests — read-after-write before destructive operations

When a test includes both persistence (write → read round-trip) and a destructive operation (delete, clear, switch mode), put the read-after-write first. The destructive operation should be the last action in the trace.

### Single-session flows — observe before authenticating

For sessions that have a pre-auth phase, any action that successfully authenticates ends the pre-auth phase. Observations that require pre-auth state (rendering, blocked-link behavior, gating) must precede the authenticating action.

## Application to scenario authoring

Scenarios don't carry click-by-click steps (those live in the test cases). But when execution **sequence** is load-bearing at planning time — i.e., the order of operations is necessary to preserve a piece of state across multiple observations — capture the constraint in the case's `**Notes:**` field so the test-case author preserves it later.

Example:

```markdown
### Case 3: Allow-list toggle (state-preserving)

- **Objective:** verify the end user's tap-through behavior matches the
  allow-list config in both states.
- **Checkpoints:**
  - With URL not on allow-list → action blocked
  - With URL added to allow-list → action loads in pre-auth context
- **Notes:** Run **strict (not on allow-list) first, then permissive (on allow-list)**
  for the same device session, so the session stays pre-auth across both
  observations (avoid post-auth contamination).
```

Reviewers check that the noted sequence makes sense; the test-case author binds it to actual steps later.

## What this prevents

- Unnecessary device resets between observations (slows execution by minutes per case)
- Confusing test results where the failure mode looks like a render bug but is actually post-auth contamination
- Writing setup-heavy cases that need fresh tenant/profile state for each step

## Reference

A past plan applied this rule when reordering a "render + state behavior" case from permissive→strict to strict→permissive specifically to keep one device pre-auth through both observations. Treat that as the canonical example.
