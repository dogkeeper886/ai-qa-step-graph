# STORY-008: Save the development plan as a durable, reviewable checkpoint

## User Story

As a developer using the dev-workflow,
I want a story's plan captured as a durable, reviewable artifact before it is broken
into tasks,
So that the plan survives a lost session, can be shared and reviewed, and gives me a
checkpoint to resume from.

## The Need

The plan is currently ephemeral — the path from a story to task issues skips any saved
plan, so the thinking isn't captured anywhere a teammate or a fresh session can pick it
up. When context is lost, the approach is lost with it. A plan that lives as a durable
artifact — researched up front and gated by a human before decomposition — is the
checkpoint that makes the rest of the work resumable.

## Success Looks Like

- A story's plan exists as a persisted artifact that outlives the session, reviewed by a
  human before any task issues are created.
- A fresh session can pick up the plan and continue without re-deriving the approach.
- Task issues trace back to the plan they came from.

## Open Questions

Resolved by the #84 design (recorded in `.claude/rules/dev-workflow.md`):
- Which existing commands carry this, and the plan reviewer → the plan is gated by a
  **human review** on GitHub, no new command.
- Where the plan lives → a **GitHub issue**, one per story. How `dw-tasks` consumes it is
  built in #86.
- Keeping this off trivial, one-line changes → the **right-size rule** (skip the plan
  stage).

## Status

- Created: 2026-06-09
- Completed: 2026-06-09
- Issues: #84 (design ✓), #85 (dw-plan ✓), #86 (dw-tasks ✓), #88 (dw-story ✓), #89 (dw-implement ✓), #90 (dw-review-tasks ✓)
