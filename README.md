# ai-qa-step-graph

An **agent-reachable pgvector step-store over MCP**. A QA agent finds and reuses test
steps *by meaning* — a step's identity is its embedding, so cosine similarity surfaces
equivalent phrasings even when the wording differs. Postgres + pgvector hold the
vectors; an MCP server (`search_step` / `add_step`) is how the agent reaches them. See
[`docs/stories/`](docs/stories/) for the product stories and
[`step-store/README.md`](step-store/README.md) for the store's internals.

## Quick start

```bash
make up                 # start Postgres + pgvector + the MCP server (HTTP :3000)
make query Q="log in"   # quick semantic lookup
make down               # stop the stack
```

The first `make up` builds the MCP image and bakes in the embedding model, so it
takes a minute; later runs are fast.

## Stack commands

| Command | What it does |
|---------|--------------|
| `make up` | Start the stack (Postgres + pgvector + MCP), apply the schema idempotently, wait until healthy |
| `make down` | Stop the stack |
| `make clean` | Stop and wipe to a fresh empty state (drops the volume) |
| `make status` | Show whether the stack is up and healthy (DB reachable, MCP responding) |
| `make query Q="..."` | Quick semantic lookup against the store (default phrase: `log in`) |

## Connecting an MCP client to the step-store

The server speaks MCP over **stdio** (default, for a local agent) or **HTTP**
(`MCP_TRANSPORT=http`, what `make up` runs on `:3000`). Pick the mode that fits.

### Docker image (HTTP)

`make up` builds and runs the server as the `mcp` Compose service at
`http://localhost:3000/` — point any MCP client at that URL. To build/run it on its own:

```bash
docker build -t step-store ./step-store
docker run --rm -p 3000:3000 --add-host=host.docker.internal:host-gateway \
  -e DATABASE_URL=postgres://stepstore:stepstore@host.docker.internal:5432/stepstore step-store
```

### Run from source (dev, stdio)

```bash
cd step-store && npm install
npm run server                       # stdio (default)
MCP_TRANSPORT=http npm run server    # HTTP on :3000
```

### Claude Code (`claude mcp add`)

stdio, from source:

```bash
claude mcp add step-store -- npm --prefix step-store run server
```

HTTP, against the running container (after `make up`):

```bash
claude mcp add --transport http step-store http://localhost:3000/
```

The repo also ships a committed [`.mcp.json`](.mcp.json) that registers the stdio
server automatically when you open the project in Claude Code.

### Cursor (`mcpServers` JSON)

