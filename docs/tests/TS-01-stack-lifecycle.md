---
id: TS-01
title: The step-store builds, its channel works, and meaning is searchable
namespace: ai-qa-step-graph
story: STORY-001
issue: 23
status: green
story_hash: e11ca5fb7f267ef5f51a5ed1c66f34f050e64b37c14070f1c50042b1c1dccc57
---

## Why this scenario exists

[STORY-001](../stories/STORY-001.md) is the step-store: a local-embedding pgvector
store reached over MCP, where a step's identity is its meaning. This is the worked
example of the `tests/` format and of the assert-first `cicd/` suite that guards the
store — the project builds, the agent↔store channel works, and a stored step is
findable by a paraphrase. Each case binds to the `cicd/` executable that runs it.

### TC-01: Project typechecks

- **Objective:** the step-store compiles with no type errors.
- **Script:** cicd/tests/testcases/build/TC-BUILD-001.yml
- **Preconditions:** Node and npm available.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Typecheck the step-store (`npx tsc --noEmit`) | compiles with no `error TS` output |

### TC-02: The agent↔store channel works

- **Objective:** add a step, find it by a paraphrase, miss an unrelated phrase.
- **Script:** cicd/tests/testcases/integration/TC-INTEGRATION-001.yml
- **Preconditions:** the stack is up (`make up`).

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Run the smoke test over MCP (`npm run smoke`) | prints `SMOKE PASSED` |

### TC-03: Steps are findable by meaning

- **Objective:** ingest the test docs, then find a stored step by a paraphrase.
- **Script:** cicd/tests/testcases/e2e/TC-E2E-001.yml
- **Preconditions:** the stack is up.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Index the test docs into the store (`npm run load-tests`) | reports `indexed N step(s)` |
| 2 | Search the store for the smoke step (`make query`) | a paraphrase returns that step as the nearest match, under the distance threshold |
