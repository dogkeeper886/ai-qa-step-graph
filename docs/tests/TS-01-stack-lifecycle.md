---
id: TS-01
title: Stack builds and runs its lifecycle
namespace: ai-qa-step-graph
story: STORY-003
issue: 23
status: green
story_hash: 7474d8b616f08319cc4a6f3913471ceba9e548161954eb7ba5ab86dd243d5793
---

## Why this scenario exists

[STORY-003](../stories/STORY-003.md) made the step-store stack operable with a
single lifecycle (`make up` / `down` / `clean` / `status`). This scenario verifies that
chain end to end: the project builds, the services come up healthy, and the stack tears
back down cleanly. It is the worked example for the `docs/tests/` format — three cases, each
bound to an existing `cicd/` executable.

### TC-01: Project build verification

- **Objective:** the project builds from a clean checkout.
- **Script:** cicd/tests/testcases/build/TC-BUILD-001.yml
- **Preconditions:** Node and npm available on the runner.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Run `node --version` | prints a `vNN.NN.NN` version string |
| 2 | Run `npm install` | dependencies install without error |
| 3 | Run `npm run build` | build completes with no `error` / `failed` output |

### TC-02: Services start and respond healthy

- **Objective:** the stack comes up and answers a health check.
- **Script:** cicd/tests/testcases/integration/TC-INTEGRATION-001.yml
- **Preconditions:** Docker available; TC-01 passed.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Start the services (`docker compose up -d`) | containers start |
| 2 | Wait for services to settle | — |
| 3 | Probe the health endpoint | responds `ok` / `healthy` (or is cleanly skipped) |

### TC-03: End-to-end flow and cleanup

- **Objective:** the end-to-end flow runs and the stack tears down cleanly.
- **Script:** cicd/tests/testcases/e2e/TC-E2E-001.yml
- **Preconditions:** TC-02 passed (services up).

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Run the e2e flow (`npm run test:e2e`) | the suite executes (or is cleanly skipped) |
| 2 | Tear the stack down (`docker compose down`) | containers and networks are removed |