In `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project) — stdio from source:

```json
{
  "mcpServers": {
    "step-store": {
      "command": "npm",
      "args": ["--prefix", "step-store", "run", "server"],
      "env": { "MCP_TRANSPORT": "stdio" }
    }
  }
}
```

Or the HTTP (Docker) server, after `make up`:

```json
{
  "mcpServers": {
    "step-store": { "url": "http://localhost:3000/" }
  }
}
```

## Continuous integration

CI reuses the **same** lifecycle targets — there is no separate code path. The `tests`
workflow stands the stack up with `make up` (which fails fast via `--wait` if it can't
become healthy), runs the assert-first suite, and tears down with `make down`. The
workflows are **manual** (`workflow_dispatch`); `make ci` is the on-demand merge gate.

---

The rest of this document covers the **bundled assert-first test framework** —
the testing tooling this repo ships and uses.

A YAML-driven test runner whose verdict is **deterministic asserts** — exit codes plus
expected/rejected patterns. An LLM is used **only on failure**, as advisory log triage
(`npm run review`), and never decides pass/fail.

## Project Goal

This test framework design template was extracted from production MCP server projects to provide a **reusable testing foundation** that can be adopted by any project.

### Why This Framework?

Tests assert deterministically — exit codes, expected/rejected patterns, error detection — so the gate is fast and reproducible with no LLM in the loop. When a test *fails*, an optional on-demand log review (Anthropic SDK) suggests likely causes; it's advisory triage, never the verdict.

- **Deterministic verdict**: exit codes, expected patterns, rejected patterns, fatal-error detection
- **On-fail triage (optional)**: an LLM reads a failed test's log and surfaces likely causes — advisory, run on demand

### Design Philosophy

The framework is built around three core principles:

1. **Reusability**: Install into any project with a single command. The YAML-driven approach means tests are configuration, not code—making them accessible to developers and non-developers alike.

2. **Comprehensive Logging**: Every test execution produces detailed, timestamped logs with test markers for precise extraction. This enables effective debugging, auditing, and tracking of test history.

3. **Proper Test Design**: Tests are organized by suite (build, integration, e2e), support dependencies between test cases, and provide clear pass/fail criteria that both humans and LLMs can evaluate.

### Key Technologies

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Strict type safety and modern async/await patterns |
| **YAML** | Declarative test case definitions |
| **Anthropic SDK** | On-fail log triage (optional, advisory; points at Claude or local Ollama via `ANTHROPIC_BASE_URL`) |
| **Docker Compose** | Log collection with marker-based extraction |
| **GitHub Actions** | CI/CD pipeline orchestration |

### Notable Features

- **Assert-first verdict**: deterministic exit-code + pattern checks decide pass/fail; no LLM in the gate
- **On-fail AI log-reviewer**: `npm run review` triages failed runs (advisory, off by default)
- **YAML-Driven Tests**: Tests defined as configuration, not code
- **Tag-Based Filtering**: Filter tests by feature tag via `--tag`
- **Variable Capture**: Extract values from step output and pass to later steps via `{{variable}}`
- **Environment Variable Substitution**: Variables fall back to `process.env` for CI-friendly patterns
- **Dependency Resolution**: Tests can depend on other tests passing first
- **Log Collection with Markers**: Precise extraction of logs per test from Docker streams
- **MCP Client**: Test MCP server tools with configurable server command
- **Claude workflows**: AI-assisted dev + test authoring via the dev-workflow (`/dw-*`) and qa-workflow (`/qw-*`) command chains
- **Manual CI gate**: `make ci` (stack up + suite + drift) runs on demand; workflows are manual-trigger
- **Installable Template**: Add to any project via `make install`
- **Flexible Output**: Console (colored) and JSON formats for CI consumption

## Architecture

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TEST EXECUTION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │  YAML Files  │   testcases/build/*.yml
     │  (Test Defs) │   testcases/integration/*.yml
     └──────┬───────┘   testcases/e2e/*.yml
            │
            ▼
  ┌─────────────────────┐
  │     TestLoader      │  • Parse YAML test definitions
  │     (loader.ts)     │  • Validate required fields
  └─────────┬───────────┘  • Resolve dependencies
            │              • Filter by suite or tag
            ▼
  ┌─────────────────────┐
  │   Dependency Sort   │  • Topological sort by dependencies
  │                     │  • Secondary sort by priority
  └─────────┬───────────┘  • Auto-include cross-suite deps
            │
            ▼
  ┌─────────────────────┐     ┌──────────────────┐
  │    TestExecutor     │────▶│   LogCollector   │
  │   (executor.ts)     │     │ (log-collector)  │
  └─────────┬───────────┘     └────────┬─────────┘
            │                          │
            │  • Run shell commands    │  • docker compose logs
            │  • Capture stdout/stderr │  • Test markers
            │  • Check patterns        │  • Per-test extraction
            │  • Substitute variables  │
            │    (captured + env vars) │
            ▼                          ▼
     ┌─────────────────────────────────────┐
     │            TestResult[]             │
     │  (exit codes, logs, timing, etc.)   │
     └─────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       DETERMINISTIC VERDICT (verdict.ts)                      │
├──────────────────────────────────────────────────────────────────────────────┤
│   exit code == 0  ·  expected patterns found  ·  no rejected patterns  ·      │
│   no fatal-error markers        →  pass / fail   (no LLM in the gate)         │
│                                                                              │
│   on failure (optional, advisory):  review-log.ts → LLM triages the log      │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │       Reporters        │
                    ├────────────────────────┤
                    │ ConsoleReporter        │  Colored terminal output
                    │ JsonReporter           │  Structured JSON files
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    Final Results       │
                    ├────────────────────────┤
                    │ results/               │
                    │ ├── summary.json       │
                    │ ├── TC-*.json          │
                    │ └── TC-*.log           │
                    └────────────────────────┘
```

