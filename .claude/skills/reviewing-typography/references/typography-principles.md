# Typography Principles for Confluence Pages

This is the catalog of design judgments the `reviewing-typography` skill applies. It is **not a rule template** — it is principles plus a documented anti-pattern catalog. The skill walks real content and decides which patterns are present in the actual page.

## The Two Principles

### Principle 1: Gestalt Proximity

Elements close together read as belonging to the same group. Elements far apart read as separate groups. **Spacing is meaning.**

In Confluence storage format, the proximity knobs are:

| Distance | Storage construct | Reads as |
|---|---|---|
| Tightest | inline text, `<br/>` inside a `<p>` | "these tokens are one thought" |
| Tight | adjacent `<p>` blocks | "related thoughts, same section" |
| Medium | `<p>` then `<ul>` / `<table>` / `<ol>` | "claim, then evidence" |
| Loose | `<hr/>` divider | "different zones of the page" |
| Looser | `<h3>` boundary | "new sub-topic" |
| Loosest | `<h2>` boundary | "new section" |

Use the **smallest distance that still signals the right relationship**. Over-separating is just as broken as under-separating: a page with an `<h3>` every two paragraphs reads as choppy and fragmented — none of the headings carry weight.

### Principle 2: Visual Hierarchy

The reader's eye lands on the heaviest, biggest element first. A well-designed page has a clear weight gradient:

```
Page title           (Confluence renders large, bold)
  H2                 (large, bold)
    H3               (medium, bold)
      Bold inline    ("Objective:", "Status:") — anchor words inside body
        Body         (regular weight)
          Inline code  (de-emphasized, monospace)
```

Rules of thumb:

1. **Two adjacent weight levels must be visibly different.** If H2 and H3 render at the same weight in this Confluence theme, the hierarchy is broken.
2. **A page should have no more than 3 active weight levels in body content.** Title + H3 + body is plenty for most pages. Bold inline labels add a 4th — fine if sparse (3–4 per page); broken if dense (every paragraph).
3. **Don't use bold to mean "important."** Use it to mean "this is an anchor word a skimming reader should land on." When every body sentence has a bold word, no word is an anchor.

## Anti-Pattern Catalog

Each anti-pattern is documented from past reviews. Each entry includes: what the broken HTML looks like, why it's broken in terms of the principles, and the recommended fix.

### A1: Metadata block crammed into one paragraph

**Broken:**

```html
<p><strong>Focus:</strong> End-user E2E (case 1 only)<br/>
<strong>Estimated test cases:</strong> 4<br/>
<strong>Test plan reference:</strong> <code>test_plan/sections/04_Test_Strategy.md</code></p>
<p>The deep happy-path on the end-user side — a real client device exercises the feature…</p>
```

**Why broken (proximity):** each `<br/>` is the tightest tier ("one thought"), so the metadata items read as one continuous line. Then the intro paragraph follows with only a `<p>`-to-`<p>` gap — the same separator used between body paragraphs. The eye perceives the entire metadata block + intro as one mass.

**Fixed:**

```html
<p><strong>Focus:</strong> End-user E2E (case 1 only)</p>
<p><strong>Estimated test cases:</strong> 4</p>
<p><strong>Test plan reference:</strong> <code>test_plan/sections/04_Test_Strategy.md</code></p>
<hr/>
<p>The deep happy-path on the end-user side — a real client device exercises the feature…</p>
```

The metadata items each get medium proximity (their own paragraph, but visually adjacent), and an `<hr/>` (loose tier) breaks the page into a metadata zone and a body zone.

### A2: Long prose paragraph crossing multiple ideas

**Broken:** a 5–7 sentence paragraph that explains what each scenario case covers, then mentions what's in/out of scope, then drops a connection to another scenario. The reader hits a wall of text with no resting point.

**Why broken (proximity):** proximity says "everything inside this `<p>` is one thought." But the paragraph contains 3–4 distinct thoughts. The visual signal contradicts the actual content.

**Fixed:** split at the conceptual seams. Look for transition words: "Meanwhile," "Also," "However," "The X belongs to…," "Case 1 vs Case 2…" — those are usually the seams. Three short paragraphs often read faster than one long one carrying the same content.

**Note:** A2 is *not* a defect when the long paragraph is genuinely one idea (a narrative summary of a complex flow, a multi-clause definition). Author intent matters. If the prose really is one idea and the user has chosen narrative-prose style, leave it.

### A3: Bold-inline-label inflation

