---
name: designing-web-ui
description: |
  Designs a single studio screen and produces it as a coded wireframe in
  design/wireframes/ — by applying durable layout principles AND composing the
  existing qa-* component framework so the wireframe is GUI-ready (a future
  frontend reuses it, not re-creates it). A screen's needs and states come from
  the relevant docs/stories/STORY and docs/product/00_Vision_and_Scope.md — there
  is no I/O-map or design-system doc here. Target-agnostic: no vendor names; brand
  is neutral. Not for reviewing the result (that is the paired reviewing-web-ui
  gate) and not for the product's published deliverables (those go to the
  typography + phrasing review). Floor, not ceiling.
tools: Read, Write, Edit, Bash, Glob, Grep
---

# designing-web-ui

Design one studio screen, then build it as a coded wireframe in `design/wireframes/`.
The wireframe is not a throwaway picture — it is composed from the same component
framework a future web GUI will reuse, so designing it *well* is most of the work of
building it. This skill carries the **durable judgment** (portable layout principles,
anti-hardcoding); the **concrete framework** lives with the design assets in
`design/wireframes/`, not in this skill.

**The steps below are a floor, not a ceiling.** If a screen needs something not listed
— do it anyway. If a value or pattern here has drifted from what's actually in
`design/wireframes/`, trust the files.

## Why build through the framework (the parity payoff)

A wireframe here is the cheapest path to the real GUI **only if it is composed, not
hand-drawn**. The framework is built so that styling carries over to a future frontend
for free:

- **One source of values.** Every colour, space, shadow, and field treatment lives once
  in `design/wireframes/tokens.css`, behind `.theme-light` / `.theme-dark`. Nothing else
  defines a palette. Retheming is a body-class flip — never a per-component edit.
- **Styling is keyed by tag.** `components.css` styles each `<qa-*>` element by its tag
  name (`qa-app { … }`), using `tokens.css` variables only — **never literal
  colours/sizes**. A future component that emits the same tag inherits the look with no
  CSS rewrite. This tag-keyed contract is what makes the wireframe → GUI move mostly
  reuse instead of re-creation.
- **One defined way to add a component.** The recipe lives in `components.js`'s header:
  define the light-DOM element once (render on connect, config via `getAttribute`,
  escape interpolated text) → style it by tag in `components.css` with tokens only → add
  it to `components.html` so the living reference stays complete. **Don't hand-author
  shared markup in a screen — add it once, then reuse.**

So consistency happens *by construction*: the only sanctioned way to build a screen is
to compose existing `<qa-*>` elements, and the only way to add UI is to extend the
framework once. Hand-built chrome is exactly the failure mode the paired
`reviewing-web-ui` gate audits for — sidebars and toggles go missing when each screen
re-authors them, and components silently fork when each screen reinvents them.

## Where a screen's content comes from

There is **no I/O map and no design-system spec doc** in this repo — don't reference
one. A screen's job, inputs, outputs, and states are derived from:

- **The relevant story** in `docs/stories/STORY-XXX.md` — its *Success Looks Like* lines
  are the screen's required states and content. (`STORY-002`, for example, calls for a
  live-streaming thread, collapsible tool-call steps, inline decisions, an artifact
  preview, and a collapsed turn summary — each of those is a state you must design.)
- **`docs/product/00_Vision_and_Scope.md`** for the product framing — local-first,
  markdown as the source of truth, the Dev → QA → PM loop, target-agnostic core.

If the story is silent on a state the screen plainly needs, design it and say so — don't
invent product scope.

## Steps

1. **Name the screen and pull its needs.** Read the driving story and the vision doc.
   Write down, in a line each: the screen's one job, its inputs (→ fields/forms), its
   outputs (→ views/panels), and the **states** the story implies.
2. **Survey the framework before drawing anything.** Read `design/wireframes/components.html`
   (the living reference) and skim `components.js` so you know what already exists. The
   catalog today is `<qa-app> <qa-sidebar> <qa-topbar> <qa-rail> <qa-drawer> <qa-field>
   <qa-btn> <qa-toggle> <qa-gate-card> <qa-decision> <qa-md-viewer>`. Read `stories.html`
   as the worked example of a composed screen.
3. **Design by principle, not by copied numbers.** Every value you place — a size, a
   space, a weight, a shade — must be justified by a **principle** (hierarchy, proximity,
   contrast, consistency, balance, function) and the **content relationship** it serves.
   The #1 failure mode is reusing one example value everywhere; that is exactly what the
   reviewing gate flags. Establish a clear focal element (it must both stand out *and*
   stand apart); group by proximity first; let weight and colour carry hierarchy over a
   sprawl of sizes; inner spacing tighter than outer.
4. **Design the real states.** Not just the happy path: default · active/selected ·
   empty · loading/streaming (the agent runs live) · error — whichever the story implies.
   Make interaction state (hover/selected) distinct from static emphasis; don't pre-paint
   a selected row with no active context.
5. **Wire the flow — reciprocally.** Every primary action, breadcrumb, and global-nav
   item either reaches its target screen or is **intentionally inert** (and labelled so).
   Wiring is two-way: when this screen should be reachable, update the screens that link
   *to* it, not just its own outbound links. An unreachable screen is an **orphan**. Note
   that today only `stories.html` is built — sidebar items like projects / plans /
   executions / settings are legitimately inert until their screens exist; say which
   links are inert on purpose.
6. **Build it by composing the framework.** Write an `.html` file in `design/wireframes/`
   that links `tokens.css` + `components.css` + `components.js` (the script `defer`-loaded),
   sets `<body class="theme-light">`, and composes `<qa-*>` elements. A screen-local
   `<style>` block is for genuinely one-off content only (e.g. a table's
   `grid-template-columns` ratios) and must still pull from `tokens.css` variables —
   never literal colours/sizes. If a screen needs shared UI the catalog lacks, **add it
   the one defined way** (define in `components.js`, style by tag in `components.css`, add
   to `components.html`) — do not hand-author it inline.
7. **Stay target-agnostic.** No vendor names, no R1/RUCKUS strings, no Jira/Confluence/
   Jenkins coupling except as a deliberate adapter. Brand is neutral — set it per-screen
   via `qa-sidebar brand="…"`, defaulting to "AI QA Studio".
8. **Preview headless.** Serve over http (a faithful render, and the same way the review
   gate views it):

   ```
   scripts/wireframes.sh        # serves design/wireframes/ at http://localhost:8765 (container)
   ```

   Then render with a headless browser — `google-chrome --headless` is installed here
   (Chromium/Playwright work too if present) — at
   `http://127.0.0.1:8765/<screen>.html?cb=<timestamp>` (a cache-buster), wait for paint,
   and screenshot. Check `?theme=dark` too — it should re-theme with zero per-component
   work. Look at the render, not the markup.
9. **Hand off to `reviewing-web-ui`.** Don't self-certify. The paired gate audits the
   rendered screen for principles, completeness, reciprocal wiring, and hardcoding.

## Report

A short note, then the artifact and the hand-off — no numeric score.

```
<screen path> — built

- Job: <one sentence, from the story>
- States designed: default / active / empty / loading / error (mark any N/A and why)
- Composed from: <qa-* elements used> (+ any component added the one defined way)
- Wiring: <outbound links + which existing screens now link here>; intentionally inert: <…>
- Preview: <how it was rendered; theme-light + theme-dark checked>
```

End with the path(s) written or changed in `design/wireframes/`.

**Next step:** `reviewing-web-ui` — the paired completeness + reciprocal-wiring +
anti-hardcoding gate. Return a PASS screen to the build; loop a FAIL back here with the
critique.

