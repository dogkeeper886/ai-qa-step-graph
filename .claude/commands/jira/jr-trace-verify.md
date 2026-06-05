# Jira Trace - Validation

```
Verify downloaded documentation and generate summary files.

Jira Issue Key: {{input}}

## PURPOSE

Verify the documentation files downloaded by /jr-trace-docs match their sources.
Then generate summary and index files from the verified content.

---

## PREREQUISITES

Verify these files exist (created by /jr-trace-docs):
- `00_Main_Task_[TICKET].md` (required)
- At least one `01_*.md` OR `confluence/*.md` file

If prerequisites are not met, run `/jr-trace-docs` first.

---

## STEP 1: VERIFY DOWNLOADS AGAINST SOURCE

### Confluence Page Verification

For each `confluence/*.md` file (skip `confluence_links.md` if it exists):
1. Read the local file to get the Page ID from metadata
2. Fetch the source page using `confluence_get_page` with the Page ID
3. Compare: verify content was downloaded faithfully (not summarized or truncated)
4. Check file size — local file should be comparable to source content size
5. Report any mismatches

```python
confluence_get_page(
    page_id='[PAGE_ID]',
    convert_to_markdown=True,
    include_metadata=True
)
```

### Ticket File Verification

For each `00_Main_Task_*.md` and `01_*.md` file:
1. Read the local file to get the ticket key
2. Fetch the source ticket using `jira_get_issue`
3. Verify key fields are present: description, comments, status, assignee
4. Report any missing content

```python
jira_get_issue(
    issue_key='[TICKET]',
    fields='*all',
    expand='renderedFields,changelog,comments',
    comment_limit=100
)
```

---

## STEP 2: GENERATE CONFLUENCE INDEX

**Filename:** `confluence/confluence_links.md`

Skip this step if no `confluence/` folder exists.

Read each verified `confluence/*.md` file and generate:

```markdown
# Confluence Links Index

## Documents Found

| Page Title | Page ID | Source | Context |
|------------|---------|--------|---------|
| [Title] | [ID] | Description | HLD for feature |
| [Title] | [ID] | Comment by [Name] | Design discussion |
| [Title] | [ID] | RemoteWorkItemLink | Linked on [Date] |

## Document Summaries

### [Page Title]
- **Purpose:** [Brief description of document purpose]
- **Key Content:** [What information it contains]
- **Relevance:** [How it relates to the ticket]
```

---

## STEP 3: GENERATE README

**Filename:** `README.md`

Read all verified files then synthesize:

```markdown
# [TICKET]: [Short Description]

## Problem Summary

[2-3 paragraphs explaining the problem being solved]
[Include context from ticket description and comments]

## Solution Overview

[Key features or fixes being implemented]
[Extract from HLD or ticket description]

## Key Insights

[Important findings from tickets AND Confluence docs]
[Technical decisions, constraints, considerations]

## Project Structure

| Path | Description |
|------|-------------|
| `confluence/` | HLD and design documentation |
| `00_Main_Task_*.md` | Main ticket details |
| `01_*.md` | Related ticket files |
| `test_plan/` | Test planning (create with /tw-plan-*) |
| `test_cases/` | Test cases (create with /tw-case-*) |

## Team

| Role | Name | Ticket |
|------|------|--------|
| Dev Lead | [Name] | [TICKET] |
| QA | [Name] | [TICKET] |

## Resources

- [Jira Epic]([URL])
- [HLD Document](confluence/[filename].md)
- [Feature Request]([URL])

## Next Steps

1. Run `/tw-plan-init` to start test planning
2. Create test plan with `/tw-plan-feature` or `/tw-plan-bugfix`
3. Generate test cases with `/tw-case-init`
```

---

## STEP 4: GENERATE RELATIONSHIP DIAGRAM

**Filename:** `Ticket_Relationship_Diagram.md`

Read ticket files and generate:

```markdown
# Ticket Relationship Diagram

## Ticket Hierarchy

```
[PARENT_TICKET] (Epic)
├── [MAIN_TICKET] (Story) ◄── THIS PROJECT
│   ├── [CHILD_1] (Task) - [Status]
│   └── [CHILD_2] (Task) - [Status]
└── [SIBLING] (Story)
```

## Timeline

| Date | Event | Ticket |
|------|-------|--------|
| [Date] | Created | [TICKET] |
| [Date] | HLD linked | [TICKET] |
| [Date] | Development started | [TICKET] |
| [Date] | Resolved | [TICKET] |

## Team Assignments

| Ticket | Assignee | Status |
|--------|----------|--------|
| [TICKET] | [Name] | [Status] |

## Progress Summary

- Total Tickets: [N]
- Resolved: [N] ✓
- In Progress: [N] ●
- Open: [N] ○

## Confluence Documents

| Document | Type | Linked To |
|----------|------|-----------|
| [Title] | HLD | [TICKET] |
| [Title] | Design | [TICKET] |
```

---

## STEP 5: VALIDATION REPORT

Output summary:

| Check | Status | Details |
|-------|--------|---------|
| File count | ✅/❌ | N files downloaded |
| Confluence downloads | ✅/❌ | N pages verified against source |
| Ticket files | ✅/❌ | N tickets verified against source |
| Confluence index | ✅/⬚ | Generated / skipped |
| README | ✅/❌ | Generated with synthesis |
| Relationship diagram | ✅/❌ | Generated |

Suggested next step: `/tw-plan-init`
```