**Broken:** every paragraph on the page begins with **A different bold phrase:** followed by body text. Looks "structured" at a glance; in reality, the bold labels were meant to be skim anchors and now there are 10 of them on a single page, none anchoring anything.

**Why broken (hierarchy):** the bold labels are supposed to sit one level below H3 in the weight gradient — readers' eyes were supposed to land on them while skimming. Density killed the weight differential. The page now has H3 → 10 bold labels → body, with no way to tell which labels matter.

**Fixed (one of three options):**

1. **Promote the most important 2–3 labels to `<h3>`** and remove bold from the rest. The promoted labels become real navigation anchors; the demoted ones become plain body text.
2. **Group all bold labels under a new `<h3>`** that names the category. The reader's eye lands on the `<h3>`, and the bold labels under it become a legitimate sub-list.
3. **Remove bold entirely** if the labels are repetitive ("Focus:," "Notes:," "Focus:," "Notes:," ...) — at that density they're noise.

### A4: Adjacent headings collide

If the Confluence theme renders H2 and H3 at similar visual weights for this space, two adjacent headings of those levels look like the same level — the user can't tell what's a major break vs a minor one.

**Fixed:** either pick one level and stick with it, or insert intermediary body content (one paragraph of context) between the H2 and the first H3 so the hierarchy resets.

### A5: Bold-paragraph + immediately-following list, no blank line in source

This is the markdown-converter gotcha already documented in `planning-tests` Step 5. From a typography view, it produces a `<p>` containing the list items as inline text — total proximity collapse, the bullets aren't bullets at all.

**Fixed:** insert a blank line in the markdown source, or emit `storage` HTML with separate `<ul>`. See A6 below for when to also promote the bold paragraph to `<h3>`.

### A6: Nested `<li>` doing the job of a heading

**Broken:**

```html
<ul>
  <li>
    <p><strong>Checkpoints:</strong></p>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
      <li>Item 4</li>
      <li>Item 5</li>
      <li>Item 6</li>
      <li>Item 7</li>
      <li>Item 8</li>
    </ul>
  </li>
</ul>
```

**Why broken (hierarchy):** when the inner list has more than ~5 items, the parent `<li>` containing only "Checkpoints:" is doing the job of a heading without the visual weight of one. Readers expect the outer list's items to be siblings; they're not.

**Fixed:**

```html
<h3>Checkpoints</h3>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  ...
  <li>Item 8</li>
</ul>
```

**Cutover threshold:** roughly 5–7 inner items. Below that, the bold-label-+-nested-list pattern is fine and reads as a tidy mini-group. Above that, promote to `<h3>` for real hierarchy.

## Fix Recipes (storage-format snippets)

### Insert a horizontal divider between zones

```html
<hr/>
```

One line. Confluence renders a thin horizontal rule. Use it sparingly — once or twice per page at zone boundaries (e.g. metadata → body, scenario summary → first case). Multiple `<hr/>` per page becomes noise.

### Promote a bold label to a sub-heading

Before:

```html
<p><strong>Objective:</strong> Verify the end user can submit the form…</p>
```

After (only if a list / table / multi-paragraph block follows):

```html
<h3>Objective</h3>
<p>Verify the end user can submit the form…</p>
```

For a single-sentence objective with no follow-on, leave it as a bold inline. Promotion is for content that *deserves* heading weight.

### Split a long paragraph

Find the conceptual seam (often a sentence starting with "Meanwhile," "Also," "However," "The X belongs to…"). Replace the in-sentence break with `</p><p>` at the seam. If the resulting paragraphs are very short (one clause each), the split was too aggressive — re-merge.

### Demote competing bold labels

If a page has 10 bold inline labels, identify the 2–3 most semantically heavy ones. Promote those to `<h3>`. Remove `<strong>…:</strong>` from the rest, leaving plain prose. The page goes from "everything important" to "three things important, the rest is context."

## Publish-Time Pitfalls (markdown → storage conversion)

These aren't typography defects in the source — they're conversion bugs that surface only after a Confluence update. The reviewing-typography skill should re-fetch the page after every update and check that the rendered storage matches expectations.

### Pitfall 1: Task lists collapse when pushed via markdown content format

**Symptom:** Source markdown like:

```markdown
**Entry Criteria (when can testing start?):**
- [ ] Build deployed to the selected tenant
- [ ] BE stories Resolved: ...
```

