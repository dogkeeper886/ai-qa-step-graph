---
name: reviewing-phrasing
description: |
  Reviews the words of a published text deliverable the product generates for an outside
  reader — a review email, bug report, meeting invite, demo narration, or the prose inside
  a test plan or case — for whether the phrasing fits its reader, content, tone, purpose,
  and use. The phrasing half of the typography + phrasing deliverable review
  (reviewing-typography handles the look). Use when such a deliverable is drafted or
  updated and is about to reach its reader. Judgment over checklist; floor, not ceiling.
---

# reviewing-phrasing

One reviewer for the **words** of any deliverable the product produces for an outside
reader. Its partner `reviewing-typography` judges how a page *looks*; this judges how it
*reads*. Together they are the deliverable review that `reviewing-artifacts` hands the
product's published deliverables off to. (The workflow tooling — commands, skills,
READMEs, stories — is **not** this skill's job; that goes to `reviewing-artifacts`.)

## Why this is a judgment skill, not a checklist

Good phrasing can't be frozen into a rule. The sentence that's right in a bug report is
wrong in a meeting invite; a line that lands for an engineer loses a director. There is no
fixed order and no score — read the deliverable as its **actual reader** would and decide
what helps and what hurts. Use common sense.

## What to weigh

These are **lenses, not steps** — they interact, and which bites hardest depends on the
deliverable in hand. Weigh them together, and flag anything that weakens the writing even
if it isn't named here.

- **Reader.** Who actually reads this, and what do they already know? The phrasing meets
  them there — no unexplained jargon for an outsider, no over-explaining to a peer.
- **Content.** Does it say the true, complete thing the reader needs — and only that? No
  vague filler, nothing burying the one fact that matters, no gap that forces a reply to
  ask the obvious.
- **Tone.** Does it fit the relationship and the moment? Asking for someone's time,
  reporting a defect, and inviting people each carry a different register.
- **Purpose.** The deliverable exists to move one outcome — a review granted, a bug
  understood and fixed, people in a room. Do the words drive *that*, or wander off it?
- **Usage.** How and where it's read — skimmed in an inbox, pasted into a tracker, spoken
  over a slide — shapes length, structure, and what has to come first.

## Steps

1. **Scope.** Which deliverable(s), and who the reader is. If the reader isn't clear from
   the deliverable or its context, ask before reviewing.
2. **Read it as that reader would** — once, straight through, for whether it lands.
3. **Weigh the lenses** above by judgment; note anything else that hurts the phrasing.
4. **Report** (below).
5. **Fix (if asked).** The smallest change that fixes the phrasing — keep the author's
   voice, don't rewrite what already works, don't pad. A clean deliverable gets said so,
   with no invented findings.

## Report

Per deliverable, a short verdict and specific findings — no numeric score.

```
<deliverable> — PASS | REVISE

- <what hurts the phrasing, quoted> → <smallest fix>
```

- **PASS** — fits its reader, says the right thing, drives its purpose.
- **REVISE** — specific, fixable findings (wrong register, buried point, missing fact, filler).

End with what was reviewed and the suggested next step — return to the producing unit, or
move on.
