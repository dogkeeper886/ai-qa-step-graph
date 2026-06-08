# ai-qa-step-graph

An **agent-reachable pgvector step-store over MCP**. A QA agent finds and reuses test
steps *by meaning* — a step's identity is its embedding, so cosine similarity surfaces
equivalent phrasings even when the wording differs. Postgres + pgvector hold the
vectors; an MCP server (`search_step` / `add_step`) is how the agent reaches them. See
[`docs/stories/`](docs/stories/) for the product stories and
[`step-store/README.md`](step-store/README.md) for the store's internals.

## Quick start

```bash
make install            # install npm deps (step-store + cicd/tests) — once per clone
make up                 # start Postgres + pgvector + the MCP server (HTTP :3000)
make query Q="log in"   # quick semantic lookup
make down               # stop the stack
```

The first `make up` builds the MCP image and bakes in the embedding model, so it
takes a minute; later runs are fast.

## Make commands

| Command | What it does |
|---------|--------------|
| `make install` | Install npm deps for `step-store` + `cicd/tests` (run once after cloning) |
| `make up` | Start the stack (Postgres + pgvector + MCP), apply the schema idempotently, wait until healthy |
| `make down` | Stop the stack |
| `make clean` | Stop and wipe to a fresh empty state (drops the volume) |
| `make status` | Show whether the stack is up and healthy (DB reachable, MCP responding) |
| `make query Q="..."` | Quick semantic lookup against the store (default phrase: `log in`) |

## Connecting an MCP client to the step-store

The server speaks MCP over **stdio** (default, for a local agent) or **HTTP**
(`MCP_TRANSPORT=http`, what `make up` runs on `:3000`). Pick the mode that fits.

### HTTP auth and LAN exposure

The HTTP transport **requires a bearer token** — it refuses to start without one, so
it is never silently open. `make up` generates one into a gitignored `.env` on first
run; read it back with `grep MCP_AUTH_TOKEN .env`. Every HTTP client sends it as
`Authorization: Bearer <token>` (examples below). stdio is local and needs no token.

By default the server binds to **localhost only**. To reach it from another host on a
trusted LAN, set `MCP_BIND_HOST`:

```bash
MCP_BIND_HOST=0.0.0.0 make up        # or a specific LAN IP, e.g. 192.168.1.50
```

| Variable | Purpose | Default |
|----------|---------|---------|
| `MCP_AUTH_TOKEN` | bearer token HTTP clients must send (required in http mode) | generated into `.env` by `make up` |
| `MCP_BIND_HOST` | host interface the MCP port binds to | `127.0.0.1` (localhost only) |
| `MCP_ALLOWED_ORIGINS` | extra browser origins to allow, comma-separated (localhost always allowed) | none |

> **Security.** This is the trusted-LAN tier: the token travels over **plaintext
> HTTP**, so only expose it on a wire you trust. Postgres stays bound to `127.0.0.1` —
> keep it private. Rotate the token by deleting `.env` and re-running `make up`. For a
> public server, add TLS and OAuth 2.1 (out of scope here).

### Docker image (HTTP)

`make up` builds and runs the server as the `mcp` Compose service at
`http://localhost:3000/` — point any MCP client at that URL. To build/run it on its own:

```bash
docker build -t step-store ./step-store
docker run --rm -p 3000:3000 --add-host=host.docker.internal:host-gateway \
  -e DATABASE_URL=postgres://stepstore:stepstore@host.docker.internal:5432/stepstore \
  -e MCP_AUTH_TOKEN="$(grep MCP_AUTH_TOKEN .env | cut -d= -f2)" step-store
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
claude mcp add --transport http step-store http://localhost:3000/ \
  --header "Authorization: Bearer $(grep MCP_AUTH_TOKEN .env | cut -d= -f2)"
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

Or the HTTP (Docker) server, after `make up` (send the token from `.env`):

```json
{
  "mcpServers": {
    "step-store": {
      "url": "http://localhost:3000/",
      "headers": { "Authorization": "Bearer <MCP_AUTH_TOKEN from .env>" }
    }
  }
}
```

## Continuous integration

CI reuses the **same** lifecycle targets — there is no separate code path. The `tests`
workflow stands the stack up with `make up` (which fails fast via `--wait` if it can't
become healthy), runs the assert-first suite, and tears down with `make down`. A second
workflow (`qa-drift.yml`) runs the file-only story↔test drift + binding gate. The
workflows are **manual** (`workflow_dispatch`); there are no required status checks — a
green `make ci` plus human review is the gate.

---

## Bundled test framework

A YAML-driven test runner this repo ships and uses to guard the step-store. Its verdict is
**deterministic asserts** — exit codes plus expected/rejected patterns; an LLM is used
**only on failure**, as advisory log triage (`npm run review`), and never decides pass/fail.

### Key technologies

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Strict type safety and modern async/await patterns |
| **YAML** | Declarative test case definitions |
| **Anthropic SDK** | On-fail log triage (optional, advisory; points at Claude or local Ollama via `ANTHROPIC_BASE_URL`) |
| **Docker Compose** | Log collection with marker-based extraction |
| **GitHub Actions** | CI/CD pipeline orchestration |

### Notable features

- **YAML-Driven Tests**: Tests defined as configuration, not code
- **Tag-Based Filtering**: Filter tests by feature tag via `--tag`
- **Variable Capture**: Extract values from step output and pass to later steps via `{{variable}}`
- **Environment Variable Substitution**: Variables fall back to `process.env` for CI-friendly patterns
- **Dependency Resolution**: Tests can depend on other tests passing first
- **Log Collection with Markers**: Precise extraction of logs per test from Docker streams
- **MCP Client**: Test MCP server tools with configurable server command
- **Claude workflows**: AI-assisted dev + test authoring via the dev-workflow (`/dw-*`) and qa-workflow (`/qw-*`) command chains
- **Manual CI gate**: `make ci` (stack up + suite + drift) runs on demand; workflows are manual-trigger
- **Flexible Output**: Console (colored) and JSON formats for CI consumption

### Architecture

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

### Configuration

The runner is configured in `cicd/tests/src/config.ts`:

```typescript
// Extend with custom suite names as needed
export const SUITES: string[] = ['build', 'integration', 'e2e'];

