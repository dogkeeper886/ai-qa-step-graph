# Sync — Cross-Repo Component Sync

```
Pull shared components from a remote repo into the current repo, adapting them to fit.

Arguments: {{input}}
  - <remote-repo-path>                  Sync improvements from remote
  - <remote-repo-path> --dry-run        Show what would be synced without applying

Examples:
  /sync /home/user/src/ollama37
  /sync /home/user/src/test-framework-template --dry-run

## Important Rules

1. This command relies on YOUR judgment as an AI agent — there is no manifest file
2. NEVER blindly copy files — understand both repos and ADAPT the content to fit the destination
3. NEVER auto-apply changes — show what you plan to do and ask for confirmation
4. Prefer editing existing files over overwriting — preserve local adaptations
5. Project-specific values (repo names, labels, IDs, paths) must be adapted, not copied verbatim
6. After syncing, update CLAUDE.md if new skills/commands were added
7. If a component needs significant rewriting to fit this repo, tell the user and propose the adaptation

## Phase 1: Explore and Compare

1. Read CLAUDE.md, skills, commands, and key files in BOTH repos to understand their structure
2. Run the same analysis as `/compare` — identify shared components and which ones have improvements to sync
3. Focus only on components where the remote has something worth pulling:
   - Remote has a component we don't have (new)
   - Remote has a newer/better version of something we have (update)

## Phase 2: Plan Sync

Present the sync plan:

    ## Sync Plan

    **From:** [remote-name] ([path])
    **To:** [current-repo-name] ([path])

    | # | Component | Action | What Changes |
    |---|-----------|--------|--------------|
    | 1 | evolve    | update | New phase 4 evaluation logic from remote |
    | 2 | session-summary | create | New command, needs adaptation for dev workflow |

    **Actions:**
    - **update** — File exists locally, will merge improvements from remote
    - **create** — New component, will adapt from remote and create locally
    - **adapt** — Significant rewriting needed to fit this repo's context

For each item, briefly explain:
- What the remote has that we want
- How it needs to be adapted for this repo
- Where it will go in this repo's structure

Ask the user: "Proceed with sync? (all / 1,3 / none)"

## Phase 3: Apply Sync (per-component)

For each approved component:

### For updates (file exists locally):
1. Read both the local and remote versions
2. Identify the specific improvements from the remote version
3. Apply those improvements to the LOCAL file, preserving local adaptations
4. Use the Edit tool to make surgical changes, not wholesale replacement
5. Show the user what changed

### For new components:
1. Read the remote file
2. Adapt it for this repo:
   - Replace project-specific references (repo name, labels, paths, tools)
   - Adjust workflow patterns to match this repo's conventions
   - Follow this repo's file format (check existing skills/commands for style)
3. Determine the correct local path based on this repo's structure
4. Create the file
5. Show the user the adapted version

### For adaptations (heavy rewriting):
1. Explain what the remote component does
2. Propose how it should work in this repo
3. Write the adapted version
4. Show the user for approval

## Phase 4: Post-Sync Updates

After syncing, handle integration:

1. **Update CLAUDE.md** if new skills or commands were added:
   - Add to the directory structure listing
   - Add to relevant command lists
2. **Show a summary** of what was synced:

        ## Sync Complete

        ### Applied
        | # | Component | Action | Files Changed |
        |---|-----------|--------|---------------|

        ### Skipped
        | # | Component | Reason |
        |---|-----------|--------|

3. **Remind the user** to review the changes and test
```
