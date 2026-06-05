---
name: reviewing-web-ui
description: |
  The paired gate for designing-web-ui: judges a RENDERED studio wireframe in
  design/wireframes/ before it feeds a build. Four passes — durable layout
  principles applied (not misapplied), completeness (every state and all dynamic
  content the driving story implies), reciprocal flow wiring (no orphans, no dead
  controls), and the load-bearing anti-hardcoding audit (literal values instead of
  tokens, one example value everywhere, components reinvented instead of composed/
  extended). The screen's needs come from the relevant docs/stories/STORY and
  00_Vision_and_Scope.md — there is no I/O-map doc here. Verdict PASS | FAIL, no
  numeric score. Not for the product's published deliverables. Floor, not ceiling.
tools: Read, Bash, Glob, Grep
disable-model-invocation: true
---

# reviewing-web-ui

The gate a coded wireframe must pass before anyone builds on it. A template can't catch
a value used out of context, a component quietly reinvented, or a screen that's missing
its empty state — **you have to look at the rendered screen and judge.** This skill
catches *misapplication*, not just absence. It is invoked deliberately, as a gate — it
doesn't fire on its own.

**The passes below are a floor, not a ceiling.** If something hurts the screen and isn't
listed, flag it. And the inverse: **a clean screen passes.** Inventing findings on a
screen that's actually fine is its own anti-pattern.

## Why this gate exists (and what it protects)

A wireframe here is meant to become the future web GUI with minimal effort — but only if
it was genuinely composed from the framework. The downstream lesson is concrete: a
frontend can reuse the wireframe's CSS verbatim **because styling is keyed by the `<qa-*>`
tag and every value comes from `tokens.css`** — no copy, no class-rename sweep, just the
same tags. That reuse breaks the moment a screen hardcodes a colour, repeats one example
size everywhere, or hand-builds chrome the framework already provides. This gate is what
keeps that single-source, tag-keyed, one-way-to-add contract intact. It is also where
the known regressions get caught: chrome (sidebar, assistant toggle) forgotten on a
hand-composed screen, and a component forked per-screen instead of extended once.

## Where the screen's contract comes from

There is **no I/O map and no design-system doc** in this repo — don't audit against one.
Derive what the screen *must* contain from:

- **The driving story** in `docs/stories/STORY-XXX.md` — its *Success Looks Like* lines
  are the states and content you check for.
- **`docs/product/00_Vision_and_Scope.md`** for product framing.

The framework you measure consistency against is `design/wireframes/` — `tokens.css`
(the single source of values), `components.css` (tag-keyed, tokens-only), `components.js`
(the 11 light-DOM elements + the one-defined-way recipe in its header), and
`components.html` (the living reference every screen's shared parts should match).

## The four passes

First, **collect scope**: the screen(s) named by the user, or the wireframes touched.
Then **view the render** — don't read the markup and assume. Serve and screenshot:

```
scripts/wireframes.sh        # serves design/wireframes/ at http://localhost:8765 (container)
```

Render with a headless browser (`google-chrome --headless` is installed here) at
`http://127.0.0.1:8765/<screen>.html?cb=<timestamp>`, wait for paint, screenshot, and
check `?theme=dark` too. Use **real, dynamic content** —
long story titles, big numbers, empty lists — not lorem; that is how you find what
breaks.

1. **Principles.** Against the layout principles the designing skill applies: is there a
   clear focal element (standing out *and* apart)? Is hierarchy carried by weight/colour
   rather than a sprawl of sizes? Is grouping legible (proximity first)? Is contrast
   sufficient in both themes? Is spacing systematic — inner tighter than outer, not one
   uniform gap everywhere? Flag *misapplication*, not just omission.
2. **Completeness.** Every input/output the story implies is present, and **every state
   is designed**: default · active/selected · empty · loading/streaming · error
   (whichever the story calls for). Does dynamic content hold up — long names, large
   counts, zero items? A happy-path-only screen is incomplete. Interaction state
   (hover/selected) must be distinct from static emphasis, not pre-painted with no active
   context.
3. **Reciprocal flow wiring / orphan check.** Every primary action, breadcrumb, and nav
   item reaches its target *or* is **intentionally inert** — flag dead controls that
   should navigate. The screen must be **reachable from existing screens**, not just
   link outward; an orphan, a one-way dead end, or an un-updated screen-set is a finding.
   Account for the current state: today only `stories.html` is built, so sidebar items
   (projects / plans / executions / settings) being inert is expected — confirm they're
   *intentionally* inert, not accidentally broken.
4. **Anti-hardcoding — the load-bearing pass.** Walk the screen and, for each value, ask:
   *justified by a principle + the content, or copied?* Watch for:
   - **Literal colours/sizes** in a screen-local `<style>` or inline, instead of
     `tokens.css` variables. (Grep the wireframe for hex/`rgb(`/`hsl(` literals and raw
     px where a token exists.)
   - **One example value repeated everywhere** — the same padding/size/shade used
     regardless of content relationship.
   - **A reinvented or divergent component** — a screen hand-builds markup the catalog
     already provides, or forks a shared pattern. Fix is to compose the existing `<qa-*>`
     element or extend the framework the one defined way — never fork per-screen. This is
     only visible across the set, which is why a per-screen glance misses it; compare
     against `components.html`.
   - **Happy-path-only / fake depth** — missing states (covered above), or borders faking
     elevation instead of the token shadows.

   **Absence of justification is itself a finding.** A value with no principle behind it
   doesn't pass just because it looks fine in one screenshot.

## After fixes

Re-view the **rendered** result, not the edit response — trust the screen. For a change
that *should not* alter rendering (a refactor, a token swap that's meant to be visually
identical), don't eyeball it: pixel-diff against the prior render
(ImageMagick `compare -metric AE old.png new.png diff.png`, if available) and confirm
the delta is what you expected. "Looks identical" has hidden real layout shifts before.

## Report

Per screen, a short verdict and the specific findings — no numeric score.

```
<screen path> — PASS | FAIL

- [Principle]     <finding, what's misapplied and where> → <smallest fix>
- [Completeness]  <missing state / dynamic-content break> → <fix>
- [Wiring]        <orphan / dead control / un-updated screen> → <fix>
- [Hardcoding]    <literal value / repeated value / reinvented component, with the token or qa-* it should use> → <fix>
```

- **PASS** — principles applied, all states present, wired both ways, nothing hardcoded.
  Clears the screen for build. (A clean screen passes — don't manufacture findings.)
- **FAIL** — specific, fixable findings. Loops back to `designing-web-ui` with the
  critique.

End with the screen(s) reviewed and the verdict.

**Next step:** return a PASS screen to the build (`designing-web-ui` → implementation);
loop a FAIL back to the producer with this critique.