### Why assert-first?

The verdict is deterministic, so the gate is fast, reproducible, and needs no model or network. Each step declares what must (and must not) appear, and a test passes only when every step exits 0, every expected pattern is found, no rejected pattern appears, and no fatal-error marker shows up.

| Check | Decided by |
|-------|------------|
| Command exits non-zero | exit code |
| A required string is missing | `expectPatterns` |
| A forbidden string appears (`Error`, a bad value, …) | `rejectPatterns` |
| A crash leaks into the logs | fatal-error scan (`panic:`, `FATAL`, segfault, OOM) |

When a meaning-based check can't be reduced to a pattern, encode it as a numeric assert instead (e.g. this repo asserts semantic search by *cosine distance < threshold*). The one place an LLM helps is **after a failure**: `npm run review` reads the failed test's log and suggests likely causes — advisory triage, never the verdict.

## Quick Start

Install with `make install`, then configure:

```bash
cd /path/to/test-framework-template
make install TARGET=/path/to/your/project NAME=your-project
cd /path/to/your/project/cicd/tests
npm install
# Then edit config.ts manually
```

Additional Makefile commands:

```bash
make help                                    # Show usage
make uninstall TARGET=/path/to/project       # Remove framework from project
```

## Configuration

Edit `cicd/tests/src/config.ts` in your project:

```typescript
// Extend with custom suite names for your project
export const SUITES: string[] = ['build', 'integration', 'e2e'];

export const CONFIG = {
  projectName: 'your-project',
  sessionPrefix: 'test-session',
  defaultTimeout: 60000,
  defaultStepTimeout: 30000,
  logs: { cleanupAge: 24 * 60 * 60 * 1000, maxBuffer: 50 * 1024 * 1024 },
};

// Fatal-error markers scanned in logs (narrow on purpose — explicit
// rejectPatterns on a step are the right tool for a specific forbidden string)
export const ERROR_PATTERNS: RegExp[] = [
  /segmentation fault/i,
  /out of memory/i,
  /\bpanic:/i,
  /\bFATAL\b/,
  // Add your patterns...
];
```

### Environment Variables

The on-fail log-reviewer (`npm run review`) is configured by environment, not source:

| Variable | Purpose | Default |
|----------|---------|---------|
| `AI_REVIEW` | set to `off` to disable the reviewer entirely | (on) |
| `AI_REVIEW_MODEL` | model for triage | `claude-opus-4-8` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` | credential — with none set, the reviewer skips cleanly | — |
| `ANTHROPIC_BASE_URL` | point at a local Anthropic-compatible endpoint, e.g. Ollama `http://localhost:11434` | Anthropic API |

## Running Tests

```bash
cd your-project/cicd/tests

npm test                    # Run all tests (assert-first; deterministic)
npm test -- --suite build   # Run a specific suite
npm test -- --id TC-001     # Run a specific test
npm test -- --tag auth      # Run tests tagged 'auth'
npm test -- --dry-run       # Preview what would run
npm run list                # List available tests
npm run list -- --tag auth  # List tests by tag

npm run review              # On a failed run: AI log triage (advisory, optional)
```

## CI

CI runs **on demand** — no workflow auto-runs in this repo:

- `.github/workflows/tests.yml` — stands up Postgres+pgvector and runs the suite (manual / `workflow_dispatch`).
- `.github/workflows/qa-drift.yml` — file-only story↔test drift + binding gate (manual).
- `make ci` — the local merge gate: stack up → suite → drift, on demand.

There are no required status checks; a green `make ci` plus human review is the gate.

## MCP Testing

For MCP server projects, `mcp-client.ts` spawns your server and calls tools:

```bash
# Configure your server command
export MCP_SERVER_COMMAND="node dist/mcpServer.js"

# Test a tool directly
npx tsx cicd/tests/src/mcp-client.ts get_venues '{}'

# Use in YAML test cases
```

