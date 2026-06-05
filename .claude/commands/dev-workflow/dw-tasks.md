# Break Story into GitHub Issues

```
Read a user story file and create GitHub issues for each task.

Story ID: {{input}}

## PURPOSE

Reads an existing story file from `docs/stories/STORY-XXX.md` and breaks it into
implementable GitHub issues. Each issue is linked back to the story via title prefix.
Updates the story file with created issue numbers.

Fits between `/dw-story` (creates story) and `/dw-implement` (works on an issue):

    dw-story → dw-tasks → dw-implement → dw-create-pr → [human review + test] → dw-merge

---

## WORKFLOW

    /dw-tasks STORY-003
        │
        ├─► Step 1: Read the Story
        │   - If no story ID provided, list files in docs/stories/ and ask user to pick
        │   - Read docs/stories/STORY-XXX.md
        │   - Extract: the need and what success looks like (the story holds the
        │     goal, not a spec — there are no technical notes to copy out)
        │   - If the story file doesn't exist, report and stop
        │
        ├─► Step 2: Break into Tasks
        │   - Analyze the story and break it into tasks
        │   - Each task should be:
        │     • Small — completable in one session
        │     • Independent — minimal dependencies between tasks
        │     • Testable — has a clear done condition
        │   - Detect project type to suggest task breakdown:
        │     • Check project structure, CLAUDE.md, and existing code patterns
        │     • Use these to inform sensible task boundaries
        │   - Present the proposed task list to the user for approval
        │
        ├─► Step 3: Check for Duplicates
        │   - Run: gh issue list --search "[STORY-XXX]" --state all
        │   - If matching issues exist, report and ask user how to proceed
        │
        ├─► Step 4: Create Labels (idempotent)
        │   - Ensure labels exist (same as /dw-plan):
        │     • type labels: feature, enhancement, bug, docs
        │     • priority labels: priority:high, priority:medium, priority:low
        │     • status labels: status:in-progress, status:needs-review, status:blocked
        │   - Use: gh label create "<name>" --color "<hex>" --force
        │
        ├─► Step 5: Create GitHub Issues
        │   - One issue per task
        │   - Title: [STORY-XXX] Task description
        │   - Body — start lean; the issue grows as the *how* is worked out
        │     (research, PoC, clarification, fixes) and recorded in comments:
        │       ## Context
        │       Part of [STORY-XXX](../docs/stories/STORY-XXX.md)
        │
        │       ## Goal
        │       [what this task achieves, from the story's need]
        │
        │       ## Done When
        │       - [ ] [observable done condition for this task]
        │   - Labels: type + priority (infer from story content)
        │   - Link related issues: "Part of STORY-XXX"
        │
        ├─► Step 6: Update Story File
        │   - Update the Status section in docs/stories/STORY-XXX.md:
        │     ## Status
        │     - Created: [original date]
        │     - Issues: #1, #2, #3
        │
        └─► Step 7: Report
            - Show table of created issues:
              | Issue | Title | Type | Priority |
            - Suggest implementation order based on dependencies
            - Suggest: /dw-review-tasks STORY-XXX to gate the breakdown, then
              /dw-implement <N> to start on the first task

---

## EXAMPLE

    /dw-tasks STORY-003

**Agent reads story, breaks into tasks, creates issues:**

    $ cat docs/stories/STORY-003.md
    $ gh issue list --search "[STORY-003]" --state all
    $ gh issue create --title "[STORY-003] Add input validation" \
        --label "enhancement" --label "priority:high" \
        --body "## Context\nPart of STORY-003\n\n## Goal\n...\n\n## Done When\n- [ ] ..."
    $ gh issue create --title "[STORY-003] Add error response formatting" \
        --label "enhancement" --label "priority:medium" \
        --body "..."

**Story file updated:**

    ## Status
    - Created: 2026-04-01
    - Issues: #15, #16

**Output:**

    | Issue | Title                              | Type        | Priority |
    |-------|------------------------------------|-------------|----------|
    | #15   | [STORY-003] Add input validation   | enhancement | high     |
    | #16   | [STORY-003] Add error formatting   | enhancement | medium   |

    Suggested order: #15 → #16
    Start: /dw-implement 15

---

## API Notes

- Uses `gh` CLI for issue operations
- Story files live in `docs/stories/STORY-XXX.md` (created by /dw-story)
- Issue titles use `[STORY-XXX]` prefix for traceability
- The story file records the need; the issue is the single source of truth for *how*,
  growing with research, decisions, and fixes as the work proceeds
```
