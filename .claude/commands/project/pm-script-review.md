# Script Review — Narration & Flow Audit

Review any script (video, demo, presentation) for smooth transitions, simple language, and content value per section. Produces a structured audit with specific rewrites.

**Usage:** `/pm-script-review [SCRIPT_PATH]`

**Arguments:**
- `$ARGUMENTS` - Path to the script file to review

---

## What This Command Reviews

| Dimension | Question | Goal |
|-----------|----------|------|
| **Transitions** | Does each section flow into the next? | Viewer never wonders "why did we jump here?" |
| **Language** | Can every sentence be spoken aloud naturally? | No jargon walls, no passive voice, no stacked nouns |
| **Content value** | Does each section earn its time? | Every section teaches, shows, or moves the story forward |
| **Structure** | Does the overall arc make sense? | Clear beginning → middle → end with rising interest |

---

## Agent Instructions

### Phase 1: Read and Map

1. **Read** the script at `$ARGUMENTS`
2. **Map the structure** — list each section with:
   - Section name and time range (if given)
   - One-sentence summary of what it covers
   - Key claim or message

### Phase 2: Transition Audit

Check the **last sentence of each section** and the **first sentence of the next**:

1. **Bridge exists?** — Does the section end with a sentence that leads into the next topic?
2. **Bridge quality** — A good bridge:
   - Closes the current topic ("That handles installation.")
   - Opens the next with a question or promise ("But where do these commands actually live?")
   - Feels like natural speech, not a chapter heading
3. **Flag missing bridges** — If a section ends cold (no connection to what follows), flag it

**Common bridge patterns:**
- Question bridge: "That's the workflow. But how does the toolkit get better over time?"
- Consequence bridge: "Once that's set up, the next thing you'll want is..."
- Contrast bridge: "That works for one project. But what about ten?"

### Phase 3: Sentence-Level Language Audit

Read each sentence aloud (mentally). Flag sentences that:

| Problem | Test | Example |
|---------|------|---------|
| **Jargon wall** | 3+ technical terms in one sentence | "MCP integrates RADIUS LDAP via proxy" |
| **Noun stack** | 3+ nouns without a verb | "test management system configuration interface" |
| **Passive voice** | Subject receives action | "installation is driven by the agent" → "the agent handles installation" |
| **Filler opening** | Sentence starts with empty words | "Basically, what happens is..." → cut to the point |
| **Acronym overload** | Undefined acronym on first use | Define on first use or drop it |
| **Long sentence** | More than 25 words spoken aloud | Split into two sentences |
| **Repeat within earshot** | Same word/phrase used within 2 sentences | Vary the phrasing |

For each flagged sentence, provide:
- **Original:** the sentence as written
- **Problem:** which issue from the table above
- **Rewrite:** a simpler version

### Phase 4: Content Value Audit

For each section, evaluate:

1. **Does it earn its time?**
   - A 90-second section should deliver at least one clear takeaway
   - If you can't state the takeaway in one sentence, the section is unfocused

2. **Is it the right level of detail?**
   - Too much detail: listing every sub-feature when one example would do
   - Too little detail: making a claim without showing evidence

3. **Would the audience care?**
   - Implementation details (architecture, internal naming) rarely matter to viewers
   - Pain points and before/after comparisons always matter

4. **Is anything repeated?**
   - Same concept explained in two sections → consolidate into the stronger one
   - Same tool mentioned in passing multiple times → give it one home

Rate each section:

| Rating | Meaning |
|--------|---------|
| **Strong** | Clear takeaway, right detail level, audience cares |
| **Trim** | Good content but too long or too detailed — cut to essentials |
| **Weak** | No clear takeaway or audience won't care — cut or merge |
| **Move** | Content belongs in a different section |

### Phase 5: Structure & Arc Check

Evaluate the overall flow:

1. **Hook** — Does the intro make the viewer want to stay? First 15 seconds decide.
2. **Rising interest** — Do sections build on each other? Best order: problem → solution → proof → surprise.
3. **Strongest section placement** — The most compelling content should be in the first half, not buried at the end.
4. **Surprise moment** — Does the script include at least one unexpected result, discovery, or "I didn't expect that" moment? These keep viewers engaged.
5. **Ending** — Does the outro close with a clear call to action, not a fade-out?

If the structure needs reordering, propose a **revised section order** with rationale.

---

## Output Format

### 1. Structure Map

| # | Section | Time | Summary | Rating |
|---|---------|------|---------|--------|
| 1 | Intro | 0:00–0:45 | What the toolkit does | Strong |
| 2 | ... | ... | ... | ... |

### 2. Transition Report

| Between | Status | Suggested Bridge |
|---------|--------|-----------------|
| Intro → S1 | Good | — |
| S1 → S2 | Missing | "That handles installation. But where do these commands live?" |
| ... | ... | ... |

### 3. Language Fixes

| Section | Original | Problem | Rewrite |
|---------|----------|---------|---------|
| Intro | "connects AI coding agents with test management systems through MCP" | Jargon wall | "connects AI agents to tools like Jira and TestLink" |
| ... | ... | ... | ... |

### 4. Content Value

| Section | Rating | Recommendation |
|---------|--------|---------------|
| S5: Architecture | Weak | Cut — "thin routers" means nothing to new viewers. Fold one sentence into outro. |
| ... | ... | ... |

### 5. Recommended Structure (if changes needed)

| # | Section | Duration | What changed |
|---|---------|----------|-------------|
| ... | ... | ... | ... |

### 6. Revised Script (if requested)

If the user asks for a revised script, apply all fixes and output the full updated script.

---

## Phrase Simplification Reference

Common script jargon and their plain alternatives:

| Technical | Plain |
|-----------|-------|
| "leverages" | "uses" |
| "utilizes" | "uses" |
| "facilitates" | "helps" or "lets you" |
| "is driven by" | "the [subject] handles" |
| "diffs and syncs" | "finds what changed and updates" |
| "integrates with" | "works with" or "connects to" |
| "comprehensive" | cut — add specifics instead |
| "robust" | cut — show don't tell |
| "seamlessly" | cut — if it's seamless, the viewer will see it |
| "end-to-end" | "start to finish" or "the whole process" |

---

## When to Use

- After writing a video script, demo script, or presentation script
- Before recording — catch issues while editing is cheap
- When a script "feels off" but you can't pinpoint why
- As a second pass after `/pm-demo-content` generates presenter scripts