```yaml
steps:
  - name: Query venues
    command: npx tsx cicd/tests/src/mcp-client.ts get_venues '{}'
    expectPatterns:
      - "totalCount"
    rejectPatterns:
      - "isError"
```

Requires `@modelcontextprotocol/sdk` (install in your project: `npm install @modelcontextprotocol/sdk`).

## Claude workflows

AI-assisted workflows via Claude Code slash commands:

| Workflow | Purpose |
|----------|---------|
| `/dw-*` (dev-workflow) | Drive a story through tasks → implement → PR → merge |
| `/qw-*` (qa-workflow) | Author and guard the test docs: plan → cases → bind → drift |
| `reviewing-artifacts` | Review the tooling itself — commands, skills, and project docs |

These live in `.claude/commands/` and `.claude/skills/`.

## Writing Test Cases

Create YAML files in `cicd/tests/testcases/<suite>/`:

```yaml
id: TC-BUILD-001
name: Project Build
suite: build
priority: 1
timeout: 60000
dependencies: []
tags: [build, compile]

steps:
  - name: Install dependencies
    command: npm install
    timeout: 60000
    
  - name: Run build
    command: npm run build
    expectPatterns:
      - "Successfully compiled"
    rejectPatterns:
      - "error"

criteria: |
  Verify the project builds without errors.
```

### Tags

Tags enable filtering a run to a subset of cases:

```yaml
tags: [auth, api]          # Feature tags
tags: [build, compile]     # Suite-aligned tags
tags: [smoke]              # Test category tags
```

### Variable Capture

Steps can capture values from JSON output and pass them to later steps using `{{variable}}` substitution. Variables resolve from captured step output first, then fall back to `process.env`:

```yaml
id: TC-INT-002
name: Create and verify resource
suite: integration
goal: Verify resource creation and retrieval
timeout: 30000
dependencies: []
tags: [api, resources]

steps:
  - name: Create resource
    command: curl -s -X POST http://localhost:3000/api/resources -d '{"name":"test"}'
    expectPatterns:
      - "id"
    capture:
      resourceId: "id"

  - name: Verify resource exists
    command: curl -s http://localhost:3000/api/resources/{{resourceId}}
    expectPatterns:
      - "test"

criteria: |
  Resource is created and can be retrieved by ID.
```

**Capture paths** support dot-notation and array find syntax:

| Path | Resolves to |
|------|------------|
| `id` | `response.id` |
| `data.name` | `response.data.name` |
| `items[0].id` | First element's `id` |
| `data[name=foo].id` | First element in `data` where `name === "foo"` |
| `$[type=user].email` | Root array find where `type === "user"` |

MCP tool responses (double-encoded JSON in `content[0].text`) are automatically unwrapped before capture.

## Directory Structure

```
your-project/
├── CLAUDE.md                    # AI agent guidance
├── .claude/
│   ├── commands/                # AI-assisted workflows
│   │   ├── dev-workflow/        # /dw-* — story → tasks → implement → PR → merge
│   │   └── qa-workflow/         # /qw-* — plan → cases → bind → drift
│   ├── skills/                  # reviewing-artifacts (+ phrasing, typography)
│   └── rules/                   # Context-aware rules
│       ├── test-yaml-format.md  # YAML schema reference
│       └── workflow-patterns.md # CI workflow design patterns
├── cicd/
│   ├── tests/
│   │   ├── src/
│   │   │   ├── config.ts        # ← Configure here
│   │   │   ├── cli.ts
│   │   │   ├── types.ts
│   │   │   ├── loader.ts
│   │   │   ├── executor.ts
│   │   │   ├── mcp-client.ts    # MCP tool client (optional)
│   │   │   ├── log-collector.ts
│   │   │   ├── judge/
│   │   │   └── reporter/
│   │   ├── testcases/
│   │   │   ├── build/           # ← Your tests
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── scripts/
│   │   └── format-results.sh
│   └── results/
└── .github/workflows/
    ├── tests.yml               # assert-first suite on a real stack (manual)
    └── qa-drift.yml            # story↔test drift + binding gate (manual)
```

## License

MIT
