# Session Summary — Privacy-Safe Session Recorder

```
Generate a privacy-safe summary of the current session to feed pattern detection and workflow improvement.

Arguments: {{input}}
  - (empty)         Generate summary for the current session
  - --detail full   Include anonymized ticket references (default: structural only)
  - review          Review and show aggregated patterns from past summaries

Examples:
  /session-summary
  /session-summary --detail full
  /session-summary review

## Important Rules

1. **Privacy first** — Never record actual content, credentials, tenant names, real IPs, or email addresses
2. **Structure over content** — Record what type of work was done, not the specific data
3. **User reviews before save** — Always present the summary for approval before writing
4. **Anonymize by default** — Strip ticket IDs unless --detail full is specified
5. **Local only** — Summaries stay in docs/session_summaries/, never committed to git automatically
6. **No duplicate summaries** — If running `/session-summary` multiple times in the same session, update the existing summary rather than creating a new one (multiple sessions per day are fine)

## Phase 1: Collect Session Context

Gather information about the current session by examining conversation context:

### 1a. Session Goal
- What did the user ask to accomplish?
- Summarize in 1 sentence using generic terms (e.g., "Created test cases for a network configuration feature")

### 1b. Skills & Commands Used
- List all slash commands invoked during the session
- List all MCP tools used (by category, not individual calls)
- Note any manual workflows that weren't covered by existing commands

### 1c. Artifacts Produced
- Count of files created/modified (by type: test plans, test cases, confluence pages, etc.)
- Don't list actual file names — just counts and types

### 1d. Friction Points
- Where did the workflow get stuck or require rework?
- What corrections did the user make to your approach?
- What took multiple attempts to get right?
- Any tool failures or unexpected behaviors?

### 1e. Workflow Pattern
Classify the session into one or more workflow patterns:
- **Discovery** — Investigating tickets, gathering requirements
- **Planning** — Creating test plans, reviewing scope
- **Design** — Writing test cases, designing test scenarios
- **Sync** — Importing to TestLink, publishing to Confluence
- **Execute** — Running tests, browser automation
- **Demo** — Creating presentations, screenshots
- **Maintenance** — Updating existing artifacts, fixing bugs
- **Meta** — Improving workflow, evolve, tooling changes

### 1f. Session Outcome
- **Completed** — All goals achieved
- **Partial** — Some goals achieved, work remains
- **Blocked** — Could not proceed due to external dependency
- **Pivoted** — Changed direction based on new information

### 1g. Session Scale
- **Quick** — Under 15 minutes, simple task
- **Medium** — 15-60 minutes, moderate complexity
- **Long** — Over 60 minutes, complex multi-step workflow

## Phase 2: Detect Patterns

Analyze the session for reusable insights:

### 2a. Repeated Sequences
- Did you perform multi-step sequences that could be a single command?
- Example: "Fetched 3 Jira tickets one at a time" → candidate for batch command

### 2b. Workflow Gaps
- Any manual steps that should be automated?
- Missing handoffs between existing commands?

### 2c. Efficiency Observations
- What went smoothly? (reinforce these patterns)
- What was unnecessarily slow? (flag for improvement)

### 2d. Knowledge Gaps
- Did CLAUDE.md have relevant guidance? Was it accurate?
- Were there undocumented conventions you had to discover?

## Phase 3: Generate Summary

### Summary Structure

Present the following to the user for approval:

    ---
    date: [YYYY-MM-DD]
    session_id: [YYYYMMDD-HHMM]
    workflow_patterns: [list from 1e]
    outcome: [from 1f]
    scale: [from 1g]
    commands_used: [list of slash commands]
    mcp_categories: [jira, confluence, testlink, playwright, etc.]
    ---

    ## Goal
    [1 sentence, anonymized]

    ## Artifacts
    - [type]: [count] created, [count] modified

    ## Workflow
    [Brief description of the workflow path taken, using generic terms]

    ## Friction Points
    - [Each friction point as a bullet, anonymized]

    ## Patterns Detected
    - **Repeated sequence:** [description] → Candidate for: [improvement]
    - **Workflow gap:** [description] → Suggestion: [improvement]
    - **Efficiency win:** [what worked well]

    ## Signals for /evolve
    [Key observations that /evolve should pick up in its next analysis]

### Privacy Check

Before presenting, verify the summary passes this checklist:
- [ ] No ticket IDs (unless --detail full)
- [ ] No tenant or company names
- [ ] No real credentials, passwords, or API keys
- [ ] No real IP addresses or hostnames (except generic env names like "stage")
- [ ] No real person names or email addresses
- [ ] No specific test data values that could identify the system under test

## Phase 4: Save (after user approval)

1. **Create directory if needed:**

        mkdir -p docs/session_summaries

2. **Save summary to:** `docs/session_summaries/[YYYY-MM-DD]_[HHMM]_summary.md`

3. **Update patterns file** — Append new patterns to `docs/session_summaries/patterns.md`:
   - If patterns.md doesn't exist, create it with a header
   - Add new patterns with date and frequency count
   - If a pattern already exists, increment its count and update the last-seen date

### patterns.md Structure

    # Session Patterns

    Last updated: [DATE]
    Total sessions recorded: [N]

    ## Workflow Distribution
    | Pattern | Count | Last Seen |
    |---------|-------|-----------|
    | Design  | 12    | 2026-03-13 |
    | Sync    | 8     | 2026-03-10 |

    ## Recurring Friction Points
    | Friction Point | Occurrences | First Seen | Last Seen | Status |
    |---------------|-------------|------------|-----------|--------|
    | [anonymized description] | 3 | 2026-02-01 | 2026-03-13 | Open |

    ## Improvement Candidates
    | Candidate | Evidence Count | Suggestion | Status |
    |-----------|---------------|------------|--------|
    | [description] | 5 | [improvement] | Proposed / Applied / Dismissed |

## Phase 5: Review Mode (when argument is "review")

When invoked with `review`, analyze existing summaries:

1. **Read all summaries** from `docs/session_summaries/`
2. **Read patterns.md** for aggregated data
3. **Present dashboard:**

        ## Session Summary Dashboard

        ### Overview
        - Total sessions: [N]
        - Date range: [first] to [last]
        - Most common workflow: [pattern] ([N] sessions)

        ### Top Friction Points (by frequency)
        1. [point] — [N] occurrences
        2. [point] — [N] occurrences

        ### Improvement Candidates (ready for /evolve)
        | # | Candidate | Sessions | Confidence |
        |---|-----------|----------|------------|
        | 1 | [desc]    | 5        | High       |

        ### Workflow Trends
        [Any notable shifts in session patterns over time]

4. **Suggest /evolve integration:** If there are high-confidence candidates, suggest running `/evolve` to act on them.

## Integration with /evolve

Session summaries are designed to be consumed by `/evolve`:

- `/evolve` Phase 1 (Data Collection) should check `docs/session_summaries/patterns.md`
- Friction points with 3+ occurrences become High-confidence insights
- Improvement candidates feed directly into Phase 5 (Propose Actions)
- The session-to-evolve pipeline: `/session-summary` → patterns.md → `/evolve` → actions
```
