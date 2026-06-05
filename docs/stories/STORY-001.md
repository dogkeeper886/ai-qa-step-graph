# STORY-001: The AI agent can reach the vector step-store through MCP

## User Story

As a QA engineer working through the AI agent,
I want the agent to query (and add to) the **pgvector step-store in Postgres via an MCP server**,
So that it finds and reuses steps **by meaning** — not by hand-keyed ids — making semantic step lookup something the agent can rely on every run.

## The Need

The hand-built step cache failed because it required **hand-keying meaning** — deciding that two differently-phrased steps are the same node by giving them the same id (r1-test-cases #237 / STORY-002). Meaning must be **derived, not authored**: a step's identity is its embedding, and cosine similarity collapses equivalent phrasings to one node (semantic entity resolution).

For that to be usable, the agent needs **hands on the store**. The vectors live in **Postgres + pgvector**; **MCP** is how the agent reaches them — to ask "what confirmed step means *X*?" (hit), learn there's no match (miss), and add new confirmed steps. The connection has to be **set up properly once and just work** every session — if reaching the store is flaky or manual, the whole semantic approach is unusable. This is the first brick: a dependable agent ↔ vector-store channel. Everything else (the graph, authoring-by-retrieval) sits on top.

## Success Looks Like

- Through an MCP tool, the agent submits a step phrase and gets back the **semantically nearest confirmed step(s)** from the Postgres store — or a clear "no match."
- The agent can **add a new confirmed step** through MCP, and it becomes findable by meaning on the next query.
- The channel is **stable and reproducible** — configured once, works in every new session, no per-run fiddling.
- It runs **locally** (no dependence on a hosted service), consistent with "files stay canonical" — the store can be a *derived* index.

## Open Questions

*(The "how" — worked out on the issue.)*

- **Transport: HTTP vs stdio.** Leaning HTTP (the modern MCP direction). Is stdio also needed (e.g. for a purely local agent), or is HTTP enough for the first cut? — *the main uncertainty to resolve.*
- **Which MCP server:** an existing official Postgres MCP (Supabase / Neon / pgEdge / community fork) vs a purpose-built step-store server.
- **Where embedding happens:** in-database (a pgvector vectorizer) vs agent-side before insert; which embedding model + dimensions.
- **Schema first cut:** what one "step" row holds (text, embedding, `conf`, `src`, provenance) — and whether edges/graph come now or later.
- **Auth + local setup:** securing the HTTP endpoint; running Postgres locally (Docker?).
- **Derived-index discipline:** how the store stays regenerable from canonical files (ADR-0001's "files stay canonical"), not a second source of truth.

## Status

- Created: 2026-06-05
- Issues: none
