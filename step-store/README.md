# step-store

STORY-001: an agent-reachable **pgvector step-store over MCP**. The agent finds and
reuses test steps *by meaning* — a step's identity is its embedding, and cosine
similarity collapses equivalent phrasings to one node.

## Decisions (issue #1)

| Choice | Decision | Why |
|--------|----------|-----|
| Transport | **both stdio + HTTP**, selectable via `MCP_TRANSPORT` | stdio is simplest for a local agent; HTTP is ready for a non-local one |
| MCP server | **purpose-built** (TypeScript, `@modelcontextprotocol/sdk`) | control over step-store semantics |
| Embedding | **local, agent-side** — `all-MiniLM-L6-v2` via Transformers.js, 384 dims, normalized | no hosted service; "runs locally" |
| Store | **Postgres + pgvector** (`pgvector/pgvector:pg17`) via Docker | local, reproducible; the store is a *derived* index |

## One-time setup

```bash
docker compose up -d          # from the repo root: Postgres + pgvector
cd step-store && npm install  # deps (downloads the embedding model on first embed)
```

The MCP connection itself is committed in [`../.mcp.json`](../.mcp.json) — once the
stack is up, the agent reaches the store every session with no per-run fiddling.

## Tools

- **`search_step(phrase, k?, max_distance?)`** → nearest confirmed step(s) by cosine
  distance, or a clear `{ "match": false }`. Cutoff defaults to `0.35` (calibrated:
  paraphrases land < 0.30, different steps > 0.50).
- **`add_step(text, conf?, src?, provenance?)`** → adds a confirmed step, findable by
  meaning on the next search.

## Commands

```bash
npm run server                       # MCP over stdio (default)
MCP_TRANSPORT=http npm run server    # MCP over HTTP on :3000 (MCP_HTTP_PORT)
npm run smoke                        # end-to-end channel test: add -> hit -> miss
npm run regen                        # rebuild the store from canonical steps/ files
npm run embed -- "a phrase"          # print the embedding dimension
```
