---
name: reviewing-typography
description: |
  Audits just-published Confluence pages for typography problems — Gestalt
  proximity violations, visual hierarchy collisions, wall-of-text paragraphs —
  that templates cannot predict because they depend on the actual content's
  length and shape. Use when a QA engineer wants to review typography, audit
  page design, check Confluence formatting quality, or after running
  planning-tests or designing-cases against real content.
tools:
  - mcp-atlassian:confluence_get_page
  - mcp-atlassian:confluence_update_page
---

# reviewing-typography

Walks each just-published Confluence page block-by-block and applies two design principles — **Gestalt proximity** (spacing groups or separates) and **visual hierarchy** (weight signals importance) — to flag and fix typography problems.

## Why this is an AI-judgment skill, not a checklist template

Content shape is unknowable at template time. A metadata block looks fine on an empty shell but reads as a wall the moment real prose lands under it. A bold inline label looks like an anchor when three exist on a page; once ten exist on the same page, they all compete and the hierarchy collapses. A 4-item bullet list reads cleanly; a 17-item bullet list reads as paragraph soup. **The agent must look at the rendered content and decide** — there is no rule set that survives contact with arbitrary content.

This skill is invoked after the page is published — typically as `planning-tests` Step 7 (after Step 6's content-rendering check) or `designing-cases` Step 6 (immediately after publish). Because the skill fetches raw storage HTML, it catches both content-rendering failures (collapsed lists, fused metadata — the same patterns `planning-tests` Step 6 calls out) **and** the design-level problems (proximity, hierarchy) that templates cannot predict. The fix recipe is the same for both classes of finding: re-push the page via `content_format: "storage"` with a corrected HTML body. Treating them as one pass is intentional — it avoids the artificial seam between "did the page render?" and "does the page read well?", since both surface as the same storage-HTML defects.

## Progress Checklist

```
- [ ] Step 1: Collect page IDs in scope
- [ ] Step 2: Fetch each page in storage format
- [ ] Step 3: Proximity pass — adjacent-block group/separate check
- [ ] Step 4: Hierarchy pass — squint test for weight collisions
- [ ] Step 5: Compose per-page critique with proposed storage-format diffs
- [ ] Validate: N pages reviewed, N clean, N needing fixes
- [ ] Step 6: Apply approved fixes via confluence_update_page
- [ ] Validate: Re-fetch each fixed page and confirm changes landed
```

## Steps

### Step 1: Collect Page IDs

Source order:

1. **From a project folder:** if `test_plan/confluence_pages.md` exists, every page recorded there is in scope by default. The agent may also accept a narrower scope from the user ("just review TS-XX pages", "just the README").
2. **Explicit list:** the user names specific page IDs.

If no page IDs can be resolved, stop and ask the user.

### Step 2: Fetch Each Page in Storage Format

For each page, call:

```
mcp-atlassian:confluence_get_page
  page_id: <id>
  convert_to_markdown: false
```

Do **not** work from the markdown render. Markdown smooths over the very problems this skill exists to catch (collapsed paragraphs, weight inversions). Read the raw `storage` HTML.

### Step 3: Proximity Pass

Walk the storage HTML top to bottom. For each **adjacent pair of block-level elements** (`<p>`, `<ul>`, `<ol>`, `<h2>`, `<h3>`, `<table>`, `<ac:structured-macro>`, `<hr/>`, etc.), ask:

> *Are these two blocks the same conceptual group, or different conceptual groups?*

| Decision | Required separation |
|---|---|
| Same group | One `<p>`-to-`<p>` gap is fine; no separator between a heading and its first body block is fine. |
| Different group | Need visible separation: a heading break, an `<hr/>`, or a clearly labeled new block. |
| Crossing layers (e.g. metadata → body, intro → first scenario) | Need the **loosest** separation: heading or `<hr/>`. Two adjacent `<p>` blocks here will fuse visually. |

Specific patterns to watch for are catalogued in `references/typography-principles.md` — at minimum: metadata-block-fused-with-intro (A1), prose paragraph crossing 3+ ideas (A2), nested `<li>` doing the job of a heading (A6).

### Step 4: Hierarchy Pass — Squint Test

Look at the rendered page (open it in a browser tab if possible, or visualize from the storage HTML) with eyes unfocused. Without reading any word, the visible weight order should be:

```
Page title (heaviest)
  H2
    H3
      Bold inline labels (Objective:, Status:, Focus:) — anchor words
        Body text
          Inline code / monospaced refs (lightest)
```

For each pair of adjacent levels, ask:

> *Can the eye tell these apart at a glance?*

Specific failure modes (full catalog in `references/typography-principles.md`):

- **Bold-label inflation (A3):** every paragraph starts with a different bold phrase. The labels were meant to be skim anchors below H3 — but at density >6 per page, none of them anchor anything.
- **Heading promotion needed (A6):** a `<p><strong>Label:</strong></p>` followed by a long list is doing heading work without heading weight. Promote to `<h3>`.
- **No hierarchy at all:** the page has only `<p>` and `<ul>` for 800+ words. Insert at least one `<h3>` break at the natural mid-page boundary.
- **Weight collision:** two adjacent levels (H2 vs H3, or H3 vs bold-inline) render at indistinguishable weights for this Confluence theme. Pick one and demote the other, or insert intermediary content.

### Step 5: Compose Critique

For each page, emit a short markdown report:

```
## [PROJECT_ID]: [Page Title] (page ID `xxx`)

**Proximity findings:** N items
- [block A] adjacent to [block B] — same group / different group, current separation is too tight / too loose.
  - Proposed fix: <concrete change, e.g. "insert <hr/> between metadata and intro paragraph">

**Hierarchy findings:** N items
- [observation, e.g. "10 bold inline labels compete; no level above them"]
  - Proposed fix: <concrete change, e.g. "promote the 3 case-anchor labels to <h3>, remove bold from remaining 7">

**Verdict:** CLEAN | NEEDS FIXES
```

If a page is CLEAN, say so explicitly with no findings. **Inventing findings on a clean page is its own anti-pattern** — it trains the agent and the reader to ignore real findings next time.

### Validate

Report:

- Pages reviewed: N
- Pages CLEAN: N
- Pages NEEDS FIXES: N
- Total findings by type: proximity X, hierarchy Y

### Step 6: Apply Approved Fixes

Wait for human approval of the critique before editing. Then for each page with findings:

```
mcp-atlassian:confluence_update_page
  page_id: <id>
  content_format: "storage"
  content: <corrected HTML>
```

Use `storage` format (not `markdown`) for every fix — these are precision edits and markdown will re-introduce the same problems.

After all fixes, re-fetch each updated page with `convert_to_markdown: false` and confirm the fix landed in the raw HTML. **Do not trust the update response alone.** A typical first publish has multiple pages broken in some way after the initial publish (markdown converter dropped lists, fused metadata, etc.); the fix cycle is the same trust-nothing loop.

Watch specifically for known publish-time pitfalls (see `references/typography-principles.md` § "Publish-Time Pitfalls"): markdown task-list flattening, inline code drift, and the metadata-as-one-block illusion. Round-trip drift through `content_format: "markdown"` on update can silently break content that rendered correctly on the initial publish.

### Validate

Report:

- Pages updated: N
- Re-fetch confirmation: N landed clean | N still pending (with details)

## Expected Input

- A list of Confluence page IDs (typically from `test_plan/confluence_pages.md`)
- Access to `mcp-atlassian:confluence_get_page` and `mcp-atlassian:confluence_update_page`

## Next Step

After typography review passes, return control to the calling skill (`planning-tests`, `designing-cases`, etc.) or move on to the next workflow phase.

## References

- `references/typography-principles.md` — Gestalt proximity and visual hierarchy in full, anti-pattern catalog (A1–A6) with storage-format before/after, fix recipes, and the "when to leave it alone" rule.
