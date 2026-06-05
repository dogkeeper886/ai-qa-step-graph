# STORY-003: One-command lifecycle for the local stack — up, down, clean, status, query

## User Story

As a developer (or the agent) operating this repo,
I want simple, memorable commands to bring the stack **up / down / clean**, check its **status**, and run a quick **query** — preferably via a **Makefile** over **containers**,
So that I can start, reset, and inspect the system in seconds without re-deriving setup every time.

## The Need

STORY-001's semantic lookup needs a running **Postgres + pgvector** and the **MCP server**; STORY-002's CI has to stand that same stack up to test it. A developer, CI, and the agent all need to **operate** that stack trivially — start it, stop it, wipe it back to a clean state for a fresh run, see at a glance whether it's healthy, and poke it with a query to confirm it actually works end-to-end.

Without a one-command path, every session re-invents the setup, manual steps get forgotten, and "configured once, works every session" (STORY-001) quietly breaks. The user prefers **Makefile targets backed by containers** so the whole thing is portable and reproducible — the same commands give the same result on any machine, and nobody has to remember a sequence.

## Success Looks Like

- **Up:** one command starts the whole stack (Postgres + pgvector + MCP), ready to use.
- **Down:** one command stops it cleanly.
- **Clean:** one command resets to a fresh, empty state — so tests and experiments start from zero.
- **Status:** one command shows whether the stack is up and **healthy** (DB reachable, MCP responding).
- **Query:** one command runs a quick semantic lookup against the store and shows the result — proving the channel works.
- It's **reproducible** — the same commands on a fresh machine produce the same outcome, with no manual steps to memorize.

## Open Questions

*(The "how" — worked out on the issue.)*

- **Make targets:** exact names/behaviour for `up` / `down` / `clean` / `status` / `query` (and whether they compose).
- **Containers:** Docker Compose vs plain Docker; one container or separate db + MCP services; persistent volume vs ephemeral (does `clean` drop the volume?).
- **How `query` runs at the CLI:** a target that calls the MCP, or direct SQL against pgvector — and what a useful default query/output is.
- **How `status` checks health:** container health + DB reachable + MCP endpoint responding.
- **Local ↔ CI reuse:** does CI (STORY-002) call the same `up`/`down`, so dev and CI can't drift?

## Status

- Created: 2026-06-05
- Issues: #12, #13, #14, #15, #17 (#16 re-homed to STORY-002 — it's the local↔CI parity task)
