# Review TestLink Sync

```
Verify what a TestLink sync actually produced — does TestLink now match the local
test case source, and is it formatted and classified correctly?

Suite ID or Test Plan ID: $ARGUMENTS
Local Source: (the project's test case files + testlink_mapping.md, if present)
```

## Purpose

The paired review for the TestLink producers — `tl-create-*`, `tl-update-*`, `tl-sync`,
and the `syncing-testlink` skill. Those **push** local test cases into TestLink; this
**checks** that what landed there is complete, faithful, and ready to execute. Run it
after a sync and before execution.

It reads back from TestLink (it does not write) and compares against the local files.
Like its sibling reviews it ends with a verdict, not a score; fixes are applied by the
producers (`tl-update-case` / `tl-sync`), only after approval.

## When to Use

- After `/tl-sync`, `/tl-create-case`, or the `syncing-testlink` skill
- Before `/tl-execute-case` / executing a plan — confirm TestLink is trustworthy first

## Inputs

1. A TestLink **suite ID** (review every case in the suite) or **test plan ID** (review
   the plan's cases + assignments).
2. The **local test case source** the sync was built from (markdown files; and
   `testlink_mapping.md` if the project has one).

If neither the TestLink scope nor the local source can be resolved, stop and ask.

## What to Check

Read each TestLink case back (`tl-get-case` / `tl-list-cases` / `tl-get-cases-for-plan`)
and compare to the local source.

### 1. Coverage
- [ ] Every local test case exists in TestLink — none missing
- [ ] No orphan cases in the suite that aren't in the local source (flag for the user)
- [ ] If `testlink_mapping.md` exists, its IDs match the actual external IDs in TestLink

### 2. Fidelity (content matches the source)
- [ ] Name, summary, and preconditions match the local file
- [ ] Every step's action and expected result is present — no truncation, no
      "simplified" or summarized content standing in for the detailed source
- [ ] Step count and order match

### 3. Formatting (per `/tl-format`)
- [ ] HTML formatting intact — `<p>`, `<ul><li>`, `<strong>` where the rules call for them
- [ ] No raw markdown (`*`, `-`, `#`, backticks) leaked into TestLink fields
- [ ] HTML entities (`&gt;`, `&lt;`, `&amp;`, …) rendered, not doubled or raw

### 4. Classification
- [ ] Importance set correctly (1=Low, 2=Medium, 3=High — per `tl-create-case`)
- [ ] `execution_type` and `status` as intended (e.g. manual / final)

### 5. Plan + Assignment (when reviewing a test plan)
- [ ] Every intended case is added to the plan
- [ ] Cases assigned to the right tester / build, where assignment was intended

## Report

Per case, a short verdict and the specific findings — no numeric score.

```
<test case ID / name> — PASS | REVISE

- [<section #>] <finding, e.g. "step 3 expected result truncated in TestLink"> → <fix>
```

End with a summary: cases reviewed, PASS count, REVISE count, and findings by section.
A clean sync is reported as clean — don't invent findings.

## Fixing

Wait for human approval of the report. Then re-push the affected cases through
`/tl-update-case` or `/tl-sync` (this command does not write to TestLink). Re-run this
review after fixes and confirm the changes landed.

## API Notes

- Read-only here: `testlink-mcp` get/list/read calls (`tl-get-case`, `tl-list-cases`,
  `tl-get-cases-for-plan`, `tl-read-execution` as needed)
- Use generic placeholders in any example (`PROJ-NNNNN`) — never real ticket IDs
