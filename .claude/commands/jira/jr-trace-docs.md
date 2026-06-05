# Jira Trace - Documentation Download

Download documentation files for a traced Jira ticket project.

**Usage:** `/jr-trace-docs {{input}}`

**Arguments:**
- `{{input}}` - Jira issue key (e.g., PROJ-12345)

## When to Use

- After `/jr-trace-fetch` has identified related tickets and Confluence pages
- When setting up a new project and need to download all documentation locally
- As part of the `/jr-trace` pipeline (Step 3)

## PURPOSE

Download and save documentation from Jira tickets and Confluence pages:
1. Main ticket file with full details
2. Related ticket files
3. Confluence documentation files (faithful download, not summarized)

---

## FILE 1: MAIN TICKET FILE

**Filename:** `00_Main_Task_[TICKET].md`

### Content Structure

```markdown
# [TICKET]: [Summary]

## Ticket Information

| Field | Value |
|-------|-------|
| Type | [Epic/Story/Bug/Task] |
| Status | [Status] |
| Priority | [Priority] |
| Assignee | [Name] |
| Reporter | [Name] |
| Created | [Date] |
| Updated | [Date] |

## Description

[Full description from ticket]

## Changelog Summary

| Date | Author | Change |
|------|--------|--------|
| [Date] | [Name] | [Key change description] |

## Comments

### Comment by [Author] - [Date]
[Comment content]

---

### Comment by [Author] - [Date]
[Comment content]

## Related Tickets

- Parent: [TICKET] - [Summary]
- Children: [TICKET], [TICKET]
- Linked: [TICKET] (blocks), [TICKET] (relates to)

## Confluence Documents

- [Page Title](confluence/[filename].md)
```

---

## FILE 2: RELATED TICKET FILES

**Filename:** `01_[DESCRIPTION]_[TICKET].md`

Create one file for each:
- Parent ticket (if exists)
- Child tickets/stories
- Linked tickets (blocks, relates to, duplicates)

### Content Structure

```markdown
# [TICKET]: [Summary]

## Ticket Information

| Field | Value |
|-------|-------|
| Type | [Type] |
| Status | [Status] |
| Relationship | [Parent of/Child of/Blocks/Relates to] [MAIN_TICKET] |

## Description

[Full description]

## Comments

[All comments with author and date]
```

---

## FILE 3: CONFLUENCE FILES

**Filename:** `confluence/[SANITIZED_TITLE].md`

### Content Structure

```markdown
# [Page Title]

## Page Metadata

| Field | Value |
|-------|-------|
| Page ID | [ID] |
| Space | [Space Key] |
| Version | [Version Number] |
| URL | [Full URL] |
| Last Updated | [Date] |

## Content

[Full page content converted to markdown]

## Attachments

| Filename | Size | Type |
|----------|------|------|
| [name] | [size] | [type] |
```

---

## FILE 4: VISUAL DESIGN REFERENCES

**Filename:** `confluence/visual_references.md`

After downloading Confluence pages, scan them for visual design artifacts and create a reference file.

### What to Extract

1. **Figma/design tool URLs** — Search downloaded Confluence pages for Figma, Sketch, Zeplin, or other design tool links
2. **Embedded wireframe images** — When Confluence pages contain wireframe/mockup images, **read them using the Read tool** (multimodal) to understand the UI design
3. **Before/After tables** — HLD pages often include Before/After wireframe comparison tables; capture these

### Content Structure

```markdown
# Visual Design References

## Design Tool Links

| # | Source | URL | Description |
|---|--------|-----|-------------|
| 1 | HLD Page [ID] | [Figma URL] | [Brief description of what the mockup shows] |

## Wireframe Summary

[After viewing each embedded wireframe image, write a brief description of:]
- UI location (which page/section of the product)
- Key UI elements visible (checkboxes, dropdowns, fields, buttons)
- States shown (enabled/disabled, checked/unchecked, default values)
- User flow indicated by the wireframes

## UI Element Inventory

| # | Element | Type | Default | Options/Constraints | Source |
|---|---------|------|---------|---------------------|--------|
| 1 | [Element name] | [checkbox/dropdown/input/button] | [Default value] | [Options or validation] | [HLD wireframe / Figma] |
```

### Why This Matters

Test plans and test cases written without visual reference often have:
- Wrong field labels (text description vs actual UI)
- Missing UI states (HLD describes logic but wireframe shows additional states)
- Incorrect navigation paths (text says "Settings page" but UI groups it differently)

This file serves as the **visual baseline** for test planning and test case design.

---

## TIPS

- **Download faithfully** — Save full Confluence page content as-is, do not summarize or rewrite
- **Keep comments** — They contain crucial context and decisions
- **Follow naming conventions** — See `/jr-trace-structure` for details
- **Preserve all content** — Include every section, table, and detail from the source
- **View embedded images** — Use the Read tool to view wireframe/mockup images in Confluence pages; describe what you see for downstream test planning

## NEXT STEP

After downloading files, run `/jr-trace-verify` to validate downloads and generate summaries.
