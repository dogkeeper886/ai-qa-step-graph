# Confluence Format Guidelines

## Overview

This document provides guidelines for creating properly formatted Confluence pages programmatically.

## Path A — `mcp-atlassian:confluence_create_page` with `content_format: "markdown"` (RECOMMENDED for simple pages, verified 2026-05-15)

**Use markdown for flat, blank-line-separated content.** The Atlassian MCP server's markdown converter produces clean Confluence storage format for the majority of authoring needs. Verified across multiple multi-page test plan publishes.

What round-trips cleanly:

| Markdown input | Confluence output |
|---|---|
| `\| col \| col \|` table | `<table data-layout="default"><tbody>…<th><p>…` (proper Confluence table) |
| `- item` bullet (top-level, preceded by blank line) | `<ul><li><p>…</p></li></ul>` |
| `1. item` numbered (top-level, preceded by blank line) | `<ol start="1"><li><p>…</p></li></ol>` |
| ` ```mermaid ` fenced | `<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">mermaid</ac:parameter>` (renders as a diagram if Mermaid Cloud app is installed; otherwise as readable source) |
| ` ```json ` etc. | `<ac:structured-macro ac:name="code">` with language parameter |
| `[text](url)` | `<a href="url">text</a>` |
| `**bold**` / `*italic*` | `<strong>…</strong>` / `<em>…</em>` |
| ``` `code` ``` | `<code>…</code>` |
| `---` | `<hr />` |
| `&` | auto-escaped to `&amp;` |
| `→` `↔` `↑` `↓` | preserved as Unicode (Confluence renders correctly) |

**Schema gotcha:** the tool's parameter description lists `markdown`, `wiki`, and `storage` as the supported values. `html` and `adf` are rejected by the validator despite some older notes claiming otherwise. Use `markdown` for simple pages and `storage` for pages with the gotcha patterns below (see Path C).

### Path A gotchas — patterns the markdown converter silently mangles

Four common patterns DO NOT round-trip cleanly. Each failure mode is silent — the page returns 200 OK from create/update — so you only catch it by re-fetching with `convert_to_markdown: false` and inspecting the storage HTML.

| Source pattern | What the converter produces | Fix |
|---|---|---|
| **Bold paragraph + immediately-following list with no blank line:**<br/>`**Heading:**`<br/>`- item A`<br/>`- item B` | Whole block collapses to one `<p>` paragraph with the hyphens preserved as plain text. **The list never renders.** | Insert a blank line between the bold paragraph and the first `-`. |
| **Nested list (2-space-indented sub-bullets):**<br/>`- Parent`<br/>`  - Sub-item 1`<br/>`  - Sub-item 2` | Sub-bullets are **flattened** to the same level as the parent — "Parent" sits next to "Sub-item 1" instead of containing it. | Either restructure as sibling lists separated by a paragraph, or switch the page to `content_format: "storage"` and write `<ul><li><p>Parent</p><ul><li><p>Sub-item 1</p></li></ul></li></ul>` directly (see [§ 1.3 in confluence-format.md](../../docs/references/confluence-format.md#13-nested-lists)). |
| **Metadata block (multiple bold-prefixed lines, single newlines between):**<br/>`**Focus:** A`<br/>`**Estimated cases:** 3`<br/>`**Test plan reference:** ...` | All lines **merge** into one `<p>` paragraph with bold labels run together as one wall of inline text. | Insert blank lines (each line becomes its own `<p>`), or switch to storage format with `<p>...<br/>...<br/>...</p>` (the cleanest visual result). |
| **Task list checkboxes (`- [ ]`)** in a paragraph context | Render as **bullet items with literal `[ ]` text**, not as native `<ac:task-list>` macros — even with a blank line before. The native task-list conversion is unreliable across contexts. | Use `content_format: "storage"` with explicit `<ac:task-list>` + `<ac:task>` macros (see [§ 1.4 in confluence-format.md](../../docs/references/confluence-format.md#14-task-lists-native-confluence-checkboxes)). |

**Decision rule (apply before every publish):** scan the source markdown for the four patterns above.

- **All four absent** → markdown is fine, use Path A as-is.
- **Patterns 1 or 3 present** → either pre-process the markdown to insert blank lines / `<br/>`, or write the page in storage format.
- **Patterns 2 or 4 present** → markdown cannot express the intent; write that page in storage format. Mixing is OK: most pages in a publish can be markdown while just the ones with nested lists or task lists are storage.

**Pre-flight check (mandatory for batch publishes):** after creating pages, immediately re-fetch each with `convert_to_markdown: false` and grep the storage HTML for these red flags before declaring the publish complete:

- `<p>…<strong>…:</strong>\s*-\s` (collapsed bold-then-list)
- `<li><p>\[ \]` or `<li>\[ \]` (un-converted task-list markers)
- `<p>…<strong>Focus:</strong>…<strong>Estimated test cases:</strong>` (collapsed metadata block)
- `<li>…</li>\s*<li>` followed at the same depth by items that should have been nested (harder to detect mechanically — eyeball the `Checkpoints:` / `tenant already has:` style patterns)

Run `/cf-review-page` against each page; it automates this scan.

## Path C — Mixed markdown + storage (RECOMMENDED for multi-page publishes with mixed content)

In practice, a typical test-plan publish has both simple pages (sections, README) and complex pages (TS-XX scenarios with nested Checkpoints, Test Strategy with task lists). Rather than picking one format for the whole publish, pick per page based on the patterns each page contains:

| Page shape | Recommended format |
|---|---|
| Flat bullets + tables + code blocks + Mermaid | `markdown` |
| Bold-paragraph-headed sub-lists (e.g. Scope `**Admin configuration:** + bullets`) | `markdown` with blank line before each list (works) |
| Nested lists (e.g. TS-XX `Checkpoints:` with sub-bullets) | `storage` |
| Task-list checkboxes (Entry/Exit Criteria) | `storage` with `<ac:task-list>` |
| Metadata header block (`**Focus:** … **Estimated cases:** …`) | `storage` with `<br/>`, OR markdown with blank lines between each label line |

Both `mcp-atlassian:confluence_create_page` and `mcp-atlassian:confluence_update_page` accept `content_format: "markdown"` or `"storage"`. Pages can be mixed within a single publish — no special handling needed at the API level.

**Recovery pattern:** if a page was created in markdown and the review reveals one of the Path A gotchas, update the same page ID with `content_format: "storage"` rather than delete-and-recreate. This preserves the page URL (and any inbound links from Jira/Slack/demo decks).

## Path B — Direct Confluence REST API call (legacy, manual conversion required)

When NOT going through the MCP tool (direct `POST /wiki/rest/api/content` calls), write Confluence storage format (HTML-based) by hand because the REST API's markdown intake was unreliable for tables and lists.

This path is retained for completeness but should not be the default. The MCP tool covers all current authoring needs.

**Legacy Key Principle:** Use Confluence `storage` format (HTML-based) instead of `markdown` format when creating pages programmatically through the legacy REST API.

## Storage-Format HTML Reference

When writing `content_format: "storage"` (Path A gotchas 2 or 4, Path C, or Path B legacy), the full HTML element reference — lists, tables, code blocks, headers, links, text formatting, special characters, complete examples, common mistakes, and format conversion checklist — lives in:

**[`docs/references/confluence-format.md`](../../docs/references/confluence-format.md)**

Section index in that file:
- § 1 Lists (bullet, numbered, nested, task lists)
- § 2 Tables (basic, bullets-in-cells, multi-column)
- § 3 Code Blocks (inline, fenced with language)
- § 4 Headers
- § 5 Links (external, Confluence page links)
- § 6 Text Formatting (bold, italic, paragraphs)
- § 7 Horizontal Rules
- § 8 Special Characters (bullet char, HTML entities)
- § 9 Complete Example Structure
- § 10 Common Mistakes to Avoid
- § 11 Best Practices
- § 12 Format Conversion Checklist

---

## Multi-Page Sync Workflow

When syncing multiple related pages to Confluence:

1. **Create parent page first** with complete content
2. **Create child pages** with FULL content from source files
3. **Review ALL pages** — don't assume child pages are complete
4. **Compare file sizes** — if Confluence content is much shorter than local file, content is missing

### Common Multi-Page Issues

| Scenario | Issue | Solution |
|----------|-------|----------|
| Batch page creation | Later pages have simplified content | Re-sync with full source content |
| Child pages | Missing sections that parent has | Each page needs independent full sync |
| README with children | Children don't match their source files | Review each child against its source |

---

## Content Completeness Checklist

When reviewing synced pages, verify:

1. **Header Section**
   - [ ] Title matches local file
   - [ ] Objective/Summary present
   - [ ] Focus/Category present
   - [ ] Test case count matches

2. **All Sections Present**
   - [ ] Count section headers (##) in local file
   - [ ] Verify same count in Confluence
   - [ ] Check section order matches

3. **Tables Complete**
   - [ ] Preconditions table has all rows
   - [ ] Test steps table has all steps
   - [ ] Summary table at end present

4. **Diagrams and Code Blocks**
   - [ ] All ASCII diagrams present
   - [ ] Diagram header boxes included
   - [ ] Special characters preserved

5. **Supplementary Content**
   - [ ] Notes sections present
   - [ ] Pass criteria included (if applicable)
   - [ ] Troubleshooting guides included (if applicable)

### Content Truncation Detection

| Issue | Symptom | Prevention |
|-------|---------|------------|
| **Missing sections** | Page ends abruptly or lacks sections from source | Compare section headers between local file and Confluence page |
| **Simplified content** | Tables have fewer rows, test steps are missing | Count items in local file vs Confluence |
| **Missing diagrams** | ASCII diagrams not included in page | Check all code blocks are present |
| **Missing header metadata** | Objective/Focus/Test Cases count missing | Verify header section matches source |
| **Incomplete tables** | Preconditions or steps tables have fewer rows | Compare row counts |

---

## Reference

- **Confluence Storage Format Documentation:** [Confluence Storage Format](https://developer.atlassian.com/cloud/confluence/apis-for-confluence-content/)
- **Confluence REST API:** [Confluence REST API Documentation](https://developer.atlassian.com/cloud/confluence/rest/)
- **HTML reference (sections 1-12):** [`docs/references/confluence-format.md`](../../docs/references/confluence-format.md)

---

**Note:** This document should be updated as new formatting patterns are discovered or Confluence formatting requirements change.