renders correctly on the **initial** publish (via `/cf-create-page`'s markdown path) as `<ac:task-list>` macros with proper checkboxes. But re-pushing the same content via `confluence_update_page` with `content_format: "markdown"` flattens it to a single `<p>` with literal `- [ ]` text:

```html
<p><strong>Entry Criteria (when can testing start?):</strong> - [ ] Build deployed... - [ ] BE stories Resolved...</p>
```

**Cause:** The markdown converter requires a blank line between the bold-prefix paragraph and the first task-list item. Without it, the converter treats the whole block as one paragraph and embeds `- [ ]` as literal characters.

**Fix:** When updating any page that contains task lists, use `content_format: "storage"` with explicit `<ac:task-list>` macros:

```html
<p><strong>Entry Criteria (when can testing start?):</strong></p>
<ac:task-list>
<ac:task><ac:task-id>1</ac:task-id><ac:task-status>incomplete</ac:task-status><ac:task-body>Build deployed to the selected tenant</ac:task-body></ac:task>
<ac:task><ac:task-id>2</ac:task-id><ac:task-status>incomplete</ac:task-status><ac:task-body>BE stories Resolved: ...</ac:task-body></ac:task>
</ac:task-list>
```

Task IDs must be unique across the page. Pick numbers that don't collide with any other task-list on the same page.

**Detection:** After any update to a page that previously had task lists, re-fetch and check for `<ac:task-list>` presence. If you see `<p>...- [ ]...</p>` instead, the conversion broke.

### Pitfall 2: Inline code spans drift between markdown and rendered storage

**Symptom:** Source markdown has `` `README.md` `` (backticked code). After publishing once via markdown content_format, the rendered storage may show `the README` (plain text, no `<code>` wrapper).

**Cause:** The markdown converter can drop inline code when it's adjacent to certain punctuation or inside certain enclosing contexts. The drift is silent — no error.

**Fix:** When updating, use storage format with explicit `<code>README.md</code>` to guarantee the code styling lands. The reviewing-typography skill should diff source → rendered storage and flag drift.

### Pitfall 3: Multiple consecutive `<p>` bold-label paragraphs render visually distinct only with `<hr/>` zone breaks

This isn't strictly a conversion bug — it's a visual-density tradeoff already covered by anti-pattern A1. But it interacts with the markdown converter: if the source has blank-line-separated `**Label:** value` paragraphs, the converter produces correct `<p>` blocks, but readers may still perceive them as one block of metadata unless an `<hr/>` divider follows. Add the `---` divider in source to translate to `<hr/>` in storage.

### Pitfall 4: Space eaten between `**Label:**` and an immediately-following inline element

**Symptom:** Source markdown has `**Test Plan Reference:** \`test_plan/path.md\`` (or `**Label:** [link](url)`) — a single space separates the bold label from the next inline element. After publishing via `content_format: markdown`, the rendered storage shows `<p><strong>Test Plan Reference:</strong><code>test_plan/path.md</code></p>` — **no space** between `</strong>` and `<code>`. The page reads "Test Plan Reference:test_plan/path.md" with the colon glued to the backtick.

**Cause:** Confluence's markdown converter discards the space when an emphasis run ends right before an inline code span or a link. The bug only triggers when the bold label is at paragraph start AND followed by an inline element (code/link); plain text after the label preserves spacing correctly. This is distinct from Pitfall 2 (which drops the code entirely) — here the code is preserved but the leading space is lost.

**Fix:** Use `content_format: storage` with an explicit space character between `</strong>` and the next inline element:

```html
<p><strong>Test Plan Reference:</strong> <a href="..."><code>test_plan/path.md</code></a></p>
```

Trying to fix this from the markdown source side (double spaces, NBSP, etc.) doesn't reliably work because the converter normalizes whitespace before parsing. Storage is the only deterministic fix. As a side benefit, the storage push lets you replace local file-path code spans with proper Confluence cross-page hyperlinks, turning a cosmetic patch into a navigation upgrade.

**Detection:** Grep the rendered storage HTML for `</strong><code>` or `</strong><a` (no space). If you find any inside a `<p>` block, the conversion ate the space.

## When to Leave It Alone

Not every page needs fixing. Report **CLEAN** when:

- The proximity is correct for the content — no two distinct groups have collided into one mass.
- The hierarchy gradient is visible at a squint — H2 reads heavier than H3 reads heavier than bold inline reads heavier than body.
- A reader can skim the page in under 30 seconds and walk away with the page's key claims.
- The author's stylistic choices (narrative prose vs structured lists) are respected. Style preference is not a defect.

**Inventing findings on a clean page is its own anti-pattern.** It trains the agent (and the human reviewer) to ignore real findings next time. CLEAN is a valid verdict — use it when it applies.
