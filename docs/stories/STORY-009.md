# STORY-009: Persist the test plan so it can be reviewed and resumed

## User Story

As a QA engineer using the qa-workflow,
I want the test plan from qw-plan saved as a durable, reviewable artifact instead of
living only in the conversation,
So that the plan survives a lost session and the review gate acts on something persisted.

## The Need

`qw-plan` proposes scenarios that exist only in the chat until `qw-cases` writes docs — so
the agreed "what to test" isn't captured anywhere durable, and `qw-review-plan` reviews
something transient. If the session is lost, the plan is gone. A persisted test plan is
the checkpoint that makes the QA path resumable and gives the existing review gate a real
artifact to check.

## Success Looks Like

- The test plan from qw-plan exists as a persisted artifact that outlives the session.
- qw-review-plan reviews that persisted plan, not a transient chat message.
- The test docs qw-cases writes trace back to the persisted plan.

## Open Questions

- Which existing commands carry this, given the constraint of **no new skill / reuse
  existing commands only** (qw-plan and qw-review-plan already exist as a paired stage).
- Where the plan lives durably and how qw-cases consumes it.
- Whether dev (STORY-008) and qa share one plan-artifact form or stay separate.

## Status

- Created: 2026-06-09
- Plan: #102
- Issues: #103 (overall), #104, #105, #106
