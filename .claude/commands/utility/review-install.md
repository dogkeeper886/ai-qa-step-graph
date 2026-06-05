# Review Install — Tiered Command/Skill Audit

```
Audit the home-level and project-level command/skill installation for duplicates, misplacements, and drift.

Arguments: {{input}}
  - (empty)              Review current project against home level
  - all                  Review ALL projects in ~/src/ against home level
  - <project-path>       Review a specific project against home level
  - --fix                Remove duplicates after presenting the report (with user confirmation)

Examples:
  /review-install
  /review-install all
  /review-install /home/user/src/my-project
  /review-install --fix

## Tier Design

Commands and skills are organized in two tiers:

### Tier 1: Home level (~/.claude/commands/, ~/.claude/skills/)
- Available in EVERY project automatically
- Universal commands: workflow, utility, cross-repo tools
- Source of truth: ai-qa-workflow (commands/utility/ and commands/dev-workflow/)

### Tier 2: Project level (.claude/commands/, .claude/skills/)
- Available only in that project
- Project-specific commands that reference project-specific paths, tools, or patterns
- Must NOT duplicate home-level commands

### Decision Rule
A command belongs at HOME level if:
- It works in any project without modification
- It has no project-specific paths, tool names, or workflow patterns baked in

A command belongs at PROJECT level if:
- It references project-specific directories (e.g., `cicd/tests/`, `src/services/`)
- It references project-specific tools (e.g., MCP tools, CUDA, llama.cpp)
- It has project-adapted workflow patterns (e.g., different phase taxonomy)

## Important Rules

1. This command is read-only unless --fix is specified
2. When comparing files, match by PURPOSE not just filename
3. A project command that is 90%+ identical to a home command is a duplicate — minor wording differences don't justify keeping both
4. A project command with meaningful project-specific adaptations (different workflow taxonomy, project-specific paths/tools) is NOT a duplicate — it's a valid adaptation
5. Home level wins when same-name commands exist at both levels — project-level copy is unreachable and should be removed

## Phase 1: Scan Installations

### 1a. Home level
- List all files in ~/.claude/commands/
- List all skills in ~/.claude/skills/ (if any)
- Read ~/.claude/CLAUDE.md for the tier design documentation

### 1b. Project level
For each project being reviewed:
- List all files in .claude/commands/
- List all skills in .claude/skills/
- Read CLAUDE.md for project context

## Phase 2: Detect Issues

For each project-level command/skill, classify it:

### Duplicate
Same name AND same purpose as a home-level command. The project version is shadowed (unreachable) or redundant.
- Evidence: diff the files — if 90%+ identical content, it's a duplicate

### Adapted
Same purpose as a home-level command but with meaningful project-specific changes.
- Evidence: diff shows project-specific paths, tools, workflow patterns
- Check: is the adaptation still needed, or has the home version become generic enough?

### Misplaced (should be at home)
A project-level command that is generic enough to work in any project.
- Evidence: no project-specific references in the file content
- Check: would other projects benefit from this command?

### Correctly placed
A project-level command with genuine project-specific content.
- Evidence: references project-specific tools, paths, or patterns

### Drifted
A home-level command that has diverged from the ai-qa-workflow source.
- Evidence: diff ~/.claude/commands/<file> against ai-qa-workflow/commands/**/<file>

## Phase 3: Generate Report

Present the report:

    ## Installation Review Report

    **Date:** [YYYY-MM-DD]
    **Home commands:** [count] in ~/.claude/commands/
    **Home skills:** [count] in ~/.claude/skills/

    ### Per-Project Results

    #### [project-name] ([path])
    | # | File | Location | Status | Action |
    |---|------|----------|--------|--------|
    | 1 | evolve.md | .claude/commands/ | Duplicate | Remove — shadowed by home ~/evolve |
    | 2 | add-tool.md | .claude/commands/ | Correctly placed | None — MCP-specific |
    | 3 | git-flow | .claude/skills/ | Misplaced? | Consider promoting to home level |

    ### Home Drift Check
    | # | Home Command | Source Match | Status |
    |---|-------------|-------------|--------|
    | 1 | evolve.md | commands/utility/evolve.md | Identical |
    | 2 | dw-plan.md | commands/dev-workflow/dw-plan.md | Drifted — home is 3 commits behind |

    ### Summary
    - Duplicates found: [count] (remove with --fix)
    - Misplaced candidates: [count] (review manually)
    - Drifted from source: [count] (update with /sync)
    - Correctly placed: [count]

## Phase 4: Fix (only if --fix flag)

For each duplicate:
1. Show the file path and what home command covers it
2. Ask for batch confirmation: "Remove N duplicates? (all / 1,3 / none)"
3. Delete confirmed files
4. If a .claude/commands/ or .claude/skills/ directory becomes empty after cleanup, remove it
5. Report what was removed

## Phase 5: Recommendations

Based on the audit, suggest:

1. **Promote to home** — Project commands that are generic enough for all projects
   - These should be contributed back to ai-qa-workflow first, then installed to home
2. **Update home from source** — Home commands that drifted from ai-qa-workflow
   - Suggest running /sync or manual copy
3. **Backport adaptations** — Project adaptations that contain improvements worth making generic
   - Suggest opening an issue in ai-qa-workflow to generalize the improvement
```