export const CONFIG = {
  projectName: 'ai-qa-step-graph',
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

#### Environment variables

The on-fail log-reviewer (`npm run review`) is configured by environment, not source:

| Variable | Purpose | Default |
|----------|---------|---------|
| `AI_REVIEW` | set to `off` to disable the reviewer entirely | (on) |
| `AI_REVIEW_MODEL` | model for triage | `claude-opus-4-8` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` | credential — with none set, the reviewer skips cleanly | — |
| `ANTHROPIC_BASE_URL` | point at a local Anthropic-compatible endpoint, e.g. Ollama `http://localhost:11434` | Anthropic API |

### Running tests

```bash
cd cicd/tests

npm test                    # Run all tests (assert-first; deterministic)
npm test -- --suite build   # Run a specific suite
npm test -- --id TC-001     # Run a specific test
npm test -- --tag auth      # Run tests tagged 'auth'
npm test -- --dry-run       # Preview what would run
npm run list                # List available tests
npm run list -- --tag auth  # List tests by tag

npm run review              # On a failed run: AI log triage (advisory, optional)
```

### MCP testing

This repo's MCP channel is exercised end-to-end by the **smoke test** — it spawns the
server over stdio (the way an agent reaches it), adds a step, finds it by a paraphrase,
and confirms an unrelated phrase misses. It's the integration case (`TC-INTEGRATION-001`):

```bash
make up                              # the smoke test needs the stack
npm --prefix step-store run smoke    # add → paraphrase hit → unrelated miss
```

The runner also ships a generic `mcp-client.ts` for ad-hoc tool calls against any MCP
server. It needs the MCP SDK, which is an **optional** peer of `cicd/tests` (install it
there first: `npm --prefix cicd/tests install @modelcontextprotocol/sdk`), then:

```bash
export MCP_SERVER_COMMAND="npm --prefix step-store run server"
npx tsx cicd/tests/src/mcp-client.ts search_step '{"phrase":"log in"}'
```

### Claude workflows

AI-assisted workflows via Claude Code slash commands:

| Workflow | Purpose |
|----------|---------|
| `/dw-*` (dev-workflow) | Drive a story through tasks → implement → PR → merge |
| `/qw-*` (qa-workflow) | Author and guard the test docs: plan → cases → bind → drift |
| `reviewing-artifacts` | Review the tooling itself — commands, skills, and project docs |

These live in `.claude/commands/` and `.claude/skills/`.

### Writing test cases

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

#### Tags

Tags enable filtering a run to a subset of cases:

```yaml
tags: [auth, api]          # Feature tags
tags: [build, compile]     # Suite-aligned tags
tags: [smoke]              # Test category tags
```

#### Variable capture

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

### Directory structure

```
ai-qa-step-graph/
├── CLAUDE.md                    # AI agent guidance
├── .claude/
│   ├── commands/                # AI-assisted workflows
│   │   ├── dev-workflow/        # /dw-* — story → tasks → implement → PR → merge
│   │   └── qa-workflow/         # /qw-* — plan → cases → bind → drift
│   ├── skills/                  # reviewing-artifacts (+ phrasing, typography)
│   └── rules/                   # Context-aware rules
│       ├── test-yaml-format.md  # YAML schema reference
│       └── workflow-patterns.md # CI workflow design patterns
├── step-store/                  # the MCP server + pgvector store
├── docs/                        # product stories + the test docs (TS-*)
├── cicd/
│   ├── tests/
│   │   ├── src/
│   │   │   ├── config.ts        # ← runner config
│   │   │   ├── cli.ts
│   │   │   ├── types.ts
│   │   │   ├── loader.ts
│   │   │   ├── executor.ts
│   │   │   ├── mcp-client.ts    # MCP tool client
│   │   │   ├── log-collector.ts
│   │   │   ├── verdict.ts       # deterministic pass/fail
│   │   │   ├── review-log.ts    # on-fail LLM triage (advisory)
│   │   │   └── reporter/
│   │   ├── testcases/
│   │   │   ├── build/
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
