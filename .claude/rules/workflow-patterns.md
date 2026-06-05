---
paths:
  - ".github/workflows/**/*.yml"
---

# CI Workflow Patterns

## Per-Feature Workflow Pattern

Split CI into composable, independently triggerable workflows:

```
.github/workflows/
├── build.yml                # Standalone build step
├── test-run.yml             # Reusable test runner (called by feature workflows)
├── test-<feature>.yml       # One per feature (~25 lines, thin delegator)
└── ci.yml                   # Full pipeline: build -> all features in parallel
```

**Adding a new feature test:**
1. Tag test cases: `tags: [my-feature]`
2. Copy `test-feature-example.yml` -> `test-my-feature.yml`
3. Change the `tag` input value to `my-feature`
4. Add the new workflow as a job in `ci.yml`

### Suite-Based Alternative

For projects organized by test suite rather than feature:

```
.github/workflows/
├── build.yml
├── test-run.yml             # Same reusable runner
├── test-build.yml           # Uses --suite build
├── test-integration.yml     # Uses --suite integration
└── ci.yml                   # Orchestrates all suites
```

Both patterns use `test-run.yml` as the single reusable job.

## Key Design Decisions

**Dual triggers:** Each workflow supports both `workflow_dispatch` (manual, with dropdowns) and `workflow_call` (callable from pipeline). This lets you run features independently or as part of the full CI.

**Judge mode dropdown:** Each workflow offers `simple` (fast, no LLM) or `dual` (simple + LLM) judge modes via input.

## Environment Variables

Configure LLM judge via GitHub repository variables (`Settings > Variables > Actions`):

| Variable | Purpose | Example |
|----------|---------|---------|
| `LLM_JUDGE_URL` | Ollama endpoint | `http://localhost:11434` |
| `LLM_JUDGE_MODEL` | Model for judging | `llama3:8b` |

**Separate judge instance:** If your project tests an Ollama instance (e.g., on port 11434), run the LLM judge on a different port (e.g., 11435) to avoid GPU memory contention. Set `LLM_JUDGE_URL=http://localhost:11435` in your repo variables.

## Legacy Workflows

`test-pipeline.yml` and `test-suite.yml` are the original suite-based workflows. They still work but the per-feature pattern (`ci.yml` + `test-run.yml`) is recommended for projects with many test cases.
