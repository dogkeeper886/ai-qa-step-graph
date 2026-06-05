# STORY-002: Automated tests for the repo, run in CI on every change

## User Story

As a developer of this repo,
I want a test framework wired to **GitHub Actions CI/CD**,
So that every change is verified automatically before it merges, instead of relying on manual checks I might skip.

## The Need

This repo will hold real, load-bearing code — the MCP server, the pgvector queries, and the embedding/lookup logic the whole semantic approach (STORY-001) depends on. If that breaks **silently**, the agent's step lookups go wrong and nobody notices until someone trusts a bad result. The user wants a **test framework** that exercises the repo's behaviour, and **GitHub Actions** to run it on every push / pull request — so green means "this still works," and a regression is caught **at the PR**, not in use. (The repo was scaffolded from a dual-judge test-framework template, so a framework already exists to adopt or adapt — not to build from scratch.)

## Success Looks Like

- On every push / pull request, the test suite **runs automatically** in GitHub Actions, and pass/fail is visible on the PR.
- A failing test is **surfaced and gates the merge** — you can't quietly merge red.
- A developer can **add a new test** without fighting the framework.
- **Local and CI agree** — running the tests on a laptop gives the same verdict as CI ("works on my machine" doesn't happen).

## Open Questions

*(The "how" — worked out on the issue.)*

- **Which framework:** adopt the template's **dual-judge (Simple + LLM)** framework as-is, or add a conventional runner for the MCP server's language?
- **What's tested first:** the STORY-001 MCP ↔ pgvector channel? Unit vs integration — and does CI need to **spin up Postgres + pgvector** (a service container) and seed it?
- **GitHub Actions specifics:** triggers (push/PR), OS/matrix, secrets for the DB, required-check / branch-protection gating.
- **Local ↔ CI parity:** is the local entry point (Makefile) the same path CI runs?
- **What "pass" means for semantic behaviour:** deterministic asserts vs LLM-judged results — where the dual-judge actually fits for meaning-based lookups.

## Status

- Created: 2026-06-05
- Issues: #35 (assert-first harness), #36 (CI w/ Postgres+pgvector), #37 (AI log-reviewer for failures), #38 (gate merges), #16 (local↔CI parity, re-homed from STORY-003)

### Direction (settled on the issues)

- Pass/fail is **deterministic asserts** — the embedding + 0.35 threshold already turns "meaning" into a number, so the bundled dual-judge **and** simple-judge are trimmed; the verdict is step-level asserts.
- The **only** LLM use is an **on-fail** log-reviewer (#37) — advisory triage, never the gate, built on the Anthropic SDK, with an env-var off-switch (and a clean skip when no key is configured).
- `cicd/` is ours to modify freely; keep changes backport-friendly to the upstream template.
- **Gating is manual** (#42): the CI workflows never auto-run, so there are no required status checks. The merge gate is `make ci` (suite + drift, on demand) plus human review.
