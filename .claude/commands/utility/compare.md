# Compare — Cross-Repo Drift Detection

```
Compare shared components between the current repo and a remote repo to detect drift and propose backport issues.

Arguments: {{input}}
  - <remote-repo-path>                Full analysis of all shared components
  - <remote-repo-path> --issue        Also create GitHub issues in the remote repo for backport items

Examples:
  /compare /home/user/src/ollama37
  /compare /home/user/src/test-framework-template --issue

## Important Rules

1. This command relies on YOUR judgment as an AI agent — there is no manifest file
2. Read both repos' structure and CLAUDE.md to understand what each repo does
3. Determine shared components by understanding PURPOSE, not just matching file names
4. Two files that serve the same purpose but have different paths, names, or adaptations ARE the same component
5. Show diffs, never auto-apply changes — this command is read-only
6. When creating issues (--issue), create one issue per actionable backport item
7. Respect that each repo adapts shared components to its own context — divergence is expected and healthy
8. Focus on meaningful differences (new features, bug fixes, structural improvements) not cosmetic ones (wording, formatting, project-specific values)

## Phase 1: Explore Both Repos

Explore both the current repo and the remote repo to build understanding:

### For each repo, gather:
1. **CLAUDE.md** — Read it to understand the project's purpose, workflow, and conventions
2. **Skills** — List all skill files (check `.claude/skills/`, `skills/`, or similar locations)
3. **Commands** — List all command files (check `.claude/commands/`, `commands/`, or similar locations)
4. **References** — List any shared reference docs (`.claude/references/`, `docs/`)
5. **Test framework** — Check for test framework code (`cicd/tests/`, `tests/`, or similar)
6. **Workflow docs** — Check `docs/workflows/` or similar
7. **GitHub remote** — Run `git remote -v` to get the GitHub owner/repo for issue creation

### Build a mental model of each repo:
- What is this repo for?
- What patterns does it use? (skill/command architecture, test framework, CI, etc.)
- What was likely ported FROM this repo vs ported TO it?

## Phase 2: Identify Shared Components

Using your understanding of both repos, identify components that serve the SAME PURPOSE across repos. Match by intent, not by filename.

Examples of smart matching:
- `commands/utility/evolve.md` (ai-qa-workflow) ↔ `.claude/commands/evolve.md` (ollama37) — same command, different path
- `cicd/tests/src/judge/llm-judge.ts` in both repos — same framework file
- A skill in one repo that doesn't exist in the other — candidate for backporting

### Classification
For each identified component, classify it:
- **identical** — Same purpose AND same content (no action needed)
- **diverged** — Same purpose but content differs (inspect further)
- **local-only** — Exists here but not in remote (candidate for backporting)
- **remote-only** — Exists in remote but not here (candidate for syncing)

### For diverged components, determine:
1. Which side was modified more recently: `git log -1 --format="%ci" -- <file>` in both repos
2. What the meaningful differences are (ignore project-specific adaptations like repo names, labels, IDs)
3. Whether the local or remote version has improvements worth propagating

## Phase 3: Analyze Differences

For each **diverged** component, use your judgment to assess:

1. **What changed and why** — Read the diffs, understand the intent
2. **Is this a meaningful improvement or just project-specific adaptation?**
   - Bug fix in LLM judge → meaningful, should backport
   - Different label names in /plan skill → project-specific, ignore
   - New phase added to /evolve → meaningful, should backport
   - Different example commands in a skill → cosmetic, ignore
3. **Direction** — Which repo should receive the change?
   - **backport** (local → remote) — Local has an improvement the remote should get
   - **sync** (remote → local) — Remote has an improvement we should pull
   - **diverged-ok** — Both sides adapted independently, no action needed

## Phase 4: Generate Report

Present the comparison report:

    ## Cross-Repo Comparison Report

    **Local repo:** [name] ([path])
    **Remote repo:** [name] ([path])
    **Date:** [YYYY-MM-DD]

    ### Summary
    - Components compared: [count]
    - Identical: [count]
    - Diverged: [count] (backport: N, sync: N, diverged-ok: N)
    - Local-only: [count]
    - Remote-only: [count]

    ### Actionable Items

    For each item that needs action:
    - Component name and type
    - Where it lives in each repo
    - What changed (brief, focused on the improvement)
    - Recommended direction: backport / sync
    - Priority: high (bug fix, missing feature) / low (enhancement, convenience)

    ### No Action Needed

    For each identical or diverged-ok component:
    - Component name
    - Status: identical / diverged-ok (with brief note on why divergence is fine)

## Phase 5: Create Backport Issues (only if --issue flag)

For each component that should be backported to the remote repo:

1. Determine the remote repo's GitHub owner/repo from `git remote -v` in the remote repo
2. Create a focused GitHub issue describing:
   - What improvement exists in the source repo
   - Why it's worth backporting
   - What file(s) to look at
   - Suggested approach (copy, adapt, or merge)

3. Report the created issue URLs

## Phase 6: Save Report (optional)

Ask the user if they want to save the report:
- Save to `docs/compare/[YYYY-MM-DD]_[remote-name]_compare.md`
```
