# Review Confluence Page

```
Review a Confluence page for formatting AND content completeness issues after create or update.

Page ID: $ARGUMENTS
Local Source File: (optional - provide path for content completeness check)

## Review Checklist

### 1. List Formatting
- [ ] Bullet lists render as proper `<ul><li>` (not plain text with `*` or `-`)
- [ ] Numbered lists render as proper `<ol><li>` (not plain text with `1.`, `2.`)
- [ ] Nested lists are NOT used (Confluence markdown doesn't support nesting)
- [ ] Sub-items use tables instead of nested lists
- [ ] Numbered lists after descriptive text are in table format

### 2. Table Formatting
- [ ] Tables render as proper `<table>` elements (not plain text with `|`)
- [ ] Table headers use `<th>` tags
- [ ] Complex data uses tables instead of nested lists
- [ ] No long semicolon-separated content in table cells
- [ ] Each distinct item has its own row (not combined with semicolons)
- [ ] No bullet point characters (`*`, `-`) inside table cells

### 3. Code Block Formatting
- [ ] Code blocks use `<ac:structured-macro ac:name="code">` format
- [ ] ASCII diagrams preserved correctly in code blocks
- [ ] Inline code uses `<code>` tags

### 4. Text Formatting
- [ ] Bold text uses `<strong>` tags
- [ ] Italic text uses `<em>` tags
- [ ] All content wrapped in `<p>` tags where appropriate
- [ ] Line breaks use `<br/>` within paragraphs

### 5. Structure
- [ ] Headers use proper `<h1>` through `<h5>` hierarchy
- [ ] Horizontal rules use `<hr/>` tags
- [ ] Links are clickable and properly formatted

### 6. Content Completeness (if local source provided)
- [ ] All section headers from source file present in Confluence
- [ ] All diagrams/ASCII art preserved in code blocks
- [ ] All table rows present (count items in source vs Confluence)
- [ ] All test steps/cases included (no truncation)
- [ ] All bullet/numbered list items present
- [ ] No "simplified" or summarized content replacing detailed source
- [ ] Prerequisites/preconditions complete
- [ ] Expected results match source file exactly

## Common Issues from Markdown Conversion

| Issue | Symptom | Fix |
|-------|---------|-----|
| Nested lists collapsed | `1. Item - sub1 - sub2` on one line | Convert to table format |
| Numbered list after text collapsed | `verify that: 1. item 2. item` on one line | Put numbered items in table with `#` column |
| Semicolon-separated content | Long cell with `item1; item2; item3` | Split into separate rows per item |
| Lists as plain text | `* item` visible instead of bullet | Use storage format with `<ul><li><p>` |
| Tables as plain text | `\| col1 \| col2 \|` visible | Use storage format with `<table>` |
| Code blocks missing | ```code``` visible as text | Use `<ac:structured-macro>` |
| Bullets in table cells | `* item` in cell not rendering | Use commas or separate rows |

## Content Completeness Issues

| Issue | Symptom | Prevention |
|-------|---------|------------|
| **Missing sections** | Page ends abruptly or lacks sections from source | Compare section headers between local file and Confluence |
| **Simplified content** | Tables have fewer rows, test steps are missing | Count items in local file vs Confluence |
| **Missing diagrams** | ASCII diagrams not in code blocks | Check all code blocks from source are present |
| **Truncated test cases** | Only first few test cases present | Count test cases in source vs Confluence |
| **Missing prerequisites** | Preconditions section incomplete or absent | Compare prerequisites line-by-line |
| **Summarized expected results** | Generic results instead of specific ones | Match expected results word-for-word |

## Agent Processing

### Formatting Review
1. Fetch page using `confluence_get_page` with `convert_to_markdown: false` to see raw storage format
2. Check for plain text markdown syntax that wasn't converted:
   - Look for `*` or `-` at start of lines (unconverted bullets)
   - Look for `1.` `2.` `3.` patterns (unconverted numbered lists)
   - Look for `|` table syntax
   - Look for triple backticks
3. Check for collapsed nested lists (multiple items on single line with `-` separators)
4. Report issues found with specific locations
5. If issues found, recommend using storage format for update

### Content Completeness Review (when local source provided)
1. Read the local source file
2. Extract section headers from both local file and Confluence page
3. Compare section-by-section:
   - Count headers: Do all H1/H2/H3 sections exist?
   - Count diagrams: Are all code blocks with ASCII art present?
   - Count table rows: Does each table have same number of rows?
   - Count list items: Are all bullet/numbered items present?
   - Count test cases: Are all test cases included?
4. For each missing/truncated section, report:
   - Section name
   - What's in local file
   - What's in Confluence (or "missing")
5. Provide update recommendations with complete content

## Output Format

```
## Confluence Page Review: [Page Title]

**Page ID:** [id]
**Version:** [version]
**Format:** [storage|markdown]
**Local Source:** [path or N/A]

### Formatting Issues Found

1. **[Issue Type]**: [Description]
   - Location: [Where in page]
   - Current: [What it looks like]
   - Fix: [How to fix]

### Content Completeness Issues Found

| Section | Local File | Confluence | Status |
|---------|------------|------------|--------|
| [Section name] | [item count/present] | [item count/missing] | ✅/❌ |

### Recommendations

- [Specific recommendations based on issues]

### Overall Status: [PASS|NEEDS FIX]

**Formatting:** [PASS|NEEDS FIX]
**Content Completeness:** [PASS|NEEDS FIX|N/A]
```

## MCP Tool
mcp__mcp-atlassian__confluence_get_page

## Parameters for Review
- page_id: The page ID to review
- include_metadata: true
- convert_to_markdown: false (important - see raw storage format)

## Related Commands
- /cf-format-guide - Full formatting reference
- /cf-update-page - Update page with fixes
```
